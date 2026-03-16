import getPool from '../config/db.js';

const UserModel = {

  // Tìm user theo email (login)
  async findByEmail(email) {
    const result = await getPool().query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  // Tìm user theo id
  async findById(id) {
    const result = await getPool().query(
      `SELECT id, full_name, email, role, status, avatar_url, phone
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Tạo user mới
  async create({ full_name, email, password, phone, role = 'reader' }) {
    const result = await getPool().query(
      `INSERT INTO users (full_name, email, password, phone, role, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING id, full_name, email, role, status, phone, created_at`,
      [full_name, email, password, phone, role]
    );

    return result.rows[0];
  },

  // Lưu refresh token
  async saveRefreshToken(userId, token) {
    await getPool().query(
      `UPDATE users SET refresh_token = $1 WHERE id = $2`,
      [token, userId]
    );
  },

  // Logout
  async clearRefreshToken(userId) {
    await getPool().query(
      `UPDATE users SET refresh_token = NULL WHERE id = $1`,
      [userId]
    );
  },

  // Tìm theo refresh token
  async findByRefreshToken(token) {
    const result = await getPool().query(
      'SELECT * FROM users WHERE refresh_token = $1',
      [token]
    );
    return result.rows[0] || null;
  },
};

export default UserModel;