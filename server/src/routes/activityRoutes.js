import express from 'express';
import {
  getActivities,
  createActivity,
  getActivityById,
  updateActivity,
  deleteActivity
} from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';
import { validateActivity } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getActivities);
router.post('/', validateActivity, createActivity);
router.get('/:id', getActivityById);
router.patch('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
