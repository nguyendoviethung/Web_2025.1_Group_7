import axiosClient from './axiosClient';

const bookService = {
  
  // Lấy danh sách thể loại sách
  getGenres() {
  return axiosClient.get('/books/genres');
  },
  // Lấy danh sách sách
  getAll(params = {}) {
    return axiosClient.get('/books', { params });
  },

  // Lấy chi tiết 1 sách
  getById(id) {
    return axiosClient.get(`/books/${id}`);
  },

  // Thêm sách mới
  create(data) {
    return axiosClient.post('/books', data);
  },

  // Cập nhật sách
  update(id, data) {
    return axiosClient.put(`/books/${id}`, data);
  },

  // Xóa sách
  delete(id) {
    return axiosClient.delete(`/books/${id}`);
  },

  // Lấy danh sách copies của 1 sách
  getCopies(bookId) {
    return axiosClient.get(`/books/${bookId}/copies`);
  },

  // Thêm copy mới
  addCopy(bookId, data) {
    return axiosClient.post(`/books/${bookId}/copies`, data);
  },

  // Cập nhật copy
  updateCopy(copyId, data) {
    return axiosClient.put(`/books/copies/${copyId}`, data);
  },

  // Xóa copy
  deleteCopy(copyId) {
    return axiosClient.delete(`/books/copies/${copyId}`);
  },
};


export default bookService;