import { Router }          from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate }    from '../middlewares/authMiddleware.js';
import { authorize }       from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('staff'));

router.get('/stats',                 dashboardController.getStats);
router.get('/monthly-loans',         dashboardController.getMonthlyLoans);
router.get('/category-distribution', dashboardController.getCategoryDistribution); // ← thêm
router.get('/age-distribution',      dashboardController.getAgeDistribution);
router.get('/top-books',             dashboardController.getTopBooks);

export default router;