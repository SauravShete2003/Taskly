import api from './api';

const unwrap = (res) => res?.data ?? {};

export const taskService = {
getTasks: async (boardId) => {
  const response = await api.get(`/tasks/board/${boardId}`);
  const payload = unwrap(response);
  return payload  
},
  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    const payload = unwrap(response);
    return payload.task;
  },

  createTask: async (boardId, taskData) => {
    const response = await api.post(`/tasks/board/${boardId}`, taskData);
    const payload = unwrap(response);
    return payload.task;
  },

  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    const payload = unwrap(response);
    return payload.task;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    const payload = unwrap(response);
    return payload;
  },

  moveTask: async (taskId, moveData) => {
    const response = await api.put(`/tasks/${taskId}/move`, moveData);
    const payload = unwrap(response);
    return payload;
  },

  addComment: async (taskId, commentData) => {
    const response = await api.post(`/tasks/${taskId}/comments`, commentData);
    const payload = unwrap(response);
    return payload.comment;
  },

  removeComment: async (taskId, commentId) => {
    const response = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    const payload = unwrap(response);
    return payload;
  },
};

export default taskService;
