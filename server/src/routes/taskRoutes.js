import express from 'express';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validateTask } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', validateTask, createTask);
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
