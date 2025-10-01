import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    (process.env.NODE_ENV === 'production' ? null : 'mongodb://localhost:27017/taskly');

  if (!mongoUri) {
    const msg =
      'MONGODB_URI not set. Set MONGODB_URI environment variable to your MongoDB connection string (e.g. MongoDB Atlas).';
    console.error('MongoDB connection error:', msg);
    throw new Error(msg);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Please verify your MONGODB_URI environment variable.');
    throw error;
  }
};

export default connectDB;