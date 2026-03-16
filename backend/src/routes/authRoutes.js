import { Router } from 'express';
const router = Router();

import authController from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';

router.post(
  '/register',
  validate.validateRegister,
  authController.register
);

router.post(
  '/login',
  validate.validateLogin,
  authController.login
);

router.post(
  '/refresh',
  authController.refreshToken
);

router.post(
  '/logout',
  authController.logout
);

router.get(
  '/me',
  authMiddleware.authenticate,
  authController.getMe
);

export default router;