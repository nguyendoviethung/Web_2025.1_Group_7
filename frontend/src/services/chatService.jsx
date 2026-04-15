import axiosClient from './axiosClient';
 
const chatService = {
  getStaffList()              { return axiosClient.get('/chat/staff'); },
  getConversations()          { return axiosClient.get('/chat/conversations'); },
  getMessages(partnerId, params={}) {
    return axiosClient.get(`/chat/messages/${partnerId}`, { params });
  },
  
  sendMessage(data)           { return axiosClient.post('/chat/messages', data); },
  markRead(partnerId)         { return axiosClient.patch(`/chat/read/${partnerId}`); },
  getUnreadCount()            { return axiosClient.get('/chat/unread-count'); },
};
 
export default chatService;