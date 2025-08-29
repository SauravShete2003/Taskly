import api from './api';

const unwrap = (res) => res?.data ?? {};

const taskService = {
  getTasks: async (boardId) => {
  const response = await api.get(`/tasks/board/${boardId}`);
  const result = unwrap(response);
  return result?.data?.tasks || [];  
},

  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return unwrap(response).task;
  },
  createTask: async (boardId, taskData) => {
    try {
      const response = await api.post(`/tasks/board/${boardId}`, taskData);
      const result = unwrap(response);
      return result.data || result.task || result;
    } catch (error) {
      console.error('Error in createTask service:', error);
      throw error;
    }
  },
  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return unwrap(response).task;
  },
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return unwrap(response);
  },
  moveTask: async (taskId, moveData) => {
    const response = await api.put(`/tasks/${taskId}/move`, moveData);
    return unwrap(response);
  },
  addComment: async (taskId, commentData) => {
    const response = await api.post(`/tasks/${taskId}/comments`, commentData);
    return unwrap(response).comment;
  },
  removeComment: async (taskId, commentId) => {
    const response = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    return unwrap(response);
  },
};

export default taskService;
