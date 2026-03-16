import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({
        field: e.path,
        message: e.msg
      }))
    });
  }

  next();
};

const validateRegister = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),

  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .matches(/^[A-Za-z0-9._%+-]+@datn\.edu\.vn$/)
    .withMessage('Email must end with @datn.edu.vn'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Invalid email format'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

export default {
  validateRegister,
  validateLogin
};