import { Router }            from 'express';
import { authenticate }       from '../middlewares/authMiddleware.js';
import { authorize }          from '../middlewares/roleMiddleware.js';
import reservationController  from '../controllers/reservationController.js';

const router = Router();
router.use(authenticate);

// ── Reader routes ────────────────────────────────────
router.post('/',      authorize('reader'), reservationController.create);
router.delete('/:id', authorize('reader'), reservationController.cancel);
router.get('/my',     authorize('reader'), reservationController.getMy);

// ── Admin routes ─────────────────────────────────────
router.get('/',                    authorize('staff'), reservationController.getAll);
router.patch('/:id/ready',         authorize('staff'), reservationController.markReady);
router.patch('/:id/cancel',        authorize('staff'), reservationController.adminCancel);
router.post('/:id/promote-next',   authorize('staff'), reservationController.promoteNext);

export default router;