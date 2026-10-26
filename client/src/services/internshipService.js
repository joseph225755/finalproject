import api from './api';

export const internshipService = {
  getMyInternship: async () => {
    const res = await api.get('/internships/me');
    return res.data;
  },

  saveInternship: async (internshipData) => {
    const res = await api.post('/internships', internshipData);
    return res.data;
  },

  getInternshipById: async (id) => {
    const res = await api.get(`/internships/${id}`);
    return res.data;
  },

  updateInternship: async (id, updates) => {
    const res = await api.patch(`/internships/${id}`, updates);
    return res.data;
  },

  deleteInternship: async (id) => {
    const res = await api.delete(`/internships/${id}`);
    return res.data;
  }
};
