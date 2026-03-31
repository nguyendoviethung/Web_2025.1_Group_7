import { Router }        from 'express';
import borrowController  from '../controllers/borrowController.js';
import { authenticate }  from '../middlewares/authMiddleware.js';
import { authorize }     from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('staff'));

router.get('/',                  borrowController.getAll);
router.get('/:id',               borrowController.getById);
router.post('/',                 borrowController.create);
router.patch('/:id/return',      borrowController.returnBook);
router.patch('/mark-overdue',    borrowController.markOverdue);

export default router;