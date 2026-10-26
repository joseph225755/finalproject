import Document from '../models/Document.js';
import { verifyOwnership } from '../middleware/auth.js';

/**
 * @route   GET /api/documents
 * @desc    Get all documents for the current student
 * @access  Private
 */
export const getDocuments = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { student: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { fileName: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const documents = await Document.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/documents
 * @desc    Upload or attach a project document
 * @access  Private
 */
export const uploadDocument = async (req, res, next) => {
  try {
    const { title, category, fileUrl, fileName, fileType, fileSize, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Document title is required.' });
    }

    // Handled either via uploaded file via multer or URL attachment
    let resolvedFileUrl = fileUrl;
    let resolvedFileName = fileName || 'document.pdf';
    let resolvedFileType = fileType || 'application/pdf';
    let resolvedFileSize = fileSize || 0;

    if (req.file) {
      // Validate file size (10 MB max)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (req.file.size > MAX_SIZE) {
        return res.status(400).json({ success: false, message: 'File size exceeds maximum permitted limit (10MB).' });
      }

      // Convert buffer to data URI for resilient cloud/render storage (no disk loss on restart)
      const base64 = req.file.buffer.toString('base64');
      resolvedFileUrl = `data:${req.file.mimetype};base64,${base64}`;
      resolvedFileName = req.file.originalname;
      resolvedFileType = req.file.mimetype;
      resolvedFileSize = req.file.size;
    }

    if (!resolvedFileUrl) {
      return res.status(400).json({
        success: false,
        message: 'File or document resource URL is required.'
      });
    }

    const document = await Document.create({
      student: req.user._id,
      title: title.trim(),
      category: category || 'Other',
      fileName: resolvedFileName,
      fileUrl: resolvedFileUrl,
      fileType: resolvedFileType,
      fileSize: resolvedFileSize,
      description: description || ''
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and attached successfully.',
      document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document
 * @access  Private
 */
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (!verifyOwnership(document, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this document.' });
    }

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
