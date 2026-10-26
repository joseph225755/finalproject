import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Milestone must belong to a project'],
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Milestone must belong to a student'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide the milestone title'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    targetDate: {
      type: Date,
      required: [true, 'Please provide the milestone target date']
    },
    completionPercentage: {
      type: Number,
      min: [0, 'Completion percentage cannot be negative'],
      max: [100, 'Completion percentage cannot exceed 100%'],
      default: 0
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
      index: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Auto-align status if 100%
milestoneSchema.pre('save', function (next) {
  if (this.completionPercentage === 100 && this.status !== 'Completed') {
    this.status = 'Completed';
  } else if (this.completionPercentage > 0 && this.completionPercentage < 100 && this.status === 'Pending') {
    this.status = 'In Progress';
  }
  next();
});

const Milestone = mongoose.model('Milestone', milestoneSchema);
export default Milestone;
