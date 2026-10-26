import Project from '../models/Project.js';
import Milestone from '../models/Milestone.js';
import { verifyOwnership } from '../middleware/auth.js';

/**
 * @route   GET /api/projects
 * @desc    Get all projects for current student with milestone completion stats
 * @access  Private
 */
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ student: req.user._id }).sort({ createdAt: -1 });

    // Enhance each project with its milestones and aggregate completion %
    const projectsWithMilestones = await Promise.all(
      projects.map(async (project) => {
        const milestones = await Milestone.find({ project: project._id }).sort({ targetDate: 1 });
        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter((m) => m.status === 'Completed').length;
        const avgPercentage = totalMilestones > 0
          ? Math.round(milestones.reduce((acc, m) => acc + (m.completionPercentage || 0), 0) / totalMilestones)
          : (project.status === 'Completed' ? 100 : 0);

        return {
          ...project.toObject(),
          milestones,
          milestoneCount: totalMilestones,
          completedMilestoneCount: completedMilestones,
          overallProgress: avgPercentage
        };
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithMilestones.length,
      projects: projectsWithMilestones
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      techStack,
      startDate,
      targetCompletionDate,
      status,
      repositoryUrl,
      liveUrl
    } = req.body;

    // Convert comma separated string or array to clean array
    let parsedTechStack = [];
    if (Array.isArray(techStack)) {
      parsedTechStack = techStack;
    } else if (typeof techStack === 'string') {
      parsedTechStack = techStack.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const project = await Project.create({
      student: req.user._id,
      title,
      description,
      techStack: parsedTechStack,
      startDate: startDate || Date.now(),
      targetCompletionDate: targetCompletionDate || null,
      status: status || 'In Progress',
      repositoryUrl: repositoryUrl || '',
      liveUrl: liveUrl || ''
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project: {
        ...project.toObject(),
        milestones: [],
        overallProgress: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID with milestones
 * @access  Private
 */
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (!verifyOwnership(project, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this project.' });
    }

    const milestones = await Milestone.find({ project: project._id }).sort({ targetDate: 1 });
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter((m) => m.status === 'Completed').length;
    const avgPercentage = totalMilestones > 0
      ? Math.round(milestones.reduce((acc, m) => acc + (m.completionPercentage || 0), 0) / totalMilestones)
      : (project.status === 'Completed' ? 100 : 0);

    res.status(200).json({
      success: true,
      project: {
        ...project.toObject(),
        milestones,
        milestoneCount: totalMilestones,
        completedMilestoneCount: completedMilestones,
        overallProgress: avgPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (!verifyOwnership(project, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project.' });
    }

    if (req.body.techStack && typeof req.body.techStack === 'string') {
      req.body.techStack = req.body.techStack.split(',').map((t) => t.trim()).filter(Boolean);
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project and its child milestones
 * @access  Private
 */
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (!verifyOwnership(project, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project.' });
    }

    // Cascade delete milestones
    await Milestone.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project and all related milestones deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
