import BookModel from '../models/bookModel.js';
import getPool   from '../config/db.js';

const bookController = {

  // Lấy danh sách sách với phân trang, tìm kiếm, lọc thể loại
  async getAll(req, res) {
    try {
      const { search = '', genre = '', page = 1, limit = 10 } = req.query;
      const data = await BookModel.findAll({
        search,
        genre,
        page:  Number(page),
        limit: Number(limit),
      });
      return res.json(data);
    } catch (err) {
      console.error('getAll error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Tìm sách theo id
  async getById(req, res) {
    try {
      const book = await BookModel.findById(req.params.id);
      if (!book) return res.status(404).json({ message: 'Book not found' });
      return res.json({ book });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  //  lấy danh sách genres từ DB
  async getGenres(req, res) {
    try {
      const result = await BookModel.getGenres();
      const genres = result.rows.map(r => ({
        label: r.genre,
        value: r.genre,
      }));
      return res.json({ genres });
    } catch (err) {
      console.error('getGenres error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Thêm sách mới
  async create(req, res) {
    try {
      const book = await BookModel.create(req.body);
      return res.status(201).json({ message: 'Book created', book });
    } catch (err) {
      console.error('create error:', err);
      if (err.code === '23505')
        return res.status(409).json({ message: 'Book ID or ISBN already exists' });
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Cập nhật sách
  async update(req, res) {
    try {
      const book = await BookModel.update(req.params.id, req.body);
      if (!book) return res.status(404).json({ message: 'Book not found' });
      return res.json({ message: 'Book updated', book });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  // Xóa sách
  async delete(req, res) {
    try {
      await BookModel.delete(req.params.id);
      return res.json({ message: 'Book deleted' });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Lấy danh sách copies của 1 sách
  async getCopies(req, res) {
    try {
      const copies = await BookModel.getCopies(req.params.id);
      return res.json({ copies });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Thêm copy mới
async addCopy(req, res) {
  try {
    const { quantity, condition, notes } = req.body;
    const copies = await BookModel.addCopiesBulk({
      book_id:  req.params.id,
      quantity: quantity || 1,
      condition,
      notes,
    });
    return res.status(201).json({
      message: `${copies.length} cop${copies.length > 1 ? 'ies' : 'y'} added successfully`,
      copies,
    });
  } catch (err) {
    console.error('addCopy error:', err);
    if (err.code === '23505')
      return res.status(409).json({ message: 'Barcode already exists' });
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
},

  // Cập nhật copy
  async updateCopy(req, res) {
    try {
      const copy = await BookModel.updateCopy(req.params.copyId, req.body);
      return res.json({ message: 'Copy updated', copy });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Xóa copy
  async deleteCopy(req, res) {
    try {
      await BookModel.deleteCopy(req.params.copyId);
      return res.json({ message: 'Copy deleted' });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};

export default bookController;