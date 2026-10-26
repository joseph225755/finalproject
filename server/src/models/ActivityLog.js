import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity log must belong to a student'],
      index: true
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship'
    },
    date: {
      type: Date,
      required: [true, 'Please specify the activity date'],
      default: Date.now,
      index: true
    },
    hoursSpent: {
      type: Number,
      required: [true, 'Please record the hours spent'],
      min: [0.25, 'Hours spent must be at least 15 minutes (0.25)'],
      max: [24, 'Hours spent cannot exceed 24 in a single day']
    },
    workCompleted: {
      type: String,
      required: [true, 'Please describe the work completed'],
      trim: true
    },
    skillsLearned: {
      type: String,
      required: [true, 'Please enter the skills or technologies learned'],
      trim: true
    },
    challenges: {
      type: String,
      trim: true,
      default: 'None'
    },
    nextSteps: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Submitted', 'Reviewed', 'Needs Revision'],
      default: 'Submitted'
    },
    mentorFeedback: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
