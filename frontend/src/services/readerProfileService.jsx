import axiosClient from './axiosClient';
 
const readerProfileService = {
  getMe()               { return axiosClient.get('/reader-profile/me'); },
  getDashboard()        { return axiosClient.get('/reader-profile/dashboard'); },
  getHistory(params={}) { return axiosClient.get('/reader-profile/history', { params }); },
  updateProfile(data)   { return axiosClient.patch('/reader-profile/me', data); },
  updateAvatar(data)    { return axiosClient.patch('/reader-profile/avatar', data); },
};
 
export default readerProfileService;
 