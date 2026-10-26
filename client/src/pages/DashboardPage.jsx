import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { StatCard } from '../components/dashboard/StatCard';
import { ProductivityChart } from '../components/dashboard/ProductivityChart';
import { StatusDistributionChart } from '../components/dashboard/StatusDistributionChart';
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonPage } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Award,
  Layers,
  Plus,
  BookOpen,
  FileText,
  Briefcase,
  FolderGit2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <SkeletonPage />;
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Error Loading Dashboard</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Button onClick={loadDashboardData} className="mt-4" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  const isBrandNewAccount =
    stats?.totalTasks === 0 &&
    stats?.recentActivities?.length === 0 &&
    !stats?.hasInternship;

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold mb-3 border border-white/10">
            <Award className="w-3.5 h-3.5" />
            <span>Internship Management Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl">
            {stats?.internshipInfo
              ? `${stats.internshipInfo.title} at ${stats.internshipInfo.company}`
              : 'Keep track of your internship deliverables, hours, and milestones.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Link to="/tasks">
            <Button size="sm" icon={Plus} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              New Task
            </Button>
          </Link>
          <Link to="/activities">
            <Button size="sm" icon={BookOpen} variant="teal">
              Log Activity
            </Button>
          </Link>
          <Link to="/report">
            <Button size="sm" icon={FileText} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Print Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Notifications / Reminders Banner */}
      {stats?.notifications && stats.notifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stats.notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${
                notif.type === 'warning'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                  : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  notif.type === 'warning' ? 'text-amber-600' : 'text-indigo-600'
                }`}
              />
              <div className="text-xs">
                <p className="font-bold">{notif.title}</p>
                <p className="mt-0.5 text-slate-600 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          subtitle={`${stats?.completedTasks || 0} marked completed`}
          icon={CheckSquare}
          color="indigo"
        />
        <StatCard
          title="Pending Tasks"
          value={stats?.pendingTasks || 0}
          subtitle={`${stats?.overdueTasks || 0} past due date`}
          icon={Clock}
          color="teal"
        />
        <StatCard
          title="Internship Progress"
          value={`${stats?.internshipProgress || 0}%`}
          subtitle={stats?.hasInternship ? 'Timeline & milestones' : 'No internship linked'}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Milestone Progress"
          value={`${stats?.overallMilestoneProgress || 0}%`}
          subtitle={`${stats?.completedMilestones || 0} of ${stats?.totalMilestones || 0} milestones`}
          icon={Layers}
          color="amber"
        />
      </div>

      {isBrandNewAccount ? (
        <EmptyState
          icon={Briefcase}
          title="Your Workspace is Ready"
          description="You haven't set up your internship details or tasks yet. Get started by entering your placement details or creating your first task!"
          actionText="Setup Internship Details"
          actionIcon={Plus}
          onAction={() => (window.location.href = '/internship')}
        />
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductivityChart data={stats?.weeklyProductivity || []} />
            <StatusDistributionChart data={stats?.taskStatusDistribution || []} />
          </div>

          {/* Activity Timeline & Upcoming Deadlines Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingDeadlines tasks={stats?.upcomingDeadlines || []} />
            <ActivityTimeline activities={stats?.recentActivities || []} />
          </div>
        </>
      )}
    </div>
  );
};
