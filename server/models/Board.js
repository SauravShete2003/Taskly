import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Board name is required'],
    trim: true,
    maxlength: [100, 'Board name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#6B7280' // Default gray color
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowAttachments: {
      type: Boolean,
      default: true
    },
    allowAssignments: {
      type: Boolean,
      default: true
    },
    maxTasks: {
      type: Number,
      default: 0 // 0 means unlimited
    }
  }
}, {
  timestamps: true
});

// Indexes
boardSchema.index({ project: 1, order: 1 });
boardSchema.index({ isArchived: 1 });

// Virtual for task count
boardSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'board',
  count: true
});

// Method to check if board has reached max tasks
boardSchema.methods.hasReachedMaxTasks = async function() {
  if (this.settings.maxTasks === 0) return false;
  
  const Task = mongoose.model('Task');
  const taskCount = await Task.countDocuments({ board: this._id });
  return taskCount >= this.settings.maxTasks;
};

// Method to get board with task count
boardSchema.methods.getWithTaskCount = async function() {
  const Task = mongoose.model('Task');
  const taskCount = await Task.countDocuments({ board: this._id });
  
  const boardObject = this.toObject();
  boardObject.taskCount = taskCount;
  return boardObject;
};

const Board = mongoose.model('Board', boardSchema);

export default Board; 