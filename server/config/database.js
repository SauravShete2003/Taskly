import mongoose from 'mongoose';

const connectDB = async () => {
  // Prefer an explicit MONGODB_URI in production. Falling back to localhost
  // during development is OK, but in hosted environments we want to fail
  // fast so deployers set the correct connection string (e.g. Atlas).
  const mongoUri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? null : 'mongodb://localhost:27017/taskly');

  if (!mongoUri) {
    const msg = 'MONGODB_URI not set. Set MONGODB_URI environment variable to your MongoDB connection string (e.g. MongoDB Atlas).';
    console.error('MongoDB connection error:', msg);
    throw new Error(msg);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      // modern mongoose (>=6) doesn't require these flags but keep them
      // for backwards compatibility; warnings about deprecation are harmless.
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Please verify your MONGODB_URI environment variable.');
    throw error;
  }
};

export default connectDB; 