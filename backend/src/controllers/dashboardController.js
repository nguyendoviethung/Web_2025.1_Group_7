import DashboardModel from '../models/dashboardModel.js';

const dashboardController = {

  // GET /api/dashboard/stats
  async getStats(req, res) {
    try {
      const data = await DashboardModel.getStats();
      return res.json({
        totalBooks:    Number(data.totalBooks),
        totalReaders:  Number(data.totalReaders),
        overdueBooks:  Number(data.overdueBooks),
        totalBorrowed: Number(data.totalBorrowed),
      });
    } catch (err) {
      console.error('getStats error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/dashboard/monthly-loans
  async getMonthlyLoans(req, res) {
    try {
      const monthlyLoans = await DashboardModel.getMonthlyLoans();
      return res.json({ monthlyLoans });
    } catch (err) {
      console.error('getMonthlyLoans error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

 // GET /api/dashboard/category-distribution
async getCategoryDistribution(req, res) {
  try {
    const categories = await DashboardModel.getCategoryDistribution();
    return res.json({ categories });
  } catch (err) {
    console.error('getCategoryDistribution error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
},
  // GET /api/dashboard/age-distribution
  // Frontend gọi endpoint này cho "Top Active Readers"
  async getTopReaders(req, res) {
    try {
      const topReaders = await DashboardModel.getTopReaders();
      return res.json({ topReaders });
    } catch (err) {
      console.error('getTopReaders error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/dashboard/top-books
  async getTopBooks(req, res) {
    try {
      const topBooks = await DashboardModel.getTopBooks();
      return res.json({ topBooks });
    } catch (err) {
      console.error('getTopBooks error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};

export default dashboardController;