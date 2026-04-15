import axiosClient from './axiosClient';
 
const reservationService = {
  create(bookId)    { return axiosClient.post('/reservations', { book_id: bookId }); },
  cancel(id)        { return axiosClient.delete(`/reservations/${id}`); },
  getMy()           { return axiosClient.get('/reservations/my'); },
};
 
export default reservationService;