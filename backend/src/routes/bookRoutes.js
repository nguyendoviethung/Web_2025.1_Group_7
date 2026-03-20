import { Router }       from 'express';
import bookController   from '../controllers/bookController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize }    from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/genres',            bookController.getGenres);
router.get('/',                  bookController.getAll);
router.get('/:id',               bookController.getById);
router.get('/:id/copies',        bookController.getCopies);

router.post('/',                 authorize('staff'), bookController.create);
router.put('/:id',               authorize('staff'), bookController.update);
router.delete('/:id',            authorize('staff'), bookController.delete);
router.post('/:id/copies',       authorize('staff'), bookController.addCopy);
router.put('/copies/:copyId',    authorize('staff'), bookController.updateCopy);
router.delete('/copies/:copyId', authorize('staff'), bookController.deleteCopy);

export default router;