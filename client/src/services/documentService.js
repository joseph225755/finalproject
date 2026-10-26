import api from './api';

export const documentService = {
  getDocuments: async (params = {}) => {
    const res = await api.get('/documents', { params });
    return res.data;
  },

  uploadDocument: async (docData) => {
    // If uploading via FormData
    if (docData instanceof FormData) {
      const res = await api.post('/documents', docData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    }
    const res = await api.post('/documents', docData);
    return res.data;
  },

  deleteDocument: async (id) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  }
};
