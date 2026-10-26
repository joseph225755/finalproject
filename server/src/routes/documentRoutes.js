import express from 'express';
import multer from 'multer';
import {
  getDocuments,
  uploadDocument,
  deleteDocument
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF, DOC, DOCX, PNG, JPG, and TXT are allowed.'));
    }
  }
});

router.use(protect);

router.get('/', getDocuments);
router.post('/', upload.single('file'), uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
