import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Task from '../src/models/Task.js';
import ActivityLog from '../src/models/ActivityLog.js';
import Project from '../src/models/Project.js';

let mongoServer;
let studentToken;
let studentUser;
let otherStudentToken;
let otherStudentUser;
let adminToken;
let adminUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  // Clear all collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  // Seed Primary Student
  const studentRes = await request(app).post('/api/auth/register').send({
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123!',
    studentId: 'ST-1001',
    college: 'Engineering College',
    department: 'Computer Science'
  });
  studentToken = studentRes.body.token;
  studentUser = studentRes.body.user;

  // Seed Second Student (for ownership tests)
  const otherRes = await request(app).post('/api/auth/register').send({
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'Password123!'
  });
  otherStudentToken = otherRes.body.token;
  otherStudentUser = otherRes.body.user;

  // Seed Admin user directly in DB
  adminUser = await User.create({
    name: 'Admin Supervisor',
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    role: 'admin'
  });
  const adminLoginRes = await request(app).post('/api/auth/login').send({
    email: 'admin@example.com',
    password: 'AdminPassword123!'
  });
  adminToken = adminLoginRes.body.token;
});

describe('1. Health Check Endpoint', () => {
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('InternTrack API');
  });
});

describe('2. Authentication & Authorization', () => {
  it('should reject registration with duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate Alice',
      email: 'alice@example.com',
      password: 'Password123!'
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'WrongPassword'
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow valid login and return token and safe user (without password)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'Password123!'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.email).toBe('alice@example.com');
  });

  it('should reject protected route without auth token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return current user profile on GET /api/auth/me with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe('Alice Johnson');
  });
});

describe('3. Role-Based Access Control', () => {
  it('should forbid student from accessing admin endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin user to access admin stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalStudents).toBe(2);
  });
});

describe('4. Task CRUD & Ownership Isolation', () => {
  it('should allow a student to create, get, update, and delete their own task', async () => {
    // Create Task
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Build Authentication Module',
        description: 'Implement JWT and role checks',
        priority: 'High',
        status: 'To Do',
        dueDate: new Date(Date.now() + 86400000),
        category: 'Development'
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.task.title).toBe('Build Authentication Module');
    const taskId = createRes.body.task._id;

    // Get Tasks
    const getRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.tasks.length).toBe(1);

    // Update Task
    const updateRes = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'Completed' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.task.status).toBe('Completed');
    expect(updateRes.body.task.completedAt).toBeDefined();

    // Delete Task
    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(deleteRes.status).toBe(200);
  });

  it('should PREVENT student Bob from accessing or modifying Alice’s task', async () => {
    // Alice creates a task
    const aliceTask = await Task.create({
      student: studentUser._id,
      title: 'Alice Private Task',
      priority: 'High',
      status: 'In Progress'
    });

    // Bob attempts to get Alice's task
    const getRes = await request(app)
      .get(`/api/tasks/${aliceTask._id}`)
      .set('Authorization', `Bearer ${otherStudentToken}`);
    expect(getRes.status).toBe(403);
    expect(getRes.body.success).toBe(false);

    // Bob attempts to update Alice's task
    const patchRes = await request(app)
      .patch(`/api/tasks/${aliceTask._id}`)
      .set('Authorization', `Bearer ${otherStudentToken}`)
      .send({ title: 'Hacked by Bob' });
    expect(patchRes.status).toBe(403);

    // Verify task title was NOT modified
    const checkTask = await Task.findById(aliceTask._id);
    expect(checkTask.title).toBe('Alice Private Task');
  });
});

describe('5. Daily Activity Logs CRUD', () => {
  it('should allow student to log daily activity and calculate total hours', async () => {
    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        date: new Date(),
        hoursSpent: 7.5,
        workCompleted: 'Designed normalized database schemas and API controllers',
        skillsLearned: 'Mongoose schemas, indexing, REST principles',
        challenges: 'Designing compound indexes',
        nextSteps: 'Build frontend pages'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.activity.hoursSpent).toBe(7.5);

    const listRes = await request(app)
      .get('/api/activities')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.totalHours).toBe(7.5);
  });
});

describe('6. Project & Milestone Tracking', () => {
  it('should create project and child milestone, and reflect overall progress', async () => {
    // Create Project
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'E-Commerce Microservices',
        description: 'Microservice architecture with Docker',
        techStack: ['Node.js', 'Express', 'Docker', 'Redis']
      });

    expect(projRes.status).toBe(201);
    const projectId = projRes.body.project._id;

    // Add Milestone
    const mileRes = await request(app)
      .post(`/api/projects/${projectId}/milestones`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Auth Service Deployment',
        targetDate: new Date(Date.now() + 86400000),
        completionPercentage: 100
      });

    expect(mileRes.status).toBe(201);
    expect(mileRes.body.milestone.status).toBe('Completed');

    // Retrieve Project and verify calculated progress
    const getProjRes = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(getProjRes.status).toBe(200);
    expect(getProjRes.body.project.milestoneCount).toBe(1);
    expect(getProjRes.body.project.overallProgress).toBe(100);
  });
});

describe('7. Dashboard Aggregates', () => {
  it('should return calculated metrics from actual DB records', async () => {
    // Add completed task and to-do task
    await Task.create([
      { student: studentUser._id, title: 'Task 1', status: 'Completed', priority: 'High' },
      { student: studentUser._id, title: 'Task 2', status: 'To Do', priority: 'Medium' }
    ]);

    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.stats.totalTasks).toBe(2);
    expect(res.body.stats.completedTasks).toBe(1);
    expect(res.body.stats.pendingTasks).toBe(1);
    expect(res.body.stats.weeklyProductivity).toBeDefined();
    expect(res.body.stats.weeklyProductivity.length).toBe(7);
  });
});
