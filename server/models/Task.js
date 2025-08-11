import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done'],
    default: 'todo'
  },
  dueDate: {
    type: Date
  },
  order: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [commentSchema],
  labels: [{
    name: String,
    color: String
  }],
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ board: 1, order: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });

// Virtual for comment count
taskSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for attachment count
taskSchema.virtual('attachmentCount').get(function() {
  return this.attachments.length;
});

// Virtual for assignee count
taskSchema.virtual('assigneeCount').get(function() {
  return this.assignees.length;
});

// Method to check if task is overdue
taskSchema.methods.isOverdue = function() {
  if (!this.dueDate) return false;
  return new Date() > this.dueDate && !this.isCompleted;
};

// Method to check if task is due soon (within 24 hours)
taskSchema.methods.isDueSoon = function() {
  if (!this.dueDate) return false;
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const timeDiff = dueDate - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  return hoursDiff <= 24 && hoursDiff > 0 && !this.isCompleted;
};

// Method to complete task
taskSchema.methods.complete = function(userId) {
  this.isCompleted = true;
  this.completedAt = new Date();
  this.completedBy = userId;
  this.status = 'done';
  return this;
};

// Method to uncomplete task
taskSchema.methods.uncomplete = function() {
  this.isCompleted = false;
  this.completedAt = undefined;
  this.completedBy = undefined;
  this.status = 'todo';
  return this;
};

// Method to add attachment
taskSchema.methods.addAttachment = function(attachment) {
  this.attachments.push(attachment);
  return this;
};

// Method to remove attachment
taskSchema.methods.removeAttachment = function(attachmentId) {
  this.attachments = this.attachments.filter(att => att._id.toString() !== attachmentId);
  return this;
};

// Method to add label
taskSchema.methods.addLabel = function(name, color) {
  const existingLabel = this.labels.find(label => label.name === name);
  if (!existingLabel) {
    this.labels.push({ name, color });
  }
  return this;
};

// Method to remove label
taskSchema.methods.removeLabel = function(labelName) {
  this.labels = this.labels.filter(label => label.name !== labelName);
  return this;
};

// Pre-save middleware to update completion status
taskSchema.pre('save', function(next) {
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (!this.isCompleted) {
    this.completedAt = undefined;
    this.completedBy = undefined;
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

export default Task; 