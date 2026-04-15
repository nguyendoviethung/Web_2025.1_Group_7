import ReservationModel    from '../models/reservationModel.js';
import NotificationModel   from '../models/notificationModel.js';
 
const reservationController = {
 
  // POST /api/reservations  body: { book_id }
  async create(req, res) {
    try {
      const { book_id } = req.body;
      if (!book_id) return res.status(400).json({ message: 'book_id is required' });
 
      const result = await ReservationModel.create(req.user.id, book_id);
 
      // Gửi notification xác nhận
      await NotificationModel.create({
        user_id: req.user.id,
        type:    'general',
        title:   'Reservation Confirmed',
        message: `Your reservation for "${result.book.title}" has been placed. We'll notify you when it's available.`,
      });
 
      return res.status(201).json({ message: 'Reservation placed successfully', ...result });
    } catch (err) {
      const msg = err.message || 'Internal server error';
      return res.status(msg.includes('not found') ? 404 : 400).json({ message: msg });
    }
  },
 
  // DELETE /api/reservations/:id
  async cancel(req, res) {
    try {
      const reservation = await ReservationModel.cancel(req.user.id, req.params.id);
      return res.json({ message: 'Reservation cancelled', reservation });
    } catch (err) {
      return res.status(400).json({ message: err.message || 'Failed to cancel' });
    }
  },
 
  // GET /api/reservations/my
  async getMy(req, res) {
    try {
      const reservations = await ReservationModel.findByUser(req.user.id);
      return res.json({ reservations });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
 
  // GET /api/reservations  (admin)
  async getAll(req, res) {
    try {
      const { status = '', page = 1, limit = 10 } = req.query;
      const data = await ReservationModel.findAll({ status, page: Number(page), limit: Number(limit) });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};
 
export default reservationController;