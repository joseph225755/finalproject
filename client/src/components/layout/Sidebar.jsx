import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  BookOpen,
  FolderGit2,
  FileText,
  FileCheck2,
  User,
  Shield,
  X,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Internship', path: '/internship', icon: Briefcase },
    { name: 'Task Management', path: '/tasks', icon: CheckSquare },
    { name: 'Daily Logs', path: '/activities', icon: BookOpen },
    { name: 'Projects & Milestones', path: '/projects', icon: FolderGit2 },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Progress Report', path: '/report', icon: FileCheck2 },
    { name: 'Profile & Settings', path: '/profile', icon: User }
  ];

  const adminLinks = [
    { name: 'Admin Overview', path: '/admin', icon: Shield },
    { name: 'Student Roster', path: '/admin?tab=students', icon: Briefcase },
    { name: 'Log Moderation', path: '/admin?tab=moderation', icon: CheckSquare }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 transition-transform duration-300 ease-in-out flex flex-col justify-between border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white font-bold text-base shadow-md">
                IT
              </div>
              <div>
                <h1 className="font-bold text-white text-base tracking-tight leading-none">
                  Intern<span className="text-teal-400">Track</span>
                </h1>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                  MERN Student Portal
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div>
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Workspace
              </p>
              <nav className="space-y-1">
                {studentLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Admin section if user is admin */}
            {isAdmin && (
              <div>
                <p className="px-3 text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-2">
                  Administration
                </p>
                <nav className="space-y-1">
                  {adminLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => onClose()}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0 text-rose-400" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{user?.name || 'Student'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
