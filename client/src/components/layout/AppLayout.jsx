import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { dashboardService } from '../../services/dashboardService';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch notifications from real backend stats
    const fetchNotifications = async () => {
      try {
        const res = await dashboardService.getStats();
        if (res.stats && res.stats.notifications) {
          setNotifications(res.stats.notifications);
        }
      } catch (err) {
        // Quiet fail for layout notifications
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-300">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          notifications={notifications}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};
