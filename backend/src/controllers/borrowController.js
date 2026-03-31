import BorrowModel from '../models/borrowModel.js';

const borrowController = {

  // GET /api/borrows
  async getAll(req, res) {
    try {
      const {
        search = '', status = '',
        page = 1, limit = 10,
        sortBy = 'borrow_date', sortOrder = 'DESC',
      } = req.query;

      const data = await BorrowModel.findAll({
        search, status,
        page: Number(page), limit: Number(limit),
        sortBy, sortOrder,
      });
      return res.json(data);
    } catch (err) {
      console.error('getAll borrows error:', err);
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

  // POST /api/borrows  — tạo giao dịch mượn mới
  // body: { user_id, barcode, due_date }
  async create(req, res) {
    try {
      const { user_id, barcode, due_date } = req.body;

      if (!user_id || !barcode || !due_date) {
        return res.status(400).json({
          message: 'user_id, barcode and due_date are required',
        });
      }

      const borrowId = await BorrowModel.create({
        user_id,
        barcode: barcode.trim().toUpperCase(),
        due_date,
      });

      // Lấy full detail để trả về
      const borrow = await BorrowModel.findById(borrowId);
      return res.status(201).json({ message: 'Book borrowed successfully', borrow });
    } catch (err) {
      console.error('create borrow error:', err);
      // Lỗi business logic (barcode not found, reader suspended...)
      if (err.message && !err.message.includes('Internal')) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PATCH /api/borrows/:id/return  — trả sách
  async returnBook(req, res) {
    try {
      const borrow = await BorrowModel.returnBook(req.params.id);
      return res.json({ message: 'Book returned successfully', borrow });
    } catch (err) {
      console.error('returnBook error:', err);
      if (err.message && !err.message.includes('Internal')) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PATCH /api/borrows/mark-overdue  — đánh dấu overdue
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