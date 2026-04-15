// ══════════════════════════════════════════════════════
// backend/src/routes/readerProfileRoutes.js
// ══════════════════════════════════════════════════════
import { Router }              from 'express';
import { authenticate }        from '../middlewares/authMiddleware.js';
import { authorize }           from '../middlewares/roleMiddleware.js';
import readerProfileController from '../controllers/readerProfileController.js';
 
const router = Router();
router.use(authenticate);
router.use(authorize('reader'));
 
router.get('/me',         readerProfileController.getMe);
router.get('/dashboard',  readerProfileController.getDashboardData);
router.get('/history',    readerProfileController.getBorrowHistory);
router.patch('/me',       readerProfileController.updateProfile);
router.patch('/avatar',   readerProfileController.updateAvatar);
 
export default router;