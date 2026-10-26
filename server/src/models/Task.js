import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a student'],
      index: true
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship'
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      index: true
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Completed'],
      default: 'To Do',
      index: true
    },
    dueDate: {
      type: Date
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Auto-set completedAt when marked Completed
taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'Completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'Completed') {
      this.completedAt = null;
    }
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
