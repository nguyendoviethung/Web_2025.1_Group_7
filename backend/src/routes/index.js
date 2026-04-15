import { Router }           from 'express';
import authRoutes           from './authRoutes.js';
import dashboardRoutes      from './dashboardRoutes.js';
import bookRoutes           from './bookRoutes.js';
import readerRoutes         from './readerRoutes.js';
import borrowRoutes         from './borrowRoutes.js';
import readerProfileRoutes  from './readerProfileRoutes.js';
import { chatRouter }       from './chatRoutes.js';
import reservationRoutes    from './reservationRoutes.js';
import reviewRoutes         from './reviewRoutes.js';
import notificationRoutes   from './notificationRoutes.js';
 
const router = Router();
 
router.use('/auth',           authRoutes);
router.use('/dashboard',      dashboardRoutes);
router.use('/books',          bookRoutes);
router.use('/readers',        readerRoutes);
router.use('/borrows',        borrowRoutes);
router.use('/reader-profile', readerProfileRoutes);
router.use('/chat',           chatRouter);
router.use('/reservations',   reservationRoutes);
router.use('/reviews',        reviewRoutes);
router.use('/notifications',  notificationRoutes);
 
export default router;