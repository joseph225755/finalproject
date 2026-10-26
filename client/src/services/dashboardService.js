import api from './api';

export const dashboardService = {
  getStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },

  getActivity: async () => {
    const res = await api.get('/dashboard/activity');
    return res.data;
  }
};
