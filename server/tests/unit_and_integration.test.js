import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { verifyOwnership } from '../src/middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateTask,
  validateActivity
} from '../src/middleware/validate.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

describe('1. Health & Server Status Endpoint', () => {
  it('GET /api/health should return status ok and service identifier', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('InternTrack API');
    expect(res.body.timestamp).toBeDefined();
    expect(typeof res.body.uptime).toBe('number');
  });

  it('GET /api/undefined-endpoint should return 404 with friendly message', async () => {
    const res = await request(app).get('/api/non-existent-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not found');
  });
});

describe('2. Security & Password Hashing Logic', () => {
  it('should securely hash password with bcrypt salt and verify match', async () => {
    const rawPassword = 'SecureStudentPassword2026!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    expect(hash).not.toBe(rawPassword);
    const isMatch = await bcrypt.compare(rawPassword, hash);
    const isWrongMatch = await bcrypt.compare('WrongPassword', hash);

    expect(isMatch).toBe(true);
    expect(isWrongMatch).toBe(false);
  });

  it('should sign and verify valid JWT authentication tokens', () => {
    const secret = 'test_secret_key_1234567890_intern';
    const payload = { id: '64b1f2a3c4d5e6f7a8b9c0d1', role: 'student' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    expect(token).toBeDefined();
    const decoded = jwt.verify(token, secret);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.role).toBe('student');
  });

  it('should throw error when verifying expired or tampered JWT token', () => {
    const secret = 'test_secret_key_1234567890_intern';
    const token = jwt.sign({ id: '123' }, secret, { expiresIn: '0s' });
    expect(() => jwt.verify(token, secret)).toThrow();
  });
});

describe('3. Ownership Verification & Access Control Isolation', () => {
  const studentA = { _id: 'user_student_a_123', role: 'student' };
  const studentB = { _id: 'user_student_b_456', role: 'student' };
  const admin = { _id: 'user_admin_999', role: 'admin' };

  const studentAResource = {
    _id: 'task_001',
    student: 'user_student_a_123',
    title: 'Alice Task'
  };

  it('allows owner student to access their own resource', () => {
    expect(verifyOwnership(studentAResource, studentA)).toBe(true);
  });

  it('STRICTLY BLOCKS other students from accessing a student-owned resource', () => {
    expect(verifyOwnership(studentAResource, studentB)).toBe(false);
  });

  it('allows administrator to access any student resource for moderation', () => {
    expect(verifyOwnership(studentAResource, admin)).toBe(true);
  });
});

describe('4. Input Validation Middleware', () => {
  const createMockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('validateRegister: rejects missing name, invalid email, short password', () => {
    const next = vi.fn();
    const res = createMockRes();

    // Missing Name
    validateRegister({ body: { email: 'test@example.com', password: 'password123' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);

    // Invalid Email
    const res2 = createMockRes();
    validateRegister({ body: { name: 'John', email: 'not-an-email', password: 'password123' } }, res2, next);
    expect(res2.status).toHaveBeenCalledWith(400);

    // Short Password (< 6 chars)
    const res3 = createMockRes();
    validateRegister({ body: { name: 'John', email: 'john@example.com', password: '123' } }, res3, next);
    expect(res3.status).toHaveBeenCalledWith(400);

    // Valid Registration
    const nextValid = vi.fn();
    validateRegister({ body: { name: 'John', email: 'john@example.com', password: 'password123' } }, res, nextValid);
    expect(nextValid).toHaveBeenCalled();
  });

  it('validateLogin: rejects missing email or password', () => {
    const next = vi.fn();
    const res = createMockRes();

    validateLogin({ body: { email: '' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);

    const res2 = createMockRes();
    validateLogin({ body: { email: 'user@example.com' } }, res2, next);
    expect(res2.status).toHaveBeenCalledWith(400);
  });

  it('validateTask: validates title and status/priority enums', () => {
    const next = vi.fn();
    const res = createMockRes();

    // Missing title
    validateTask({ body: { priority: 'High' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);

    // Invalid priority
    const res2 = createMockRes();
    validateTask({ body: { title: 'Test Task', priority: 'Urgent' } }, res2, next);
    expect(res2.status).toHaveBeenCalledWith(400);

    // Valid task
    const nextValid = vi.fn();
    validateTask({ body: { title: 'Valid Task', priority: 'High', status: 'In Progress' } }, res, nextValid);
    expect(nextValid).toHaveBeenCalled();
  });

  it('validateActivity: validates work completed, skills, and hours between 0.25 and 24', () => {
    const next = vi.fn();
    const res = createMockRes();

    // Invalid hours (> 24)
    validateActivity({ body: { workCompleted: 'Done', skillsLearned: 'React', hoursSpent: 25 } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);

    // Valid activity
    const nextValid = vi.fn();
    validateActivity({ body: { workCompleted: 'Done', skillsLearned: 'React', hoursSpent: 7.5 } }, res, nextValid);
    expect(nextValid).toHaveBeenCalled();
  });
});

describe('5. Centralized Error Handler Middleware', () => {
  const createMockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = vi.fn().mockImplementation((code) => {
      res.statusCode = code;
      return res;
    });
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should format Mongoose Duplicate Key Error (code 11000)', () => {
    const res = createMockRes();
    const err = { code: 11000, keyValue: { email: 'duplicate@example.com' }, message: 'Duplicate key' };
    errorHandler(err, { method: 'POST', originalUrl: '/api/auth/register' }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('email already exists')
      })
    );
  });

  it('should format Mongoose CastError for invalid ObjectIDs', () => {
    const res = createMockRes();
    const err = { name: 'CastError', value: 'invalid_id_123', message: 'Cast to ObjectId failed' };
    errorHandler(err, { method: 'GET', originalUrl: '/api/tasks/invalid_id_123' }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Resource not found with ID of invalid_id_123')
      })
    );
  });

  it('should format JWT TokenExpiredError as 401', () => {
    const res = createMockRes();
    const err = { name: 'TokenExpiredError', message: 'jwt expired' };
    errorHandler(err, { method: 'GET', originalUrl: '/api/dashboard/stats' }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Token expired')
      })
    );
  });
});
