import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/taskly',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('⚠️  Server will continue without database connection');
    console.log('💡 To fix this:');
    console.log('   1. Install MongoDB locally, or');
    console.log('   2. Use MongoDB Atlas (cloud), or');
    console.log('   3. Set MONGODB_URI in your .env file');
  }
};

export default connectDB; 