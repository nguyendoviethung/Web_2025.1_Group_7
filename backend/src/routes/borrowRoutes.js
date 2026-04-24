import { Router }       from 'express';
import borrowController from '../controllers/borrowController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize }    from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('staff'));

// Danh sách & chi tiết
router.get('/',                          borrowController.getAll);
router.get('/:id',                       borrowController.getById);
// Kiểm tra trước khi thao tác
router.get('/check-reader/:studentId',   borrowController.checkReader);
router.get('/check-barcode/:barcode',    borrowController.checkBarcode);
router.get('/check-return/:barcode',     borrowController.checkReturnBarcode);

// Tạo & trả
router.post('/batch',                    borrowController.createBatch);
router.post('/return-batch',             borrowController.returnBatch);

// Tiện ích
router.patch('/mark-overdue',            borrowController.markOverdue);

export default router;