import BorrowModel from '../models/borrowModel.js';

const borrowController = {

  // GET /api/borrows
  async getAll(req, res) {
    try {
      const { search = '', status = '', page = 1, limit = 10, sortBy = 'borrow_date', sortOrder = 'DESC' } = req.query;
      const data = await BorrowModel.findAll({ search, status, page: Number(page), limit: Number(limit), sortBy, sortOrder });
      return res.json(data);
    } catch (err) {
      console.error('getAll borrows:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/borrows/:id
  async getById(req, res) {
    try {
      const borrow = await BorrowModel.findById(req.params.id);
      if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });
      return res.json({ borrow });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/borrows/check-reader/:studentId
  // Kiểm tra reader có đủ điều kiện mượn không
  async checkReader(req, res) {
    try {
      const info = await BorrowModel.checkReader(req.params.studentId);
      return res.json(info);
    } catch (err) {
      const msg = err.message || 'Internal server error';
      const status = msg.includes('not found') ? 404 : msg.includes('suspended') || msg.includes('banned') ? 403 : 400;
      return res.status(status).json({ message: msg });
    }
  },

  // GET /api/borrows/check-barcode/:barcode
  // Kiểm tra barcode sách để mượn
  async checkBarcode(req, res) {
    try {
      const copy = await BorrowModel.checkBarcode(req.params.barcode);
      return res.json(copy);
    } catch (err) {
      const msg = err.message || 'Internal server error';
      return res.status(400).json({ message: msg });
    }
  },

  // GET /api/borrows/check-return/:barcode
  // Kiểm tra barcode để trả sách
  async checkReturnBarcode(req, res) {
    try {
      const info = await BorrowModel.checkReturnBarcode(req.params.barcode);
      return res.json(info);
    } catch (err) {
      const msg = err.message || 'Internal server error';
      return res.status(400).json({ message: msg });
    }
  },

  // POST /api/borrows/batch
  // Mượn nhiều sách cùng lúc
  // body: { user_id, items: [{book_copy_id, book_id}], due_date }
  async createBatch(req, res) {
    try {
      const { user_id, items, due_date } = req.body;
      if (!user_id || !items?.length || !due_date) {
        return res.status(400).json({ message: 'user_id, items and due_date are required' });
      }
      const ids = await BorrowModel.createBatch({ user_id, items, due_date });
      return res.status(201).json({ message: `${ids.length} book(s) borrowed successfully`, borrow_ids: ids });
    } catch (err) {
      console.error('createBatch error:', err);
      const msg = err.message || 'Internal server error';
      if (msg.includes('limit') || msg.includes('available') || msg.includes('not found')) {
        return res.status(400).json({ message: msg });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // POST /api/borrows/return-batch
  // Trả nhiều sách cùng lúc
  // body: { borrow_ids: [id, ...] }
  async returnBatch(req, res) {
    try {
      const { borrow_ids } = req.body;
      if (!borrow_ids?.length) {
        return res.status(400).json({ message: 'borrow_ids is required' });
      }
      await BorrowModel.returnBatch(borrow_ids);
      return res.json({ message: `${borrow_ids.length} book(s) returned successfully` });
    } catch (err) {
      console.error('returnBatch error:', err);
      const msg = err.message || 'Internal server error';
      if (msg.includes('not found') || msg.includes('already returned')) {
        return res.status(400).json({ message: msg });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PATCH /api/borrows/mark-overdue
  async markOverdue(req, res) {
    try {
      const count = await BorrowModel.markOverdue();
      return res.json({ message: `${count} records marked as overdue` });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};

export default borrowController;