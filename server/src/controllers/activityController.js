import ActivityLog from '../models/ActivityLog.js';
import { verifyOwnership } from '../middleware/auth.js';

/**
 * @route   GET /api/activities
 * @desc    Get all activity logs for current student with filters
 * @access  Private
 */
export const getActivities = async (req, res, next) => {
  try {
    const { startDate, endDate, search, status, page = 1, limit = 20 } = req.query;

    const query = { student: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { workCompleted: { $regex: search.trim(), $options: 'i' } },
        { skillsLearned: { $regex: search.trim(), $options: 'i' } },
        { challenges: { $regex: search.trim(), $options: 'i' } },
        { nextSteps: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await ActivityLog.countDocuments(query);
    const activities = await ActivityLog.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Calculate total hours logged
    const allActivities = await ActivityLog.find({ student: req.user._id });
    const totalHours = allActivities.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);

    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      totalHours: Number(totalHours.toFixed(1)),
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/activities
 * @desc    Record new daily activity log
 * @access  Private
 */
export const createActivity = async (req, res, next) => {
  try {
    const { date, hoursSpent, workCompleted, skillsLearned, challenges, nextSteps } = req.body;

    const activity = await ActivityLog.create({
      student: req.user._id,
      date: date || Date.now(),
      hoursSpent: Number(hoursSpent),
      workCompleted,
      skillsLearned,
      challenges: challenges || 'None',
      nextSteps: nextSteps || '',
      status: 'Submitted'
    });

    res.status(201).json({
      success: true,
      message: 'Daily activity log recorded successfully.',
      activity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/activities/:id
 * @desc    Get activity log by ID
 * @access  Private
 */
export const getActivityById = async (req, res, next) => {
  try {
    const activity = await ActivityLog.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity log not found.' });
    }

    if (!verifyOwnership(activity, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this activity log.' });
    }

    res.status(200).json({ success: true, activity });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/activities/:id
 * @desc    Update activity log
 * @access  Private
 */
export const updateActivity = async (req, res, next) => {
  try {
    let activity = await ActivityLog.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity log not found.' });
    }

    if (!verifyOwnership(activity, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this activity log.' });
    }

    Object.keys(req.body).forEach((key) => {
      // Don't allow student to change mentorFeedback directly
      if (req.user.role !== 'admin' && key === 'mentorFeedback') return;
      activity[key] = req.body[key];
    });

    await activity.save();

    res.status(200).json({
      success: true,
      message: 'Activity log updated successfully.',
      activity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/activities/:id
 * @desc    Delete activity log
 * @access  Private
 */
export const deleteActivity = async (req, res, next) => {
  try {
    const activity = await ActivityLog.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity log not found.' });
    }

    if (!verifyOwnership(activity, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this activity log.' });
    }

    await activity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Activity log deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
