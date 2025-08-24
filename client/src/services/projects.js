import api from './api';

function extractProjects(root) {
  return root?.data?.data?.projects || root?.data?.projects || root?.projects || root?.data || [];
}

function extractProject(root) {
  return root?.data?.data?.project || root?.data?.project || root?.project || root?.data || root;
}

export const projectService = {
  getProjects: async () => {
    const res = await api.get('/projects');
    return extractProjects(res);
  },

  getProjectById: async (projectId) => {
    const res = await api.get(`/projects/${projectId}`);
    return extractProject(res);
  },

  createProject: async (payload) => {
    const res = await api.post('/projects', payload);
    return extractProject(res);
  },

  updateProject: async (projectId, payload) => {
    const res = await api.put(`/projects/${projectId}`, payload);
    return extractProject(res);
  },

  deleteProject: async (projectId) => {
    const res = await api.delete(`/projects/${projectId}`);
    return res?.data || { success: true };
  },

  addMember: async (projectId, userId, role = 'member') => {
    const res = await api.post(`/projects/${projectId}/members`, { userId, role });
    return extractProject(res);
  },

  removeMember: async (projectId, userId) => {
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    return extractProject(res);
  },

  updateMemberRole: async (projectId, userId, role) => {
    const res = await api.put(`/projects/${projectId}/members/${userId}`, { role });
    return extractProject(res);
  },
};