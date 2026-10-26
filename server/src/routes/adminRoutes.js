import express from 'express';
import {
  getAdminStats,
  getAllStudents,
  getStudentDossier,
  moderateActivity,
  assignStudentInternship
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Strict Admin Access Control
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentDossier);
router.patch('/activities/:id/moderate', moderateActivity);
router.put('/students/:id/internship', assignStudentInternship);

export default router;
