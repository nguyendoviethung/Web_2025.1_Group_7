import getPool from '../config/db.js';
 
const ReviewModel = {
 
  // Kiểm tra user đã TRẢ sách này chưa (không chỉ mượn)
  async checkCanReview(userId, bookId) {
    const res = await getPool().query(
      `SELECT b.id AS borrow_id, b.return_date
       FROM borrows b
       JOIN book_copies bc ON bc.id = b.book_copy_id
       WHERE b.user_id = $1
         AND bc.book_id = $2
         AND b.status = 'returned'   -- ← CHỈ cho phép khi đã trả
       ORDER BY b.return_date DESC
       LIMIT 1`,
      [userId, bookId]
    );
    return res.rows[0] || null;       // null = chưa từng trả sách này
  },
 
  // Tạo hoặc cập nhật review (upsert)
  async upsert(userId, bookId, borrowId, { rating, content }) {
    // Bắt buộc phải đã TRẢ sách mới được review
    const returned = await this.checkCanReview(userId, bookId);
    if (!returned) {
      throw new Error('You can only review books you have returned');
    }
 
    const res = await getPool().query(
      `INSERT INTO book_reviews (user_id, book_id, borrow_id, rating, content)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, book_id)
       DO UPDATE SET rating = $4, content = $5, borrow_id = $3, updated_at = NOW()
       RETURNING *`,
      [userId, bookId, borrowId || returned.borrow_id, rating, content?.trim() || null]
    );
    return res.rows[0];
  },
 
  // Xóa review
  async delete(userId, reviewId) {
    const res = await getPool().query(
      `DELETE FROM book_reviews WHERE id = $1 AND user_id = $2 RETURNING *`,
      [reviewId, userId]
    );
    if (!res.rows[0]) throw new Error('Review not found');
    return res.rows[0];
  },
 
  // Reviews của 1 cuốn sách (public)
  async findByBook(bookId, { page = 1, limit = 10 } = {}) {
    const offset = (Number(page) - 1) * Number(limit);
    const borrowerReviewWhere = `
      r.book_id = $1
      AND r.is_approved = TRUE
      AND EXISTS (
        SELECT 1
        FROM borrows br
        JOIN book_copies bc ON bc.id = br.book_copy_id
        WHERE br.user_id = r.user_id
          AND bc.book_id = r.book_id
          AND br.status = 'returned'
      )
    `;
 
    const [countRes, dataRes, distRes] = await Promise.all([
      getPool().query(
        `SELECT COUNT(*)
         FROM book_reviews r
         WHERE ${borrowerReviewWhere}`,
        [bookId]
      ),
      getPool().query(
        `SELECT r.id, r.rating, r.content, r.created_at,
                u.full_name AS reviewer_name, u.avatar_url AS reviewer_avatar
         FROM book_reviews r
         JOIN users u ON u.id = r.user_id
         WHERE ${borrowerReviewWhere}
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [bookId, Number(limit), offset]
      ),
      getPool().query(
        `SELECT rating, COUNT(*) AS count
         FROM book_reviews r
         WHERE ${borrowerReviewWhere}
         GROUP BY rating ORDER BY rating DESC`,
        [bookId]
      ),
    ]);
 
    return {
      reviews:      dataRes.rows,
      total:        Number(countRes.rows[0].count),
      distribution: distRes.rows.map(r => ({ rating: Number(r.rating), count: Number(r.count) })),
    };
  },
 
  // Review của user hiện tại cho 1 sách + trạng thái có thể review không
  async findUserReviewStatus(userId, bookId) {
    const [reviewRes, canReviewRes] = await Promise.all([
      getPool().query(
        `SELECT * FROM book_reviews WHERE user_id = $1 AND book_id = $2`,
        [userId, bookId]
      ),
      // Kiểm tra đã trả sách chưa
      getPool().query(
        `SELECT b.id AS borrow_id FROM borrows b
         JOIN book_copies bc ON bc.id = b.book_copy_id
         WHERE b.user_id = $1 AND bc.book_id = $2 AND b.status = 'returned'
         LIMIT 1`,
        [userId, bookId]
      ),
    ]);
 
    return {
      review:     reviewRes.rows[0] || null,
      canReview:  !!canReviewRes.rows[0],   // true = đã trả → được phép review
      borrowId:   canReviewRes.rows[0]?.borrow_id || null,
    };
  },
 
  // Sách đã trả nhưng chưa review (gợi ý review)
  async getPendingReviews(userId) {
    const res = await getPool().query(
      `SELECT DISTINCT bk.id, bk.title, bk.book_cover, bk.author,
              br.id AS borrow_id, br.return_date
       FROM borrows br
       JOIN book_copies bc ON bc.id = br.book_copy_id
       JOIN books bk       ON bk.id = bc.book_id
       WHERE br.user_id = $1 AND br.status = 'returned'
         AND NOT EXISTS (
           SELECT 1 FROM book_reviews rv
           WHERE rv.user_id = $1 AND rv.book_id = bk.id
         )
       ORDER BY br.return_date DESC
       LIMIT 5`,
      [userId]
    );
    return res.rows;
  },
 
  // Lịch sử reviews của user
  async findByUser(userId) {
    const res = await getPool().query(
      `SELECT r.*, b.title AS book_title, b.book_cover, b.author AS book_author
       FROM book_reviews r
       JOIN books b ON b.id = r.book_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return res.rows;
  },
};
 
export default ReviewModel;
