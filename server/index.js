import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  // Make sure browsers can read these response headers (Authorization/X-Access-Token)
  exposedHeaders: ['Authorization', 'X-Access-Token']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


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

// Debug echo endpoint (temporary) - returns test token in headers and JSON
// Use this to confirm CORS/exposedHeaders and whether response headers are
// visible to the browser. Remove this before production if you prefer.
app.get('/api/debug/echo', (req, res) => {
  const testToken = 'debug-token-12345';
  res.setHeader('Authorization', `Bearer ${testToken}`);
  res.setHeader('X-Access-Token', testToken);
  return res.json({ ok: true, message: 'debug echo', sentToken: testToken });
});

app.use('*', (req, res) => {
  errorResponse(res, MESSAGES.ROUTE_NOT_FOUND, 404);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
