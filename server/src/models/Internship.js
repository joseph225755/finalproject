import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Internship must be associated with a student'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide the internship position or role title'],
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Please provide the company or organization name'],
      trim: true
    },
    supervisorName: {
      type: String,
      required: [true, 'Please provide mentor or supervisor name'],
      trim: true
    },
    supervisorEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    supervisorPhone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      default: 'Remote',
      enum: ['Remote', 'On-site', 'Hybrid']
    },
    stipend: {
      type: String,
      default: 'Unpaid'
    },
    startDate: {
      type: Date,
      required: [true, 'Please specify the start date']
    },
    endDate: {
      type: Date,
      required: [true, 'Please specify the expected or actual end date']
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Terminated'],
      default: 'In Progress',
      index: true
    },
    description: {
      type: String,
      trim: true
    },
    objectives: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Internship = mongoose.model('Internship', internshipSchema);
export default Internship;
