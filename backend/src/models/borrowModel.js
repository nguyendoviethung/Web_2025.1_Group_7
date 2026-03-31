import getPool from '../config/db.js';

const BorrowModel = {

  // Lấy danh sách giao dịch với phân trang, search, filter
  async findAll({ search = '', status = '', page = 1, limit = 10, sortBy = 'borrow_date', sortOrder = 'DESC' }) {
    const offset = (Number(page) - 1) * Number(limit);
    const params = [];
    const where  = [];

    if (search) {
      params.push(`%${search}%`);
      where.push(`(
        u.full_name  ILIKE $${params.length} OR
        bk.title     ILIKE $${params.length} OR
        bc.barcode   ILIKE $${params.length}
      )`);
    }

    if (status) {
      params.push(status);
      where.push(`br.status = $${params.length}`);
    }

    const whereSQL      = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const allowedSort   = ['borrow_date', 'due_date', 'return_date', 'status'];
    const safeSortBy    = allowedSort.includes(sortBy) ? `br.${sortBy}` : 'br.borrow_date';
    const safeSortOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countRes = await getPool().query(
      `SELECT COUNT(*)
       FROM borrows br
       JOIN users      u  ON u.id  = br.user_id
       JOIN book_copies bc ON bc.id = br.book_copy_id
       JOIN books      bk ON bk.id = bc.book_id
       ${whereSQL}`,
      params
    );

    params.push(Number(limit), offset);

    const dataRes = await getPool().query(
      `SELECT
         br.id,
         br.borrow_date,
         br.due_date,
         br.return_date,
         br.status,
         u.id         AS reader_id,
         u.full_name  AS reader_name,
         u.avatar_url AS reader_avatar,
         u.email      AS reader_email,
         bc.barcode,
         bk.id        AS book_id,
         bk.title     AS book_title,
         bk.book_cover,
         bk.author    AS book_author
       FROM borrows br
       JOIN users      u  ON u.id  = br.user_id
       JOIN book_copies bc ON bc.id = br.book_copy_id
       JOIN books      bk ON bk.id = bc.book_id
       ${whereSQL}
       ORDER BY ${safeSortBy} ${safeSortOrder}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      borrows: dataRes.rows,
      total:   Number(countRes.rows[0].count),
    };
  },

  // Lấy chi tiết 1 giao dịch
  async findById(id) {
    const result = await getPool().query(
      `SELECT
         br.id,
         br.borrow_date,
         br.due_date,
         br.return_date,
         br.status,
         u.id         AS reader_id,
         u.full_name  AS reader_name,
         u.avatar_url AS reader_avatar,
         u.email      AS reader_email,
         u.phone      AS reader_phone,
         bc.barcode,
         bk.id        AS book_id,
         bk.title     AS book_title,
         bk.book_cover,
         bk.author    AS book_author,
         bk.genre     AS book_genre
       FROM borrows br
       JOIN users      u  ON u.id  = br.user_id
       JOIN book_copies bc ON bc.id = br.book_copy_id
       JOIN books      bk ON bk.id = bc.book_id
       WHERE br.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Tạo giao dịch mượn mới
  async create({ user_id, barcode, due_date }) {
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      // Tìm book_copy theo barcode
      const copyRes = await client.query(
        `SELECT bc.id, bc.status, bc.book_id
         FROM book_copies bc
         WHERE bc.barcode = $1`,
        [barcode]
      );

      if (!copyRes.rows[0]) throw new Error('Barcode not found');
      if (copyRes.rows[0].status !== 'available')
        throw new Error(`Book copy is currently ${copyRes.rows[0].status}`);

      // Kiểm tra reader có đang bị suspended/banned không
      const userRes = await client.query(
        `SELECT status FROM users WHERE id = $1 AND role = 'reader'`,
        [user_id]
      );
      if (!userRes.rows[0]) throw new Error('Reader not found');
      if (userRes.rows[0].status !== 'active')
        throw new Error(`Reader account is ${userRes.rows[0].status}`);

      const copy = copyRes.rows[0];

      // Tạo borrow record
      const borrowRes = await client.query(
        `INSERT INTO borrows (user_id, book_copy_id, borrow_date, due_date, status)
         VALUES ($1, $2, CURRENT_DATE, $3, 'borrowing')
         RETURNING id`,
        [user_id, copy.id, due_date]
      );

      // Cập nhật trạng thái copy → borrowed
      await client.query(
        `UPDATE book_copies SET status = 'borrowed' WHERE id = $1`,
        [copy.id]
      );

      // Cập nhật available của book
      await client.query(
        `UPDATE books SET available = available - 1 WHERE id = $1`,
        [copy.book_id]
      );

      await client.query('COMMIT');
      return borrowRes.rows[0].id;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Trả sách
  async returnBook(id) {
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      const borrowRes = await client.query(
        `SELECT br.id, br.status, br.book_copy_id, bc.book_id
         FROM borrows br
         JOIN book_copies bc ON bc.id = br.book_copy_id
         WHERE br.id = $1`,
        [id]
      );

      if (!borrowRes.rows[0]) throw new Error('Borrow record not found');
      if (borrowRes.rows[0].status === 'returned')
        throw new Error('Book already returned');

      const { book_copy_id, book_id } = borrowRes.rows[0];

      // Cập nhật borrow → returned
      const updated = await client.query(
        `UPDATE borrows
         SET status = 'returned', return_date = CURRENT_DATE
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      // Copy → available
      await client.query(
        `UPDATE book_copies SET status = 'available' WHERE id = $1`,
        [book_copy_id]
      );

      // Book available + borrowed_all_time
      await client.query(
        `UPDATE books
         SET available         = available + 1,
             borrowed_all_time = borrowed_all_time + 1
         WHERE id = $1`,
        [book_id]
      );

      await client.query('COMMIT');
      return updated.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Cập nhật overdue hàng loạt (gọi qua cron hoặc thủ công)
  async markOverdue() {
    const result = await getPool().query(
      `UPDATE borrows
       SET status = 'overdue'
       WHERE status = 'borrowing' AND due_date < CURRENT_DATE
       RETURNING id`
    );
    return result.rowCount;
  },
};

export default BorrowModel;