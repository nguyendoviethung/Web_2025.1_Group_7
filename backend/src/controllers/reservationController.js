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
       console.log("User:", req.user.id);
    console.log("Reservation ID:", req.params.id);
      const reservation = await ReservationModel.cancel(req.user.id, req.params.id);

      // After reader cancels → promote the next waiting person automatically
      await promoteNextAndNotify(reservation.book_id, reservation);

      return res.json({ message: 'Reservation cancelled', reservation });
    } catch (err) {
      return res.status(400).json({ message: err.message || 'Failed to cancel' });
    }
  },

  // GET /api/reservations/my
  // Auto-expires any overdue-ready reservations for this user before returning the list.
  async getMy(req, res) {
    try {
      const userId = req.user.id;
      const reservations = await ReservationModel.findByUser(userId);
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

      // Notify the cancelled reader
      await NotificationModel.create({
        user_id: reservation.user_id,
        type:    'general',
        title:   'Reservation Cancelled',
        message: 'Your reservation has been cancelled by the library staff. Please contact us if you have questions.',
      }).catch(() => {});

      // Promote the next person in queue automatically
      await this.promoteNextAndNotify(reservation.book_id, reservation);

      return res.json({ message: 'Reservation cancelled by admin', reservation });
    } catch (err) {
      return res.status(400).json({ message: err.message || 'Failed to cancel' });
    }
  },
  
  async promoteNextAndNotify(bookId, cancelledReservation) {
  try {
    const next = await ReservationModel.promoteNextPending(bookId);
    if (!next) return; // nobody else is waiting

    await NotificationModel.create({
      user_id: next.user_id,
      type:    'general',
      title:   ' Your reserved book is now available!',
      message: `Great news! "${next.book_title}" is now available for pickup. Please come to the library within 3 days before your reservation expires.`,
    });
  } catch (err) {
    // Don't block the main response if this fails
    console.error('[reservationController] promoteNextAndNotify error:', err.message);
  }
  
},

  async markReady(req, res) {
    try {
      const reservation = await ReservationModel.markReady(req.params.id);

      await NotificationModel.create({
        user_id: reservation.user_id,
        type: 'general',
        title: ' Book Ready',
        message: 'Your reserved book is ready to pick up.',
      });

      return res.json({ message: 'Marked as ready', reservation });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  },


};




export default reservationController;