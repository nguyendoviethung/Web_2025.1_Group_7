import { Router }       from 'express';
import authRoutes       from './authRoutes.js';
import dashboardRoutes  from './dashboardRoutes.js';

const router = Router();

router.use('/auth',      authRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;