import ReservationModel  from '../models/reservationModel.js';
import NotificationModel from '../models/notificationModel.js';
import getPool           from '../config/db.js';

// ── Module-level helper ────────────────────────────────────────────────────
async function promoteNextAndNotify(bookId) {
  try {
    const next = await ReservationModel.promoteNextPending(bookId);
    if (!next) return;

    await NotificationModel.create({
      user_id: next.user_id,
      type:    'general',
      title:   'Your reserved book is now available!',
      message: `Great news! "${next.book_title}" is now available for pickup. Please come to the library within 3 days before your reservation expires.`,
    });
  } catch (err) {
    console.error('[reservationController] promoteNextAndNotify error:', err.message);
  }
}

const reservationController = {

  // POST /api/reservations  body: { book_id }
  async create(req, res) {
    try {
      const { book_id } = req.body;
      if (!book_id) return res.status(400).json({ message: 'book_id is required' });

      // Block suspended users from reserving
      const userRes = await getPool().query(
        `SELECT status FROM users WHERE id = $1`,
        [req.user.id]
      );
      const userStatus = userRes.rows[0]?.status;

      if (userStatus === 'suspended') {
        return res.status(403).json({
          message: 'Your account is currently suspended due to overdue books. Please return all overdue books to restore your account and make reservations.',
          status: 'suspended',
        });
      }

      // Block users who have overdue books (even if account is still active)
      const overdueRes = await getPool().query(
        `SELECT COUNT(*) AS cnt FROM borrows
         WHERE user_id = $1 AND status = 'overdue' AND return_date IS NULL`,
        [req.user.id]
      );
      if (Number(overdueRes.rows[0].cnt) > 0) {
        return res.status(403).json({
          message: 'You have overdue books. Please return them before making a new reservation.',
          status: 'overdue',
        });
      }

      const result = await ReservationModel.create(req.user.id, book_id);

      await NotificationModel.create({
        user_id: req.user.id,
        type:    'general',
        title:   'Reservation Confirmed',
        message: `Your reservation for "${result.book.title}" has been placed. We'll notify you when it's available.`,
      });

      return res.status(201).json({ message: 'Reservation placed successfully', ...result });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ message: 'You already have an active reservation for this book' });
      }
      const msg    = err.message || 'Internal server error';
      const status = msg.includes('not found') ? 404 : 400;
      return res.status(status).json({ message: msg });
    }
  },

  // DELETE /api/reservations/:id  (reader cancel their own)
  async cancel(req, res) {
    try {
      const reservationId = Number(req.params.id);
      const userId        = Number(req.user.id);

      if (!reservationId || isNaN(reservationId)) {
        return res.status(400).json({ message: 'Invalid reservation ID' });
      }

      const reservation = await ReservationModel.cancel(userId, reservationId);

      promoteNextAndNotify(reservation.book_id).catch(e =>
        console.error('[cancel] promote error:', e.message)
      );

      return res.json({ message: 'Reservation cancelled successfully', reservation });
    } catch (err) {
      const msg = err.message || 'Failed to cancel reservation';
      return res.status(400).json({ message: msg });
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
      const { status = '', search = '', page = 1, limit = 10 } = req.query;
      const data = await ReservationModel.findAll({
        status,
        search,
        page:  Number(page),
        limit: Number(limit),
      });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PATCH /api/reservations/:id/cancel  (admin cancel)
  async adminCancel(req, res) {
    try {
      const reservation = await ReservationModel.adminCancel(req.params.id);

      await NotificationModel.create({
        user_id: reservation.user_id,
        type:    'general',
        title:   'Reservation Cancelled',
        message: 'Your reservation has been cancelled by the library staff. Please contact us if you have questions.',
      }).catch(() => {});

      await promoteNextAndNotify(reservation.book_id);

      return res.json({ message: 'Reservation cancelled by admin', reservation });
    } catch (err) {
      return res.status(400).json({ message: err.message || 'Failed to cancel' });
    }
  },

  // PATCH /api/reservations/:id/ready  (admin mark ready)
  async markReady(req, res) {
    try {
      const reservation = await ReservationModel.markReady(req.params.id);

      await NotificationModel.create({
        user_id: reservation.user_id,
        type:    'general',
        title:   'Book Ready for Pickup',
        message: 'Your reserved book is ready to pick up. Please come within 3 days.',
      });

      return res.json({ message: 'Marked as ready', reservation });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  },

  // POST /api/reservations/:id/promote-next  (admin)
  async promoteNext(req, res) {
    try {
      const reservation = await ReservationModel.findById(req.params.id);
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      await promoteNextAndNotify(reservation.book_id);
      return res.json({ message: 'Next reader promoted successfully' });
    } catch (err) {
      return res.status(400).json({ message: err.message || 'Failed to promote' });
    }
  },
};

export default reservationController;