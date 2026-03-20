import axiosClient from './axiosClient';

const dashboardService = {
  getStats() {
    return axiosClient.get('/dashboard/stats');
  },
  getMonthlyLoans() {
    return axiosClient.get('/dashboard/monthly-loans');
  },
  getCategoryDistribution() {
    return axiosClient.get('/dashboard/category-distribution');
  },
  getAgeDistribution() {
    return axiosClient.get('/dashboard/age-distribution');
  },
  getTopBooks() {
    return axiosClient.get('/dashboard/top-books');
  },
};

export default dashboardService;