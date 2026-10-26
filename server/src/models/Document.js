import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Document must belong to a student'],
      index: true
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship'
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Offer Letter', 'Weekly Report', 'Certificate', 'Project Documentation', 'Evaluation Sheet', 'Other'],
      default: 'Other'
    },
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      default: 'application/pdf'
    },
    fileSize: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Document = mongoose.model('Document', documentSchema);
export default Document;
