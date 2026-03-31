import axiosClient from './axiosClient';

const borrowService = {

  getAll(params = {}) {
    return axiosClient.get('/borrows', { params });
  },

  getById(id) {
    return axiosClient.get(`/borrows/${id}`);
  },

  // body: { user_id, barcode, due_date }
  create(data) {
    return axiosClient.post('/borrows', data);
  },

  returnBook(id) {
    return axiosClient.patch(`/borrows/${id}/return`);
  },

  markOverdue() {
    return axiosClient.patch('/borrows/mark-overdue');
  },
};

export default borrowService;