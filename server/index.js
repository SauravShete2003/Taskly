import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import configurations
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import boardRoutes from './routes/boards.js';
import taskRoutes from './routes/tasks.js';

// Import utilities
import { errorResponse } from './utils/responseHandler.js';
import { MESSAGES } from './utils/constants.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const server = createServer(app);

// Connect to database
connectDB();

// Ensure upload directories exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureUploadDirs = () => {
  const uploadsDir = path.join(__dirname, 'uploads');
  const avatarsDir = path.join(uploadsDir, 'avatars');

  try {
    fs.mkdirSync(avatarsDir, { recursive: true });
    console.log('✅ Upload directories created successfully');
  } catch (error) {
    console.error('❌ Failed to create upload directories:', error.message);
  }
};
ensureUploadDirs();

// Middleware
const allowedOrigins = [
  'https://taskly-1-zj3w.onrender.com',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Taskly API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  errorResponse(
    res, 
    MESSAGES.INTERNAL_ERROR,
    500,
    process.env.NODE_ENV === 'development' ? err.message : null
  );
});

// 404 handler (API only)
app.use('*', (req, res) => {
  errorResponse(res, MESSAGES.ROUTE_NOT_FOUND, 404);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});
