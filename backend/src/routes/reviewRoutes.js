import { Router }      from 'express';
import { authenticate }from '../middlewares/authMiddleware.js';
import { authorize }   from '../middlewares/roleMiddleware.js';
import reviewController from '../controllers/reviewController.js';
 
const router = Router();
router.use(authenticate);
 
router.post('/',                   authorize('reader'), reviewController.upsert);
router.delete('/:id',              authorize('reader'), reviewController.delete);
router.get('/my',                  authorize('reader'), reviewController.getMy);
router.get('/my/pending',          authorize('reader'), reviewController.getPending);
router.get('/my/book/:bookId',     authorize('reader'), reviewController.getMyReview);
router.get('/book/:bookId',                             reviewController.getByBook);  // public
 
export default router;