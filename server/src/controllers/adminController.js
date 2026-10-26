import User from '../models/User.js';
import Internship from '../models/Internship.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import Project from '../models/Project.js';
import Milestone from '../models/Milestone.js';

/**
 * @route   GET /api/admin/stats
 * @desc    Get aggregate platform statistics for admin dashboard
 * @access  Private (Admin only)
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInternships = await Internship.countDocuments();
    const activeInternships = await Internship.countDocuments({ status: 'In Progress' });
    const completedInternships = await Internship.countDocuments({ status: 'Completed' });

    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const totalProjects = await Project.countDocuments();

    const allLogs = await ActivityLog.find({});
    const totalLoggedHours = allLogs.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);
    const pendingReviewLogs = await ActivityLog.countDocuments({ status: 'Submitted' });

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalInternships,
        activeInternships,
        completedInternships,
        totalTasks,
        completedTasks,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalProjects,
        totalLoggedHours: Number(totalLoggedHours.toFixed(1)),
        pendingReviewLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/students
 * @desc    Get list of all registered students with internship summary
 * @access  Private (Admin only)
 */
export const getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });

    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        const internship = await Internship.findOne({ student: student._id });
        const taskCount = await Task.countDocuments({ student: student._id });
        const completedTaskCount = await Task.countDocuments({ student: student._id, status: 'Completed' });
        const activityCount = await ActivityLog.countDocuments({ student: student._id });

        return {
          ...student.toSafeObject(),
          internship: internship || null,
          taskCount,
          completedTaskCount,
          activityCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: studentsWithDetails.length,
      students: studentsWithDetails
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/students/:id
 * @desc    Get complete student dossier for admin evaluation
 * @access  Private (Admin only)
 */
export const getStudentDossier = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const internship = await Internship.findOne({ student: student._id });
    const tasks = await Task.find({ student: student._id }).sort({ dueDate: 1 });
    const activities = await ActivityLog.find({ student: student._id }).sort({ date: -1 });
    const projects = await Project.find({ student: student._id });
    const milestones = await Milestone.find({ student: student._id });

    res.status(200).json({
      success: true,
      student: student.toSafeObject(),
      internship,
      tasks,
      activities,
      projects,
      milestones
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/activities/:id/moderate
 * @desc    Admin reviews and moderates student activity log
 * @access  Private (Admin only)
 */
export const moderateActivity = async (req, res, next) => {
  try {
    const { status, mentorFeedback } = req.body;

    const activity = await ActivityLog.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity log not found.' });
    }

    if (status) activity.status = status;
    if (mentorFeedback !== undefined) activity.mentorFeedback = mentorFeedback;

    await activity.save();

    res.status(200).json({
      success: true,
      message: 'Activity log updated by administrator.',
      activity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/students/:id/internship
 * @desc    Assign or override an internship record for a student
 * @access  Private (Admin only)
 */
export const assignStudentInternship = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    let internship = await Internship.findOne({ student: student._id });

    if (internship) {
      internship = await Internship.findByIdAndUpdate(
        internship._id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
    } else {
      internship = await Internship.create({
        ...req.body,
        student: student._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student internship successfully updated.',
      internship
    });
  } catch (error) {
    next(error);
  }
};
