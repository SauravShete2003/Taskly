import api from './api';

// Normalize various backend shapes to a plain array for the projects list.
// Supports:
// - [ ... ]
// - { data: [ ... ] }
// - { data: { projects: [ ... ] } }
// - { projects: [ ... ] }
// - { results: [ ... ] } or { items: [ ... ] }
function normalizeProjectsResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.projects)) return payload.data.projects;
  if (Array.isArray(payload?.projects)) return payload.projects;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export const projectService = {
  getProjects: async () => {
    const response = await api.get('/projects');
    const list = normalizeProjectsResponse(response.data);

    if (!Array.isArray(list)) {
      console.warn('Unexpected projects response shape:', response.data);
      return [];
    }

    return list;
  },

  // These can stay as-is; adjust if you want similar normalization for single-project responses
  getProjectById: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  deleteProject: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  addMember: async (projectId, memberData) => {
    const response = await api.post(`/projects/${projectId}/members`, memberData);
    return response.data;
  },

  removeMember: async (projectId, userId) => {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  updateMemberRole: async (projectId, userId, role) => {
    const response = await api.put(`/projects/${projectId}/members/${userId}`, { role });
    return response.data;
  },
};

export default projectService;