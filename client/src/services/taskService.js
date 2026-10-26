import api from './api';

export const taskService = {
  getTasks: async (params = {}) => {
    const res = await api.get('/tasks', { params });
    return res.data;
  },

  getAllTasks: async () => {
    const res = await api.get('/tasks', { params: { all: 'true' } });
    return res.data;
  },

  getTaskById: async (id) => {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },

  createTask: async (taskData) => {
    const res = await api.post('/tasks', taskData);
    return res.data;
  },

  updateTask: async (id, taskData) => {
    const res = await api.patch(`/tasks/${id}`, taskData);
    return res.data;
  },

  deleteTask: async (id) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  }
};
