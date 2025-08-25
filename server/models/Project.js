import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['admin', 'member', 'viewer'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    color: {
      type: String,
      default: '#3B82F6',
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    settings: {
      allowComments: { type: Boolean, default: true },
      allowAttachments: { type: Boolean, default: true },
      allowAssignments: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

// Virtual for member count
projectSchema.virtual('memberCount').get(function () {
  return (this.members?.length || 0) + 1; // +1 for owner
});

// Ensure members are unique and not the owner
projectSchema.pre('save', function (next) {
  if (Array.isArray(this.members)) {
    const ownerId = this.owner?.toString();
    const seen = new Set();
    this.members = this.members.filter((m) => {
      const id = m?.user?.toString();
      if (!id || id === ownerId) return false;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }
  next();
});

// Membership helpers
projectSchema.methods.isMember = function (userId) {
  return (
    this.owner.equals(userId) ||
    this.members.some((member) => member.user.equals(userId))
  );
};

projectSchema.methods.isAdmin = function (userId) {
  return (
    this.owner.equals(userId) ||
    this.members.some(
      (member) => member.user.equals(userId) && member.role === 'admin'
    )
  );
};

projectSchema.methods.isOwner = function (userId) {
  return this.owner.equals(userId);
};

projectSchema.methods.getUserRole = function (userId) {
  if (this.owner.equals(userId)) return 'owner';
  const member = this.members.find((m) => m.user.equals(userId));
  return member ? member.role : null;
};

projectSchema.methods.addMember = function (userId, role = 'member') {
  if (!this.members.some((m) => m.user.equals(userId))) {
    this.members.push({ user: userId, role });
  }
  return this;
};

projectSchema.methods.removeMember = function (userId) {
  this.members = this.members.filter((m) => !m.user.equals(userId));
  return this;
};

projectSchema.methods.updateMemberRole = function (userId, newRole) {
  const member = this.members.find((m) => m.user.equals(userId));
  if (member) member.role = newRole;
  return this;
};

const Project = mongoose.model('Project', projectSchema);
export default Project;