import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project must belong to a student'],
      index: true
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship'
    },
    title: {
      type: String,
      required: [true, 'Please provide the project title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true
    },
    techStack: [
      {
        type: String,
        trim: true
      }
    ],
    startDate: {
      type: Date
    },
    targetCompletionDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Completed', 'On Hold'],
      default: 'In Progress',
      index: true
    },
    repositoryUrl: {
      type: String,
      trim: true
    },
    liveUrl: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
