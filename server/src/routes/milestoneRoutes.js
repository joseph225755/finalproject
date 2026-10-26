import express from 'express';
import {
  updateMilestone,
  deleteMilestone
} from '../controllers/milestoneController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.patch('/:id', updateMilestone);
router.delete('/:id', deleteMilestone);

export default router;
