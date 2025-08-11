import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  isPublic: {
    type: Boolean,
    default: false
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
    }
  }
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ isArchived: 1 });

// Virtual for member count
projectSchema.virtual('memberCount').get(function() {
  return this.members.length + 1; // +1 for owner
});

// Method to check if user is member
projectSchema.methods.isMember = function(userId) {
  return this.owner.equals(userId) || 
         this.members.some(member => member.user.equals(userId));
};

// Method to check if user is admin
projectSchema.methods.isAdmin = function(userId) {
  return this.owner.equals(userId) || 
         this.members.some(member => 
           member.user.equals(userId) && member.role === 'admin'
         );
};

// Method to check if user is owner
projectSchema.methods.isOwner = function(userId) {
  return this.owner.equals(userId);
};

// Method to get user role in project
projectSchema.methods.getUserRole = function(userId) {
  if (this.owner.equals(userId)) {
    return 'owner';
  }
  
  const member = this.members.find(m => m.user.equals(userId));
  return member ? member.role : null;
};

// Method to add member
projectSchema.methods.addMember = function(userId, role = 'member') {
  if (!this.members.some(m => m.user.equals(userId))) {
    this.members.push({ user: userId, role });
  }
  return this;
};

// Method to remove member
projectSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => !m.user.equals(userId));
  return this;
};

// Method to update member role
projectSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(m => m.user.equals(userId));
  if (member) {
    member.role = newRole;
  }
  return this;
};

const Project = mongoose.model('Project', projectSchema);

export default Project; 