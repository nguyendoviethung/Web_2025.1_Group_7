import jwt from 'jsonwebtoken';

const { sign, verify } = jwt;

const jwtHelper = {

  // Tạo access token (15 phút)
  generateAccessToken(payload) {
    return sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });
  },

  // Tạo refresh token (7 ngày)
  generateRefreshToken(payload) {
    return sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d'
    });
  },

  // Verify access token
  verifyAccessToken(token) {
    return verify(token, process.env.JWT_SECRET);
  },

  // Verify refresh token
  verifyRefreshToken(token) {
    return verify(token, process.env.JWT_REFRESH_SECRET);
  }

};

export default jwtHelper;