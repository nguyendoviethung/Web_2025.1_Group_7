// backend/src/models/chatModel.js
import getPool from '../config/db.js';

const ChatModel = {

  // Danh sách staff active
  async getStaffList() {
    const res = await getPool().query(
      `SELECT id, full_name, avatar_url, email
       FROM users
       WHERE role = 'staff' AND status = 'active'
       ORDER BY full_name ASC`
    );
    return res.rows;
  },

  // Danh sách conversations của userId
  async getConversations(userId) {
    const res = await getPool().query(
      `SELECT DISTINCT ON (partner_id)
         partner_id,
         u.full_name    AS partner_name,
         u.avatar_url   AS partner_avatar,
         u.role         AS partner_role,
         m.content      AS last_message,
         m.created_at   AS last_message_time,
         (
           SELECT COUNT(*)
           FROM messages
           WHERE sender_id = partner_id
             AND receiver_id = $1
             AND is_read = false
         ) AS unread_count
       FROM (
         SELECT
           CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS partner_id,
           MAX(id) AS last_msg_id
         FROM messages
         WHERE sender_id = $1 OR receiver_id = $1
         GROUP BY partner_id
       ) conv
       JOIN users    u ON u.id = conv.partner_id
       JOIN messages m ON m.id = conv.last_msg_id
       ORDER BY partner_id, last_message_time DESC`,
      [userId]
    );
    return res.rows;
  },

  // Lấy messages giữa 2 người, phân trang
  async getMessages(userId, partnerId, { page = 1, limit = 100 } = {}) {
    const offset = (Number(page) - 1) * Number(limit);

    const [countRes, dataRes] = await Promise.all([
      getPool().query(
        `SELECT COUNT(*) FROM messages
         WHERE (sender_id=$1 AND receiver_id=$2)
            OR (sender_id=$2 AND receiver_id=$1)`,
        [userId, partnerId]
      ),
      getPool().query(
        `SELECT id, sender_id, receiver_id, content, is_read, created_at
         FROM messages
         WHERE (sender_id=$1 AND receiver_id=$2)
            OR (sender_id=$2 AND receiver_id=$1)
         ORDER BY created_at ASC
         LIMIT $3 OFFSET $4`,
        [userId, partnerId, Number(limit), offset]
      ),
    ]);

    return {
      messages: dataRes.rows,
      total:    Number(countRes.rows[0].count),
    };
  },

  // Lưu tin nhắn mới
  async createMessage(senderId, receiverId, content) {
    const res = await getPool().query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id, receiver_id, content, is_read, created_at`,
      [senderId, Number(receiverId), content.trim()]
    );
    return res.rows[0];
  },

  // Đánh dấu đã đọc
  async markRead(receiverId, senderId) {
    await getPool().query(
      `UPDATE messages SET is_read = true
       WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false`,
      [receiverId, senderId]
    );
  },

  // Tổng unread của userId
  async getUnreadCount(userId) {
    const res = await getPool().query(
      `SELECT COUNT(*) AS count FROM messages
       WHERE receiver_id = $1 AND is_read = false`,
      [userId]
    );
    return Number(res.rows[0].count);
  },
};

export default ChatModel;