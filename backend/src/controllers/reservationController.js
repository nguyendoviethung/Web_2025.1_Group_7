import ReservationModel  from '../models/reservationModel.js';
import NotificationModel from '../models/notificationModel.js';

const reservationController = {

  // POST /api/reservations  body: { book_id }
  async create(req, res) {
    try {
      const { book_id } = req.body;
      if (!book_id) return res.status(400).json({ message: 'book_id is required' });

      const result = await ReservationModel.create(req.user.id, book_id);

      await NotificationModel.create({
        user_id: req.user.id,
        type:    'general',
        title:   'Reservation Confirmed',
        message: `Your reservation for "${result.book.title}" has been placed. We'll notify you when it's available.`,
      });

      return res.status(201).json({ message: 'Reservation placed successfully', ...result });
    } catch (err) {
      // Bắt lỗi unique constraint PostgreSQL (23505) — duplicate active reservation
      if (err.code === '23505') {
        return res.status(400).json({ message: 'You already have an active reservation for this book' });
      }
      const msg = err.message || 'Internal server error';
      const status = msg.includes('not found') ? 404 : 400;
      return res.status(status).json({ message: msg });
    }
  },

  // DELETE /api/reservations/:id  (reader cancel)
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

  // PATCH /api/reservations/:id/ready  (admin — đánh dấu sách đã sẵn sàng cho reader)
  async markReady(req, res) {
    try {
      const reservation = await ReservationModel.markReady(req.params.id);
      if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

      // Lấy thêm thông tin để gửi notification
      const detail = await ReservationModel.findById(req.params.id);

      // Gửi notification cho reader
      await NotificationModel.create({
        user_id: reservation.user_id,
        type:    'general',
        title:   '📚 Your reserved book is ready!',
        message: `"${detail?.book_title || 'Your reserved book'}" is ready for pickup. Please come pick it up within ${3} days before the reservation expires.`,
      });

      return res.json({ message: 'Reservation marked as ready, reader notified', reservation });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  },

  // PATCH /api/reservations/:id/cancel  (admin cancel)
  async adminCancel(req, res) {
    try {
      const reservation = await ReservationModel.adminCancel(req.params.id);

      // Notify reader nếu muốn
      await NotificationModel.create({
        user_id: reservation.user_id,
        type:    'general',
        title:   'Reservation Cancelled',
        message: 'Your reservation has been cancelled by the library staff. Please contact us if you have questions.',
      }).catch(() => {}); // không block nếu notify lỗi

      return res.json({ message: 'Reservation cancelled by admin', reservation });
    } catch (err) {
      return res.status(400).json({ message: err.message || 'Failed to cancel' });
    }
  },
};

export default reservationController;