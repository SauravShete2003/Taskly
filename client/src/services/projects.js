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
    if (!projectId || projectId === 'undefined') {
      console.warn('Invalid projectId provided to getProjectById:', projectId);
      return null;
    }
    const res = await api.get(`/projects/${projectId}`);
    console.log('Fetched project:', res);
    return extractProject(res);
  },

  createProject: async (payload) => {
    const res = await api.post('/projects', payload);
    return extractProject(res);
  },

  updateProject: async (projectId, payload) => {
    if (!projectId || projectId === 'undefined') {
      console.warn('Invalid projectId provided to updateProject:', projectId);
      throw new Error('Invalid project ID provided');
    }
    const res = await api.put(`/projects/${projectId}`, payload);
    return extractProject(res);
  },

  deleteProject: async (projectId) => {
    if (!projectId || projectId === 'undefined') {
      console.warn('Invalid projectId provided to deleteProject:', projectId);
      throw new Error('Invalid project ID provided');
    }
    const res = await api.delete(`/projects/${projectId}`);
    return res?.data || { success: true };
  },

  addMember: async (projectId, userId, role = 'member') => {
    if (!projectId || projectId === 'undefined') {
      console.warn('Invalid projectId provided to addMember:', projectId);
      throw new Error('Invalid project ID provided');
    }
    const res = await api.post(`/projects/${projectId}/members`, { userId, role });
    return extractProject(res);
  },

  removeMember: async (projectId, userId) => {
    if (!projectId || projectId === 'undefined') {
      console.warn('Invalid projectId provided to removeMember:', projectId);
      throw new Error('Invalid project ID provided');
    }
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    return extractProject(res);
  },

  updateMemberRole: async (projectId, userId, role) => {
    if (!projectId || projectId === 'undefined') {
      console.warn('Invalid projectId provided to updateMemberRole:', projectId);
      throw new Error('Invalid project ID provided');
    }
    const res = await api.put(`/projects/${projectId}/members/${userId}`, { role });
    return extractProject(res);
  },
};
