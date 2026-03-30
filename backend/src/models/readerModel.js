import getPool from '../config/db.js';

const ReaderModel = {

  async findAll({ search = '', status = '', page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' }) {
    const offset = (Number(page) - 1) * Number(limit);
    const params = [];
    const where  = [`u.role = 'reader'`];

    if (search) {
      params.push(`%${search}%`);
      where.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }

    if (status) {
      params.push(status);
      where.push(`u.status = $${params.length}`);
    }

    const whereSQL      = `WHERE ${where.join(' AND ')}`;
    const allowedSort   = ['full_name', 'email', 'created_at', 'status'];
    const safeSortBy    = allowedSort.includes(sortBy) ? `u.${sortBy}` : 'u.created_at';
    const safeSortOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countRes = await getPool().query(
      `SELECT COUNT(*) FROM users u ${whereSQL}`, params
    );

    params.push(Number(limit), offset);

    const dataRes = await getPool().query(
      `SELECT
         u.id, u.full_name, u.email, u.phone, u.avatar_url,
         u.status, u.created_at,
         COUNT(b.id)                                         AS total_borrows,
         COUNT(CASE WHEN b.status = 'borrowing' THEN 1 END) AS currently_borrowing,
         COUNT(CASE WHEN b.status = 'overdue'   THEN 1 END) AS overdue_count
       FROM users u
       LEFT JOIN borrows b ON b.user_id = u.id
       ${whereSQL}
       GROUP BY u.id, u.full_name, u.email, u.phone, u.avatar_url, u.status, u.created_at
       ORDER BY ${safeSortBy} ${safeSortOrder}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      readers: dataRes.rows,
      total:   Number(countRes.rows[0].count),
    };
  },

  async findById(id) {
    const result = await getPool().query(
      `SELECT
         u.id, u.full_name, u.email, u.phone, u.avatar_url,
         u.status, u.created_at,
         COUNT(b.id)                                         AS total_borrows,
         COUNT(CASE WHEN b.status = 'borrowing' THEN 1 END) AS currently_borrowing,
         COUNT(CASE WHEN b.status = 'overdue'   THEN 1 END) AS overdue_count,
         COUNT(CASE WHEN b.status = 'returned'  THEN 1 END) AS total_returned
       FROM users u
       LEFT JOIN borrows b ON b.user_id = u.id
       WHERE u.id = $1 AND u.role = 'reader'
       GROUP BY u.id`,
      [id]
    );
    return result.rows[0] || null;
  },

  async getBorrowHistory(userId, { page = 1, limit = 6 }) {
    const offset = (Number(page) - 1) * Number(limit);

    const countRes = await getPool().query(
      `SELECT COUNT(*) FROM borrows WHERE user_id = $1`, [userId]
    );

    const result = await getPool().query(
      `SELECT
         br.id, br.borrow_date, br.due_date, br.return_date, br.status,
         bk.title      AS book_title,
         bk.book_cover AS book_cover,
         bk.author     AS book_author,
         bc.barcode
       FROM borrows br
       JOIN book_copies bc ON bc.id = br.book_copy_id
       JOIN books bk       ON bk.id = bc.book_id
       WHERE br.user_id = $1
       ORDER BY br.borrow_date DESC
       LIMIT $2 OFFSET $3`,
      [userId, Number(limit), offset]
    );

    return { history: result.rows, total: Number(countRes.rows[0].count) };
  },

  // status: 'active' | 'suspended' | 'banned'
  async updateStatus(id, status) {
    const result = await getPool().query(
      `UPDATE users
       SET status = $2, updated_at = NOW()
       WHERE id = $1 AND role = 'reader'
       RETURNING id, full_name, status`,
      [id, status]
    );
    return result.rows[0] || null;
  },
};

export default ReaderModel;