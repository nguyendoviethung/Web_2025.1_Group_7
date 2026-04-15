import { Router }      from 'express';
import { authenticate }from '../middlewares/authMiddleware.js';
import chatController  from '../controllers/chatController.js';
 
const chatRouter = Router();
chatRouter.use(authenticate);
 
chatRouter.get('/staff',               chatController.getStaffList);
chatRouter.get('/conversations',       chatController.getConversations);
chatRouter.get('/messages/:partnerId', chatController.getMessages);
chatRouter.post('/messages',           chatController.sendMessage);
chatRouter.patch('/read/:partnerId',   chatController.markRead);
chatRouter.get('/unread-count',        chatController.getUnreadCount);
 
export { chatRouter };