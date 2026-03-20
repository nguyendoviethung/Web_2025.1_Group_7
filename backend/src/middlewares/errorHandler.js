// Middleware xử lý lỗi toàn cục

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // PostgreSQL errors
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Data already exists' });
  }

  // Foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Related data not found' });
  }

  // Thiếu trường bắt buộc
  if (err.code === '23502') {
    return res.status(400).json({ message: 'Missing required field' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  // Token hết hạn
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  // Mặc định trả về lỗi 500
  return res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
};

export default errorHandler;