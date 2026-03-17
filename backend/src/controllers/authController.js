import { hash, compare } from 'bcryptjs';
import UserModel from '../models/userModel.js';
import jwtHelper from '../utils/jwtHelper.js';

  const removeAccents = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
  };

const authController = {

  // ─── REGISTER ─────────────────────────
async register(req, res) {
    try {
      const { full_name, student_id, email, password } = req.body;

      // Verify email backend tự tính lại để đảm bảo đúng
      const expectedEmail = `${removeAccents(full_name)}${student_id.trim()}@datn.edu.vn`;

      if (email !== expectedEmail) {
        return res.status(400).json({
          message: `Invalid email format. Expected: ${expectedEmail}`
        });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      const hashedPassword = await hash(password, 10);

      const newUser = await UserModel.create({
        full_name: full_name.trim(),
        email,
        password:  hashedPassword,
        phone:     null,
        role:      'reader',
      });

      return res.status(201).json({
        message: 'Register successful',
        user:    newUser,
      });

    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // ─── LOGIN ─────────────────────────
  async login(req, res) {
    try {
       const { email, password } = req.body;

    // ─── DEBUG — xóa sau khi fix ───
    console.log('─────────────────────────────');
    console.log('BODY nhận được:', req.body);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('─────────────────────────────');

    const user = await UserModel.findByEmail(email);
    console.log('User tìm được:', user ? `id=${user.id}, email=${user.email}, status=${user.status}` : 'KHÔNG TÌM THẤY');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      console.log('TÀI KHOẢN KHÔNG ACTIVE:', user.status);
      return res.status(403).json({ message: 'Account disabled' });
    }

    console.log('Hash trong DB:', user.password);
    const isMatch = await compare(password, user.password);
    console.log('Password khớp:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

      const payload = { id: user.id, role: user.role };

      const accessToken = jwtHelper.generateAccessToken(payload);
      const refreshToken = jwtHelper.generateRefreshToken(payload);

      await UserModel.saveRefreshToken(user.id, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        message: 'Login successful',
        accessToken,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url
        }
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // ─── REFRESH TOKEN ─────────────────────────
  async refreshToken(req, res) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        return res.status(401).json({ message: 'No refresh token' });
      }

      const decoded = jwtHelper.verifyRefreshToken(token);

      const user = await UserModel.findByRefreshToken(token);
      if (!user) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const newAccessToken = jwtHelper.generateAccessToken({
        id: decoded.id,
        role: decoded.role
      });

      return res.json({ accessToken: newAccessToken });

    } catch (err) {
      return res.status(403).json({
        message: 'Refresh token expired, login again'
      });
    }
  },

  // ─── LOGOUT ─────────────────────────
  async logout(req, res) {
    try {
      const token = req.cookies.refreshToken;

      if (token) {
        const user = await UserModel.findByRefreshToken(token);
        if (user) {
          await UserModel.clearRefreshToken(user.id);
        }
      }

      res.clearCookie('refreshToken');

      return res.json({
        message: 'Logout successful'
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // ─── GET CURRENT USER ─────────────────────────
  async getMe(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({ user });

    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export default authController;