import { Router }       from 'express';
import authRoutes       from './authRoutes.js';
import dashboardRoutes  from './dashboardRoutes.js';
import bookRoutes       from './bookRoutes.js';
import readerRoutes     from './readerRoutes.js';
const router = Router();

router.use('/auth',      authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/books',     bookRoutes);
router.use('/readers',   readerRoutes);
export default router;