import { body, validationResult } from 'express-validator';

// Middleware kiểm tra dữ liệu đầu vào cho các route auth
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({
        field:   e.path,
        message: e.msg,
      }))
    });
  }
  next();
};

// Validation rules cho route đăng ký (đảm bảo full_name, student_id, email, password hợp lệ)
const validateRegister = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),

  body('student_id')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required')
    .matches(/^\d+$/)               // chỉ cần là số, không giới hạn độ dài cứng
    .withMessage('Student ID must contain only numbers'),

  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .matches(/^[a-z0-9]+@datn\.edu\.vn$/)  // không dấu + số + @datn.edu.vn
    .withMessage('Invalid email format'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  handleValidationErrors,
];

// Validation cho route đăng nhập
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Invalid email format'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors,
];

export default { validateRegister, validateLogin };