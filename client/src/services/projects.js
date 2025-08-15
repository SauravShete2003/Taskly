import api from './api';

function unwrapProject(payload) {
  if (!payload) return null;
  const data = payload.data ?? payload;
  return data.project ?? data.item ?? data; // be tolerant
}

// unwrap arrays from different shapes
function normalizeProjectsResponse(payload) {
  if (Array.isArray(payload)) return payload;

  // typical backend shape: { success, message, data: { projects: [...] } }
  if (Array.isArray(payload?.data?.projects)) return payload.data.projects;

  if (Array.isArray(payload?.projects)) return payload.projects;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;

  return [];
}

export const projectService = {
  getProjects: async () => {
    const res = await api.get('/projects');
    return normalizeProjectsResponse(res.data);
  },

  getProjectById: async (projectId) => {
    const res = await api.get(`/projects/${projectId}`);
    return unwrapProject(res.data); // <- important
  },

  createProject: async (projectData) => {
    const res = await api.post('/projects', projectData);
    return unwrapProject(res.data); // <- important
  },

  updateProject: async (projectId, projectData) => {
    const res = await api.put(`/projects/${projectId}`, projectData);
    return unwrapProject(res.data); // <- important
  },

  deleteProject: async (projectId) => {
    const res = await api.delete(`/projects/${projectId}`);
    // backend returns { success, message, data: null }
    return res.data;
  },

  addMember: async (projectId, memberData) => {
    const res = await api.post(`/projects/${projectId}/members`, memberData);
    return unwrapProject(res.data); // backend returns { data: { project } }
  },

  removeMember: async (projectId, userId) => {
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    return unwrapProject(res.data);
  },

  updateMemberRole: async (projectId, userId, role) => {
    const res = await api.put(`/projects/${projectId}/members/${userId}`, { role });
    return unwrapProject(res.data);
  },
};

export default projectService;