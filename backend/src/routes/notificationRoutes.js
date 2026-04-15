import { Router }                from 'express';
import { authenticate }          from '../middlewares/authMiddleware.js';
import notificationController    from '../controllers/notificationController.js';
 
const router = Router();
router.use(authenticate);
 
router.get('/',            notificationController.getAll);
router.get('/unread-count',notificationController.getUnreadCount);
router.patch('/:id/read',  notificationController.markRead);
router.patch('/read-all',  notificationController.markAllRead);
 
export default router;
 