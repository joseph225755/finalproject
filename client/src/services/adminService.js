import api from './api';

export const adminService = {
  getAdminStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getAllStudents: async () => {
    const res = await api.get('/admin/students');
    return res.data;
  },

  getStudentDossier: async (id) => {
    const res = await api.get(`/admin/students/${id}`);
    return res.data;
  },

  moderateActivity: async (id, data) => {
    const res = await api.patch(`/admin/activities/${id}/moderate`, data);
    return res.data;
  },

  assignInternship: async (studentId, internshipData) => {
    const res = await api.put(`/admin/students/${studentId}/internship`, internshipData);
    return res.data;
  }
};
