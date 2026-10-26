import Task from '../models/Task.js';
import { verifyOwnership } from '../middleware/auth.js';

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for current student with filters, search, sort, and pagination
 * @access  Private
 */
export const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      category,
      project,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
      all = 'false'
    } = req.query;

    const query = { student: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (project) {
      query.project = project;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // For Kanban or views that need all items without pagination
    if (all === 'true') {
      const tasks = await Task.find(query).sort(sortOptions).populate('project', 'title');
      return res.status(200).json({
        success: true,
        count: tasks.length,
        tasks
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('project', 'title');

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, category, tags, project } = req.body;

    const task = await Task.create({
      student: req.user._id,
      title,
      description,
      priority: priority || 'Medium',
      status: status || 'To Do',
      dueDate: dueDate || null,
      category: category || 'General',
      tags: tags || [],
      project: project || null
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task details by ID
 * @access  Private
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'title');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (!verifyOwnership(task, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this task.' });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update task (fields or status)
 * @access  Private
 */
export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (!verifyOwnership(task, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this task.' });
    }

    // Assign updates
    Object.keys(req.body).forEach((key) => {
      task[key] = req.body[key];
    });

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (!verifyOwnership(task, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task.' });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
