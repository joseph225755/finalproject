import Milestone from '../models/Milestone.js';
import Project from '../models/Project.js';
import { verifyOwnership } from '../middleware/auth.js';

/**
 * @route   GET /api/projects/:projectId/milestones
 * @desc    Get milestones for a project
 * @access  Private
 */
export const getMilestonesByProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (!verifyOwnership(project, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these milestones.' });
    }

    const milestones = await Milestone.find({ project: req.params.projectId }).sort({ targetDate: 1 });

    res.status(200).json({
      success: true,
      count: milestones.length,
      milestones
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects/:projectId/milestones
 * @desc    Create milestone under a project
 * @access  Private
 */
export const createMilestone = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (!verifyOwnership(project, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to add milestones to this project.' });
    }

    const { title, description, targetDate, completionPercentage, status, notes } = req.body;

    const milestone = await Milestone.create({
      project: project._id,
      student: req.user._id,
      title,
      description,
      targetDate,
      completionPercentage: completionPercentage || 0,
      status: status || 'Pending',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully.',
      milestone
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/milestones/:id
 * @desc    Update milestone
 * @access  Private
 */
export const updateMilestone = async (req, res, next) => {
  try {
    let milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found.' });
    }

    if (!verifyOwnership(milestone, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this milestone.' });
    }

    Object.keys(req.body).forEach((key) => {
      milestone[key] = req.body[key];
    });

    await milestone.save();

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully.',
      milestone
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/milestones/:id
 * @desc    Delete milestone
 * @access  Private
 */
export const deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found.' });
    }

    if (!verifyOwnership(milestone, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this milestone.' });
    }

    await milestone.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
