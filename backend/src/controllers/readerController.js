import ReaderModel from '../models/readerModel.js';

const readerController = {

  // GET /api/readers
  async getAll(req, res) {
    try {
      const {
        search = '', status = '',
        page = 1, limit = 10,
        sortBy = 'created_at', sortOrder = 'DESC',
      } = req.query;

      const data = await ReaderModel.findAll({
        search, status,
        page: Number(page), limit: Number(limit),
        sortBy, sortOrder,
      });
      return res.json(data);
    } catch (err) {
      console.error('getAll readers error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/readers/:id
  async getById(req, res) {
    try {
      const reader = await ReaderModel.findById(req.params.id);
      if (!reader) return res.status(404).json({ message: 'Reader not found' });
      return res.json({ reader });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/readers/:id/history
  async getBorrowHistory(req, res) {
    try {
      const { page = 1, limit = 6 } = req.query;
      const data = await ReaderModel.getBorrowHistory(req.params.id, {
        page: Number(page), limit: Number(limit),
      });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PATCH /api/readers/:id/status
  // body: { status: 'active' | 'suspended' | 'banned' }
async updateStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ['active', 'suspended', 'banned'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${allowed.join(', ')}`,
      });
    }

    const reader = await ReaderModel.updateStatus(req.params.id, status);
    if (!reader) return res.status(404).json({ message: 'Reader not found' });

    const label = { active: 'activated', suspended: 'suspended', banned: 'banned' };
    return res.json({ message: `Reader ${label[status]}`, reader });
  } catch (err) {
    //  Log chi tiết
    console.error('=== updateStatus ERROR ===');
    console.error('Params:', req.params);
    console.error('Body:',   req.body);
    console.error('Message:', err.message);
    console.error('Code:',    err.code);      // PostgreSQL error code
    console.error('Detail:',  err.detail);    // PostgreSQL error detail
    console.error('Stack:',   err.stack);
    return res.status(500).json({ message: 'Internal server error' });
  }
},
};

export default readerController;