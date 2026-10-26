import express from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import {
  getMilestonesByProject,
  createMilestone
} from '../controllers/milestoneController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

// Nested milestone routes under projects
router.get('/:projectId/milestones', getMilestonesByProject);
router.post('/:projectId/milestones', createMilestone);

export default router;
