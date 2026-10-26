import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { User, Mail, Hash, Building, BookOpen, Phone, Lock, Shield, Save } from 'lucide-react';
import { getErrorMessage } from '../services/api';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    studentId: user?.studentId || '',
    college: user?.college || '',
    department: user?.department || '',
    phone: user?.phone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.warning('Full name cannot be empty');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await authService.updateProfile(profileData);
      toast.success('Profile updated successfully!');
      if (res.user) {
        updateUser(res.user);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.warning('Current password is required');
      return;
    }
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.warning('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to change password.'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account & Profile Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, academic affiliation, and security preferences
        </p>
      </div>

      {/* Profile Overview Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                user?.role === 'admin'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {user?.role || 'Student'}
            </span>
            <span className="text-xs text-slate-400">
              Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-5">
          Personal & Academic Details
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              icon={User}
              value={profileData.name}
              onChange={handleProfileChange}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student ID / Roll No."
              name="studentId"
              icon={Hash}
              value={profileData.studentId}
              onChange={handleProfileChange}
              placeholder="e.g. CS2026-8910"
            />

            <Input
              label="Phone Number"
              name="phone"
              icon={Phone}
              value={profileData.phone}
              onChange={handleProfileChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="College / Institution"
              name="college"
              icon={Building}
              value={profileData.college}
              onChange={handleProfileChange}
            />

            <Input
              label="Department"
              name="department"
              icon={BookOpen}
              value={profileData.department}
              onChange={handleProfileChange}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" isLoading={isUpdatingProfile} icon={Save} size="sm">
              Update Profile Details
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-5">
          Security & Password
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            icon={Lock}
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              icon={Lock}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Min 6 characters"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              icon={Lock}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="flex justify-end pt-3">
            <Button type="submit" isLoading={isChangingPassword} size="sm">
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
