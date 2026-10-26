import Internship from '../models/Internship.js';
import { verifyOwnership } from '../middleware/auth.js';

/**
 * @route   GET /api/internships/me
 * @desc    Get currently logged in student's internship
 * @access  Private
 */
export const getMyInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findOne({ student: req.user._id });
    res.status(200).json({
      success: true,
      internship: internship || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/internships
 * @desc    Create or update student's internship record
 * @access  Private
 */
export const createOrUpdateInternship = async (req, res, next) => {
  try {
    const {
      title,
      company,
      supervisorName,
      supervisorEmail,
      supervisorPhone,
      department,
      location,
      stipend,
      startDate,
      endDate,
      status,
      description,
      objectives
    } = req.body;

    const internshipData = {
      student: req.user._id,
      title,
      company,
      supervisorName,
      supervisorEmail,
      supervisorPhone,
      department,
      location,
      stipend,
      startDate,
      endDate,
      status,
      description,
      objectives
    };

    let internship = await Internship.findOne({ student: req.user._id });

    if (internship) {
      internship = await Internship.findOneAndUpdate(
        { student: req.user._id },
        { $set: internshipData },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        success: true,
        message: 'Internship details updated successfully.',
        internship
      });
    }

    internship = await Internship.create(internshipData);
    res.status(201).json({
      success: true,
      message: 'Internship details saved successfully.',
      internship
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/internships/:id
 * @desc    Get single internship by ID
 * @access  Private
 */
export const getInternshipById = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id).populate('student', 'name email studentId college department');

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship record not found.' });
    }

    if (!verifyOwnership(internship, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this internship record.' });
    }

    res.status(200).json({ success: true, internship });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/internships/:id
 * @desc    Partially update internship
 * @access  Private
 */
export const updateInternship = async (req, res, next) => {
  try {
    let internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship record not found.' });
    }

    if (!verifyOwnership(internship, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this internship.' });
    }

    internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Internship updated successfully.', internship });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/internships/:id
 * @desc    Delete internship record
 * @access  Private
 */
export const deleteInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship record not found.' });
    }

    if (!verifyOwnership(internship, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this internship.' });
    }

    await internship.deleteOne();
    res.status(200).json({ success: true, message: 'Internship record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
