import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,           // Keep only this (no separate schema.index and no index: true)
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: 'Please enter a valid email',
      },
      // index: true // REMOVED to avoid duplicate index warning
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don’t include password by default
    },
    avatar: {
      type: String,
      default: null,
      validate: {
        validator: (v) => !v || validator.isURL(v, { require_protocol: true }),
        message: 'Avatar must be a valid URL',
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // This is fine to keep
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

// NOTE: Removed this to prevent duplicate index warnings
// userSchema.index({ email: 1 }, { unique: true });

// Hash password before saving (create/save)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Hash password on findOneAndUpdate if provided
userSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = { ...(this.getUpdate() || {}) };

    // Support both direct and $set updates
    const pwd =
      (update.$set && update.$set.password) ??
      update.password;

    if (pwd) {
      const salt = await bcrypt.genSalt(12);
      const hashed = await bcrypt.hash(pwd, salt);

      if (update.$set && Object.prototype.hasOwnProperty.call(update.$set, 'password')) {
        update.$set.password = hashed;
      } else {
        update.password = hashed;
      }

      this.setUpdate(update);
    }

    // Ensure validators run and setters (like lowercase) apply properly
    this.setOptions({ runValidators: true, context: 'query' });

    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user profile (without password)
userSchema.methods.getProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Optional helper: mark last login
userSchema.methods.markLogin = async function () {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

const User = mongoose.model('User', userSchema);
export default User;