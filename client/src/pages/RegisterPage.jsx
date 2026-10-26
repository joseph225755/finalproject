import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { User, Mail, Lock, Building, BookOpen, Hash, Phone, UserPlus } from 'lucide-react';
import { getErrorMessage } from '../services/api';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    college: '',
    department: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Valid email is required';
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentId: formData.studentId,
        college: formData.college,
        department: formData.department,
        phone: formData.phone
      });

      toast.success('Account created successfully! Welcome to InternTrack.');
      navigate('/dashboard');
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to register account.');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            IT
          </div>
          <span className="font-extrabold text-slate-900 text-2xl tracking-tight">
            Intern<span className="text-indigo-600">Track</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-slate-900 tracking-tight">
          Create Student Account
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Begin documenting and managing your college internship portfolio
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft rounded-2xl border border-slate-200/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Alex Johnson"
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="alex.johnson@edu.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="At least 6 characters"
                required
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Confirm password"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student ID / Roll No."
                name="studentId"
                icon={Hash}
                value={formData.studentId}
                onChange={handleChange}
                placeholder="e.g. CS2026-8910"
              />

              <Input
                label="Contact Phone"
                name="phone"
                icon={Phone}
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="College / Institution"
                name="college"
                icon={Building}
                value={formData.college}
                onChange={handleChange}
                placeholder="Institute of Technology"
              />

              <Input
                label="Department"
                name="department"
                icon={BookOpen}
                value={formData.department}
                onChange={handleChange}
                placeholder="Computer Science & Engineering"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" isLoading={isLoading} className="w-full" size="md" icon={UserPlus}>
                Register Student Account
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign In to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
