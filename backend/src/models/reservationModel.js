import getPool from '../config/db.js';
 
const RESERVATION_HOLD_DAYS = 3; // Giữ chỗ 3 ngày sau khi sách available
 
const ReservationModel = {
 
  // Đặt trước sách
  async create(userId, bookId) {
    const pool = getPool();
 
    // Kiểm tra sách tồn tại
    const bookRes = await pool.query(
      `SELECT id, title, available FROM books WHERE id = $1`, [bookId]
    );
    if (!bookRes.rows[0]) throw new Error('Book not found');
 
    // Không cho đặt nếu sách đang có sẵn (mượn luôn đi)
    if (bookRes.rows[0].available > 0) {
      throw new Error('Book is currently available — please borrow directly at the library');
    }
 
    // Kiểm tra user không đang mượn sách này
    const borrowingRes = await pool.query(
      `SELECT b.id FROM borrows b
       JOIN book_copies bc ON bc.id = b.book_copy_id
       WHERE b.user_id = $1 AND bc.book_id = $2
         AND b.status IN ('borrowing', 'overdue')`,
      [userId, bookId]
    );
    if (borrowingRes.rows[0]) throw new Error('You are currently borrowing this book');
 
    // Kiểm tra chưa có reservation pending/ready cho sách này
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
 
  // Hủy đặt trước
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
 
  // Danh sách reservation của user
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
 
  // [CRON] Khi sách được trả → tìm reservation pending theo thứ tự đặt
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
 
  // Đánh dấu reservation → ready, set expires_at
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
 
  // [CRON] Hủy các reservation ready đã quá hạn
  async expireOverdueReady() {
    const res = await getPool().query(
      `UPDATE book_reservations
       SET status = 'expired'
       WHERE status = 'ready' AND expires_at < NOW()
       RETURNING id, user_id, book_id`
    );
    return res.rows;
  },
 
  // Đánh dấu fulfilled (khi mượn thành công)
  async markFulfilled(userId, bookId) {
    await getPool().query(
      `UPDATE book_reservations
       SET status = 'fulfilled'
       WHERE user_id = $1 AND book_id = $2 AND status = 'ready'`,
      [userId, bookId]
    );
  },
 
  // Kiểm tra user có reservation ready cho sách này không
  async hasReadyReservation(userId, bookId) {
    const res = await getPool().query(
      `SELECT id FROM book_reservations
       WHERE user_id = $1 AND book_id = $2 AND status = 'ready'`,
      [userId, bookId]
    );
    return !!res.rows[0];
  },
 
  // Admin: danh sách tất cả reservations
  async findAll({ status = '', page = 1, limit = 10 }) {
    const offset = (Number(page) - 1) * Number(limit);
    const where  = status ? `WHERE r.status = '${status}'` : '';
 
    const [countRes, dataRes] = await Promise.all([
      getPool().query(`SELECT COUNT(*) FROM book_reservations r ${where}`),
      getPool().query(
        `SELECT r.*, b.title AS book_title, b.book_cover,
                u.full_name AS reader_name, u.email AS reader_email
         FROM book_reservations r
         JOIN books b ON b.id = r.book_id
         JOIN users u ON u.id = r.user_id
         ${where}
         ORDER BY r.reserved_at DESC
         LIMIT $1 OFFSET $2`,
        [Number(limit), offset]
      ),
    ]);
 
    return { reservations: dataRes.rows, total: Number(countRes.rows[0].count) };
  },
};
 
export default ReservationModel;