import Task from '../models/Task.js';
import Internship from '../models/Internship.js';
import ActivityLog from '../models/ActivityLog.js';
import Project from '../models/Project.js';
import Milestone from '../models/Milestone.js';

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get aggregated dashboard stats for the authenticated student
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const now = new Date();

    // 1. Task Metrics
    const allTasks = await Task.find({ student: studentId });
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === 'Completed').length;
    const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress').length;
    const todoTasks = allTasks.filter((t) => t.status === 'To Do').length;
    const pendingTasks = todoTasks + inProgressTasks;

    const overdueTasks = allTasks.filter((t) => {
      if (t.status === 'Completed') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }).length;

    // 2. Internship Progress Percentage
    const internship = await Internship.findOne({ student: studentId });
    let internshipProgress = 0;
    if (internship && internship.startDate && internship.endDate) {
      const start = new Date(internship.startDate).getTime();
      const end = new Date(internship.endDate).getTime();
      const current = now.getTime();

      if (current >= end) {
        internshipProgress = 100;
      } else if (current > start && end > start) {
        const timeFraction = (current - start) / (end - start);
        internshipProgress = Math.min(100, Math.max(0, Math.round(timeFraction * 100)));
      }
    } else if (totalTasks > 0) {
      internshipProgress = Math.round((completedTasks / totalTasks) * 100);
    }

    // 3. Weekly Productivity (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentLogs = await ActivityLog.find({
      student: studentId,
      date: { $gte: sevenDaysAgo }
    });

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyProductivity = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayLabels[d.getDay()];

      const hoursForDay = recentLogs
        .filter((log) => {
          const logDateStr = new Date(log.date).toISOString().split('T')[0];
          return logDateStr === dateStr;
        })
        .reduce((sum, item) => sum + (item.hoursSpent || 0), 0);

      weeklyProductivity.push({
        date: dateStr,
        day: dayName,
        hours: Number(hoursForDay.toFixed(1))
      });
    }

    // 4. Task Status Distribution
    const taskStatusDistribution = [
      { name: 'To Do', value: todoTasks, color: '#94a3b8' },
      { name: 'In Progress', value: inProgressTasks, color: '#38bdf8' },
      { name: 'Completed', value: completedTasks, color: '#10b981' }
    ];

    // 5. Upcoming Deadlines (Due within next 7 days, not completed)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingDeadlines = await Task.find({
      student: studentId,
      status: { $ne: 'Completed' },
      dueDate: { $gte: now, $lte: nextWeek }
    })
      .sort({ dueDate: 1 })
      .limit(5);

    // 6. Project & Milestone Progress
    const projects = await Project.find({ student: studentId });
    const allMilestones = await Milestone.find({ student: studentId });
    const totalMilestones = allMilestones.length;
    const completedMilestones = allMilestones.filter((m) => m.status === 'Completed').length;
    const overallMilestoneProgress = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : (projects.length > 0 && projects.some(p => p.status === 'Completed') ? 100 : 0);

    // 7. Recent Activity Timeline (Latest activities + newly updated tasks)
    const recentActivities = await ActivityLog.find({ student: studentId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // 8. Notifications / Reminders
    const notifications = [];
    if (overdueTasks > 0) {
      notifications.push({
        id: 'overdue-alert',
        type: 'warning',
        title: 'Overdue Tasks Alert',
        message: `You have ${overdueTasks} overdue ${overdueTasks === 1 ? 'task' : 'tasks'} requiring attention.`
      });
    }

    // Check if task due within 48 hours
    const within48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const urgentTasks = allTasks.filter(
      (t) => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) <= within48h && new Date(t.dueDate) >= now
    );

    if (urgentTasks.length > 0) {
      notifications.push({
        id: 'urgent-due-alert',
        type: 'info',
        title: 'Approaching Deadlines',
        message: `${urgentTasks.length} task${urgentTasks.length > 1 ? 's are' : ' is'} due within the next 48 hours.`
      });
    }

    if (!internship) {
      notifications.push({
        id: 'setup-internship',
        type: 'prompt',
        title: 'Internship Profile Incomplete',
        message: 'Add your internship and company details to enable progress tracking.'
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        internshipProgress,
        overallMilestoneProgress,
        totalProjects: projects.length,
        totalMilestones,
        completedMilestones,
        weeklyProductivity,
        taskStatusDistribution,
        upcomingDeadlines,
        recentActivities,
        notifications,
        hasInternship: !!internship,
        internshipInfo: internship
          ? {
              title: internship.title,
              company: internship.company,
              startDate: internship.startDate,
              endDate: internship.endDate,
              status: internship.status
            }
          : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get recent activity stream
 * @access  Private
 */
export const getDashboardActivity = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const activities = await ActivityLog.find({ student: studentId })
      .sort({ date: -1 })
      .limit(10);

    const recentCompletedTasks = await Task.find({
      student: studentId,
      status: 'Completed'
    })
      .sort({ updatedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      activities,
      recentCompletedTasks
    });
  } catch (error) {
    next(error);
  }
};
