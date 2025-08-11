import { Server } from 'socket.io';

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  // Socket event handlers
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join project room
    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`);
      console.log(`User ${socket.id} joined project ${projectId}`);
    });

    // Leave project room
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      console.log(`User ${socket.id} left project ${projectId}`);
    });

    // Handle task updates
    socket.on('task-updated', (data) => {
      socket.to(`project-${data.projectId}`).emit('task-updated', data);
    });

    // Handle new task
    socket.on('task-created', (data) => {
      socket.to(`project-${data.projectId}`).emit('task-created', data);
    });

    // Handle task deletion
    socket.on('task-deleted', (data) => {
      socket.to(`project-${data.projectId}`).emit('task-deleted', data);
    });

    // Handle board updates
    socket.on('board-updated', (data) => {
      socket.to(`project-${data.projectId}`).emit('board-updated', data);
    });

    // Handle project updates
    socket.on('project-updated', (data) => {
      socket.to(`project-${data.projectId}`).emit('project-updated', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}; 