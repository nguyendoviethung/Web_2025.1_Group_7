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

  // Lượt mượn theo tháng 
async getMonthlyLoans() {
  const result = await getPool().query(`
    WITH months AS (
      SELECT generate_series(
        DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months'),
        DATE_TRUNC('month', CURRENT_DATE),
        INTERVAL '1 month'
      )::date AS month_start
    ),
    loan_counts AS (
      SELECT
        DATE_TRUNC('month', borrow_date)::date AS month_start,
        COUNT(*) AS loans
      FROM borrows
      WHERE borrow_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months')
      GROUP BY DATE_TRUNC('month', borrow_date)::date
    )
    SELECT
      TO_CHAR(m.month_start, 'MM/YYYY') AS month,
      COALESCE(l.loans, 0)              AS loans
    FROM months m
    LEFT JOIN loan_counts l ON l.month_start = m.month_start
    ORDER BY m.month_start ASC
  `);
  return result.rows.map(r => ({
    month: r.month,
    loans: Number(r.loans),
  }));
},

// Top 8 thể loại được mượn nhiều nhất
async getCategoryDistribution() {
  const result = await getPool().query(`
      SELECT
        COALESCE(b.genre, 'Khác') AS category,
        COUNT(br.id) AS total_borrows,
        COUNT(DISTINCT b.id) AS total_titles
      FROM books b
      LEFT JOIN book_copies bc ON bc.book_id = b.id
      LEFT JOIN borrows br ON br.book_copy_id = bc.id
      GROUP BY b.genre
      HAVING COUNT(br.id) > 0
      ORDER BY total_borrows DESC
      LIMIT 8;
  `);
  return result.rows.map(r => ({
    category:      r.category,
    total_borrows: Number(r.total_borrows),
    total_titles:  Number(r.total_titles),
  }));
},

  // Top 5 người mượn nhiều nhất
  async getTopReaders() {
    const result = await getPool().query(`
      SELECT
        u.id            AS id,
        u.full_name     AS name,
        u.avatar_url    AS avatar,
        COUNT(b.id)     AS value
      FROM users u
      JOIN borrows b ON b.user_id = u.id
      WHERE 
        u.role = 'reader'
        AND EXTRACT(YEAR FROM b.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY u.id, u.full_name, u.avatar_url
      ORDER BY value DESC
      LIMIT 5
    `);

    return result.rows.map(r => ({
      id:     r.id,
      name:   r.name,
      avatar: r.avatar,
      value:  Number(r.value),
    }));
  },
  
  // Top 5 sách được mượn nhiều nhất
async getTopBooks() {
  const result = await getPool().query(`
    SELECT
      b.id,
      b.title,
      b.book_cover AS cover,

      COUNT(DISTINCT (br.user_id, b.id)) AS loans

    FROM books b
    LEFT JOIN book_copies bc ON bc.book_id = b.id
    LEFT JOIN borrows br ON br.book_copy_id = bc.id

    GROUP BY b.id
    HAVING COUNT(br.id) > 0
    ORDER BY loans DESC
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