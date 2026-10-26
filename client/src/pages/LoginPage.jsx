import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Mail, Lock, LogIn, Sparkles, Shield, User } from 'lucide-react';
import { getErrorMessage } from '../services/api';

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const fillCredentials = (email, password) => {
    setFormData({ email, password });
    setErrors({});
    toast.info(`Filled credentials for ${email}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${res.user?.name || 'User'}!`);

      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from);
      }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to log in. Please check credentials.');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            IT
          </div>
          <span className="font-extrabold text-slate-900 text-2xl tracking-tight">
            Intern<span className="text-indigo-600">Track</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-slate-900 tracking-tight">
          Sign In to Your Workspace
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Access your internship portfolio, tasks, and activity logs
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft rounded-2xl border border-slate-200/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="student@interntrack.edu"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              required
            />

            <div className="pt-2">
              <Button type="submit" isLoading={isLoading} className="w-full" size="md" icon={LogIn}>
                Sign In
              </Button>
            </div>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('student@interntrack.edu', 'StudentPass123!')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-100 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin@interntrack.edu', 'AdminSecurePass123!')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-100 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Demo
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
