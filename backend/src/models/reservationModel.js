import getPool from '../config/db.js';

const RESERVATION_HOLD_DAYS = 3;

const ReservationModel = {

  async create(userId, bookId) {
    const pool = getPool();

    const bookRes = await pool.query(
      `SELECT id, title, available FROM books WHERE id = $1`, [bookId]
    );
    if (!bookRes.rows[0]) throw new Error('Book not found');

    if (bookRes.rows[0].available > 0) {
      throw new Error('Book is currently available — please borrow directly at the library');
    }

    const borrowingRes = await pool.query(
      `SELECT b.id FROM borrows b
       JOIN book_copies bc ON bc.id = b.book_copy_id
       WHERE b.user_id = $1 AND bc.book_id = $2
         AND b.status IN ('borrowing', 'overdue')`,
      [userId, bookId]
    );
    if (borrowingRes.rows[0]) throw new Error('You are currently borrowing this book');

    // Kiểm tra đã có reservation pending/ready chưa
    const existRes = await pool.query(
      `SELECT id, status FROM book_reservations
       WHERE user_id = $1 AND book_id = $2 AND status IN ('pending','ready')`,
      [userId, bookId]
    );
    if (existRes.rows[0]) {
      throw new Error(`You already have a ${existRes.rows[0].status} reservation for this book`);
    }

    const res = await pool.query(
      `INSERT INTO book_reservations (user_id, book_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [userId, bookId]
    );
    return { reservation: res.rows[0], book: bookRes.rows[0] };
  },

  async cancel(userId, reservationId) {
    const res = await getPool().query(
      `UPDATE book_reservations
       SET status = 'cancelled'
       WHERE id = $1 AND user_id = $2 AND status IN ('pending','ready')
       RETURNING *`,
      [reservationId, userId]
    );
    if (!res.rows[0]) throw new Error('Reservation not found or cannot be cancelled');
    return res.rows[0];
  },

  // Admin cancel — không cần check user_id
  async adminCancel(reservationId) {
    const res = await getPool().query(
      `UPDATE book_reservations
       SET status = 'cancelled'
       WHERE id = $1 AND status IN ('pending','ready')
       RETURNING *`,
      [reservationId]
    );
    if (!res.rows[0]) throw new Error('Reservation not found or cannot be cancelled');
    return res.rows[0];
  },

  async findByUser(userId) {
    const res = await getPool().query(
      `SELECT r.*, b.title AS book_title, b.book_cover, b.author AS book_author,
              b.available AS book_available
       FROM book_reservations r
       JOIN books b ON b.id = r.book_id
       WHERE r.user_id = $1
       ORDER BY r.reserved_at DESC`,
      [userId]
    );
    return res.rows;
  },

  async findNextPendingForBook(bookId) {
    const res = await getPool().query(
      `SELECT r.*, u.full_name, u.email
       FROM book_reservations r
       JOIN users u ON u.id = r.user_id
       WHERE r.book_id = $1 AND r.status = 'pending'
       ORDER BY r.reserved_at ASC
       LIMIT 1`,
      [bookId]
    );
    return res.rows[0] || null;
  },

  async markReady(reservationId) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RESERVATION_HOLD_DAYS);
    const res = await getPool().query(
      `UPDATE book_reservations
       SET status = 'ready', expires_at = $2, notified_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [reservationId, expiresAt.toISOString()]
    );
    return res.rows[0];
  },


  async expireOverdueReady() {
    const res = await getPool().query(
      `UPDATE book_reservations
       SET status = 'expired'
       WHERE status = 'ready' AND expires_at < NOW()
       RETURNING id, user_id, book_id`
    );
    return res.rows;
  },

//
  async promoteNextPending(bookId, pool) {
    const p = pool || getPool();

    const next = await p.query(
      `SELECT r.id, r.user_id, b.title AS book_title
       FROM book_reservations r
       JOIN books b ON b.id = r.book_id
       WHERE r.book_id = $1 AND r.status = 'pending'
       ORDER BY r.reserved_at ASC
       LIMIT 1`,
      [bookId]
    );

    if (!next.rows[0]) return null; // nobody waiting

    const { id, user_id, book_title } = next.rows[0];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    await p.query(
      `UPDATE book_reservations
       SET status = 'ready', expires_at = $2, notified_at = NOW()
       WHERE id = $1`,
      [id, expiresAt.toISOString()]
    );

    return { reservation_id: id, user_id, book_title };
  },

  async markFulfilled(userId, bookId) {
    await getPool().query(
      `UPDATE book_reservations SET status = 'fulfilled'
       WHERE user_id = $1 AND book_id = $2 AND status = 'ready'`,
      [userId, bookId]
    );
  },

  async hasReadyReservation(userId, bookId) {
    const res = await getPool().query(
      `SELECT id FROM book_reservations
       WHERE user_id = $1 AND book_id = $2 AND status = 'ready'`,
      [userId, bookId]
    );
    return !!res.rows[0];
  },

  async findAll({ status = '', search = '', page = 1, limit = 10 }) {
    const offset = (Number(page) - 1) * Number(limit);
    const params = [];
    const where  = [];

    if (status) {
      params.push(status);
      where.push(`r.status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      where.push(`(b.title ILIKE $${params.length} OR u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRes, dataRes] = await Promise.all([
      getPool().query(
        `SELECT COUNT(*) FROM book_reservations r
         JOIN books b ON b.id = r.book_id
         JOIN users u ON u.id = r.user_id
         ${whereSQL}`,
        params
      ),
      getPool().query(
        `SELECT r.*, b.title AS book_title, b.book_cover,
                u.full_name AS reader_name, u.email AS reader_email, u.avatar_url AS reader_avatar
         FROM book_reservations r
         JOIN books b ON b.id = r.book_id
         JOIN users u ON u.id = r.user_id
         ${whereSQL}
         ORDER BY r.reserved_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, Number(limit), offset]
      ),
    ]);

    return { reservations: dataRes.rows, total: Number(countRes.rows[0].count) };
  },

  // Lấy chi tiết 1 reservation
  async findById(id) {
    const res = await getPool().query(
      `SELECT r.*, b.title AS book_title, b.book_cover, b.author AS book_author,
              u.full_name AS reader_name, u.email AS reader_email, u.avatar_url AS reader_avatar
       FROM book_reservations r
       JOIN books b ON b.id = r.book_id
       JOIN users u ON u.id = r.user_id
       WHERE r.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },
};

export default ReservationModel;