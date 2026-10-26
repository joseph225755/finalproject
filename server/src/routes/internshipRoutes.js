import express from 'express';
import {
  getMyInternship,
  createOrUpdateInternship,
  getInternshipById,
  updateInternship,
  deleteInternship
} from '../controllers/internshipController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All internship routes require authentication
router.use(protect);

router.get('/me', getMyInternship);
router.post('/', createOrUpdateInternship);
router.get('/:id', getInternshipById);
router.patch('/:id', updateInternship);
router.delete('/:id', deleteInternship);

export default router;
