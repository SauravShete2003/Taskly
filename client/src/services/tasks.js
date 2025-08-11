import api from './api';

export const taskService = {
  getTasks: async (boardId) => {
    const response = await api.get(`/tasks/board/${boardId}`);
    return response.data;
  },

  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (boardId, taskData) => {
    const response = await api.post(`/tasks/board/${boardId}`, taskData);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  moveTask: async (taskId, moveData) => {
    const response = await api.put(`/tasks/${taskId}/move`, moveData);
    return response.data;
  },

  addComment: async (taskId, commentData) => {
    const response = await api.post(`/tasks/${taskId}/comments`, commentData);
    return response.data;
  },

  removeComment: async (taskId, commentId) => {
    const response = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    return response.data;
  },
};

export default taskService;
