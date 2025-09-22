import mongoose from 'mongoose';

// Define the roles in a constant to avoid typos
const PROJECT_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
};

const memberSubSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(PROJECT_ROLES),
    default: PROJECT_ROLES.MEMBER,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false }); // Use _id: false for subdocuments unless you need them

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
    },
    members: [memberSubSchema], // Using the defined sub-schema
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
    },
    settings: {
      allowComments: { type: Boolean, default: true },
      allowAttachments: { type: Boolean, default: true },
      allowAssignments: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Simpler way to include virtuals
    toObject: { virtuals: true },
  }
);

// Indexes (your existing ones are good)
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

// Virtual for member count (your existing one is good)
projectSchema.virtual('memberCount').get(function () {
  return (this.members?.length || 0) + 1; // +1 for owner
});

// Your pre-save hook is great for data integrity. No changes needed.
projectSchema.pre('save', function (next) {
  if (this.isModified('members')) {
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

// --- Helper Methods ---
// Your existing methods are excellent. I've just made them slightly more robust
// by ensuring userId is always treated as a string for comparison.

projectSchema.methods.isOwner = function (userId) {
  // Using .toString() is safer for comparison
  return this.owner.toString() === userId.toString();
};

projectSchema.methods.isAdmin = function (userId) {
  const userIdStr = userId.toString();
  if (this.owner.toString() === userIdStr) {
    return true; // The owner is always an admin
  }
  return this.members.some(
    (member) => member.user.toString() === userIdStr && member.role === PROJECT_ROLES.ADMIN
  );
};

projectSchema.methods.isMember = function (userId) {
  const userIdStr = userId.toString();
  if (this.owner.toString() === userIdStr) {
    return true; // The owner is implicitly a member
  }
  return this.members.some((member) => member.user.toString() === userIdStr);
};

projectSchema.methods.getUserRole = function (userId) {
    const userIdStr = userId.toString();
  if (this.owner.toString() === userIdStr) return 'owner';
  const member = this.members.find((m) => m.user.toString() === userIdStr);
  return member ? member.role : null;
};

// No changes needed for the methods below. They are perfect.
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

// Export the roles constant so we can use it elsewhere
export { PROJECT_ROLES };
export default Project;