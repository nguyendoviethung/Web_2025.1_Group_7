import getPool from '../config/db.js';

const DashboardModel = {

  // ─── STATS: 4 thẻ tổng quan ─────────────────────────
  async getStats() {
    const result = await getPool().query(`
      SELECT
        (SELECT COUNT(*)                FROM books)                        AS "totalBooks",
        (SELECT COUNT(DISTINCT user_id) FROM borrows)                      AS "totalReaders",
        (SELECT COUNT(*)                FROM borrows WHERE status = 'overdue')  AS "overdueBooks",
        (SELECT COUNT(*)                FROM borrows WHERE status = 'borrowing') AS "totalBorrowed"
    `);
    return result.rows[0];
  },

  // ─── TOP BORROWED CATEGORIES ─────────────────────────
async getCategoryDistribution() {
  const result = await getPool().query(`
    SELECT
      COALESCE(b.genre, 'Khác')   AS category,
      COUNT(br.id)                AS total_borrows,
      COUNT(DISTINCT b.id)        AS total_titles
    FROM books b
    LEFT JOIN book_copies bc ON bc.book_id = b.id
    LEFT JOIN borrows br     ON br.book_copy_id = bc.id
    GROUP BY b.genre
    ORDER BY total_borrows DESC
    LIMIT 8
  `);
  return result.rows.map(r => ({
    category:      r.category,
    total_borrows: Number(r.total_borrows),
    total_titles:  Number(r.total_titles),
  }));
},
  // ─── MONTHLY LOANS: lượt mượn theo tháng ────────────
  async getMonthlyLoans() {
    const result = await getPool().query(`
      SELECT
        TO_CHAR(borrow_date, 'MM/YYYY') AS month,
        COUNT(*)                        AS loans
      FROM borrows
      WHERE borrow_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(borrow_date, 'MM/YYYY'),
               TO_CHAR(borrow_date, 'YYYY-MM')
      ORDER BY TO_CHAR(borrow_date, 'YYYY-MM') ASC
    `);
    return result.rows.map(r => ({
      month: r.month,
      loans: Number(r.loans),
    }));
  },

// ─── TOP BORROWED CATEGORIES ─────────────────────────
async getCategoryDistribution() {
  const result = await getPool().query(`
    SELECT
      COALESCE(b.genre, 'Khác')   AS category,
      COUNT(br.id)                AS total_borrows,
      COUNT(DISTINCT b.id)        AS total_titles
    FROM books b
    LEFT JOIN book_copies bc ON bc.book_id = b.id
    LEFT JOIN borrows br     ON br.book_copy_id = bc.id
    GROUP BY b.genre
    ORDER BY total_borrows DESC
    LIMIT 8
  `);
  return result.rows.map(r => ({
    category:      r.category,
    total_borrows: Number(r.total_borrows),
    total_titles:  Number(r.total_titles),
  }));
},

  // ─── TOP ACTIVE READERS: người mượn nhiều nhất ──────
  async getTopReaders() {
    const result = await getPool().query(`
      SELECT
        u.full_name               AS name,
        COUNT(b.id)               AS value
      FROM users u
      JOIN borrows b ON b.user_id = u.id
      WHERE u.role = 'reader'
      GROUP BY u.id, u.full_name
      ORDER BY value DESC
      LIMIT 8
    `);
    return result.rows.map(r => ({
      name:  r.name,
      value: Number(r.value),
    }));
  },

  // ─── TOP BORROWED BOOKS: sách được mượn nhiều nhất ──
  async getTopBooks() {
    const result = await getPool().query(`
      SELECT
        b.id,
        b.title,
        b.book_cover              AS cover,
        b.borrowed_all_time       AS loans
      FROM books b
      WHERE b.borrowed_all_time > 0
      ORDER BY b.borrowed_all_time DESC
      LIMIT 5
    `);
    return result.rows.map(r => ({
      id:    r.id,
      title: r.title,
      cover: r.cover || 'https://placehold.co/60x80?text=No+Cover',
      loans: Number(r.loans),
    }));
  },
};


export default DashboardModel;