import axiosClient from './axiosClient';
 
const reviewService = {
  upsert(data)            { return axiosClient.post('/reviews', data); },
  delete(id)              { return axiosClient.delete(`/reviews/${id}`); },
  getByBook(bookId, params={}) { return axiosClient.get(`/reviews/book/${bookId}`, { params }); },
  getMyReview(bookId)     { return axiosClient.get(`/reviews/my/book/${bookId}`); },
  getPending()            { return axiosClient.get('/reviews/my/pending'); },
  getMy()                 { return axiosClient.get('/reviews/my'); },
};
 
export default reviewService;