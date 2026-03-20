import { Router }       from 'express';
import authRoutes       from './authRoutes.js';
import dashboardRoutes  from './dashboardRoutes.js';
import bookRoutes       from './bookRoutes.js';

const router = Router();

router.use('/auth',      authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/books',     bookRoutes);

export default router;