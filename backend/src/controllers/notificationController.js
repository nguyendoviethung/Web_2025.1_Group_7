import NotificationModel from '../models/notificationModel.js';
 
const notificationController = {
 
  async getAll(req, res) {
    try {
      const data = await NotificationModel.findByUser(req.user.id, req.query);
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
 
  async markRead(req, res) {
    try {
      await NotificationModel.markRead(req.user.id, req.params.id);
      return res.json({ message: 'Marked as read' });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
 
  async markAllRead(req, res) {
    try {
      await NotificationModel.markAllRead(req.user.id);
      return res.json({ message: 'All marked as read' });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
 
  async getUnreadCount(req, res) {
    try {
      const unread_count = await NotificationModel.getUnreadCount(req.user.id);
      return res.json({ unread_count });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};
 
export default notificationController;