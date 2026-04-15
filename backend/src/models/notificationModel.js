import getPool from '../config/db.js';
 
const NotificationModel = {
 
  // Tạo notification
  async create({ user_id, type = 'general', title, message }) {
    const res = await getPool().query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, type, title, message]
    );
    return res.rows[0];
  },
 
  // Tạo nhiều notifications cùng lúc
  async createBulk(notifications) {
    if (!notifications.length) return [];
    const values    = [];
    const placeholders = [];
    notifications.forEach((n, i) => {
      const base = i * 4;
      placeholders.push(`($${base+1}, $${base+2}, $${base+3}, $${base+4})`);
      values.push(n.user_id, n.type || 'general', n.title, n.message);
    });
    const res = await getPool().query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ${placeholders.join(',')} RETURNING *`,
      values
    );
    return res.rows;
  },
 
  // Lấy notifications của user
  async findByUser(userId, { page = 1, limit = 20 } = {}) {
    const offset = (Number(page) - 1) * Number(limit);
 
    const [countRes, dataRes, unreadRes] = await Promise.all([
      getPool().query(`SELECT COUNT(*) FROM notifications WHERE user_id = $1`, [userId]),
      getPool().query(
        `SELECT * FROM notifications WHERE user_id = $1
         ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [userId, Number(limit), offset]
      ),
      getPool().query(
        `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
      ),
    ]);
 
    return {
      notifications: dataRes.rows,
      total:         Number(countRes.rows[0].count),
      unread_count:  Number(unreadRes.rows[0].count),
    };
  },
 
  // Đánh dấu đã đọc
  async markRead(userId, notificationId) {
    await getPool().query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
  },
 
  // Đánh dấu tất cả đã đọc
  async markAllRead(userId) {
    await getPool().query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
  },
 
  // Unread count
  async getUnreadCount(userId) {
    const res = await getPool().query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return Number(res.rows[0].count);
  },
};
 
export default NotificationModel;