import axiosClient from './axiosClient';
 
const notificationService = {
  getAll(params={})  { return axiosClient.get('/notifications', { params }); },
  getUnreadCount()   { return axiosClient.get('/notifications/unread-count'); },
  markRead(id)       { return axiosClient.patch(`/notifications/${id}/read`); },
  markAllRead()      { return axiosClient.patch('/notifications/read-all'); },
};
 
export default notificationService;