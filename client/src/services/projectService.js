import api from './api';

export const projectService = {
  getProjects: async () => {
    const res = await api.get('/projects');
    return res.data;
  },

  getProjectById: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  createProject: async (projectData) => {
    const res = await api.post('/projects', projectData);
    return res.data;
  },

  updateProject: async (id, projectData) => {
    const res = await api.patch(`/projects/${id}`, projectData);
    return res.data;
  },

  deleteProject: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },

  // Milestone operations
  createMilestone: async (projectId, milestoneData) => {
    const res = await api.post(`/projects/${projectId}/milestones`, milestoneData);
    return res.data;
  },

  updateMilestone: async (id, milestoneData) => {
    const res = await api.patch(`/milestones/${id}`, milestoneData);
    return res.data;
  },

  deleteMilestone: async (id) => {
    const res = await api.delete(`/milestones/${id}`);
    return res.data;
  }
};
