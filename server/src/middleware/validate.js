/**
 * Request validation middlewares
 */

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Full name is required.' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Valid email is required.' });
  }
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email format.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }
  next();
};

export const validateTask = (req, res, next) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Task title is required.' });
  }
  if (req.body.priority && !['Low', 'Medium', 'High'].includes(req.body.priority)) {
    return res.status(400).json({ success: false, message: 'Priority must be Low, Medium, or High.' });
  }
  if (req.body.status && !['To Do', 'In Progress', 'Completed'].includes(req.body.status)) {
    return res.status(400).json({ success: false, message: 'Status must be To Do, In Progress, or Completed.' });
  }
  next();
};

export const validateActivity = (req, res, next) => {
  const { workCompleted, skillsLearned, hoursSpent } = req.body;
  if (!workCompleted || !workCompleted.trim()) {
    return res.status(400).json({ success: false, message: 'Work completed description is required.' });
  }
  if (!skillsLearned || !skillsLearned.trim()) {
    return res.status(400).json({ success: false, message: 'Skills or technologies learned is required.' });
  }
  if (hoursSpent === undefined || isNaN(hoursSpent) || hoursSpent <= 0 || hoursSpent > 24) {
    return res.status(400).json({ success: false, message: 'Hours spent must be a number between 0.25 and 24.' });
  }
  next();
};
