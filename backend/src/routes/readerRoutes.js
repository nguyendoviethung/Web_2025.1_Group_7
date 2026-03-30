import { Router }       from 'express';
import readerController from '../controllers/readerController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize }    from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('staff'));

router.get('/',             readerController.getAll);
router.get('/:id',          readerController.getById);
router.get('/:id/history',  readerController.getBorrowHistory);
router.patch('/:id/status', readerController.updateStatus);

export default router;