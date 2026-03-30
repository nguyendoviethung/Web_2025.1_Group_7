import axiosClient from './axiosClient';

const readerService = {

  getAll(params = {}) {
    return axiosClient.get('/readers', { params });
  },

  getById(id) {
    return axiosClient.get(`/readers/${id}`);
  },

  getBorrowHistory(id, params = {}) {
    return axiosClient.get(`/readers/${id}/history`, { params });
  },

  // status: 'active' | 'suspended' | 'banned'
  updateStatus(id, status) {
    return axiosClient.patch(`/readers/${id}/status`, { status });
  },
};

export default readerService;