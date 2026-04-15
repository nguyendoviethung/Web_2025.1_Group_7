// backend/src/controllers/chatController.js
import ChatModel from '../models/chatModel.js';

const chatController = {

  // GET /api/chat/staff
  async getStaffList(req, res) {
    try {
      const staff = await ChatModel.getStaffList();
      return res.json({ staff });
    } catch (err) {
      console.error('getStaffList:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/chat/conversations
  async getConversations(req, res) {
    try {
      const conversations = await ChatModel.getConversations(req.user.id);
      return res.json({ conversations });
    } catch (err) {
      console.error('getConversations:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/chat/messages/:partnerId
  async getMessages(req, res) {
    try {
      const partnerId = Number(req.params.partnerId);
      if (!partnerId) return res.status(400).json({ message: 'Invalid partnerId' });

      const data = await ChatModel.getMessages(req.user.id, partnerId, req.query);
      return res.json(data);
    } catch (err) {
      console.error('getMessages:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // POST /api/chat/messages  — HTTP fallback (WebSocket là primary)
  async sendMessage(req, res) {
    try {
      const { receiver_id, content } = req.body;
      if (!receiver_id || !content?.trim())
        return res.status(400).json({ message: 'receiver_id and content are required' });

      const msg = await ChatModel.createMessage(req.user.id, receiver_id, content);
      return res.status(201).json({ message: msg });
    } catch (err) {
      console.error('sendMessage:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PATCH /api/chat/read/:partnerId
  async markRead(req, res) {
    try {
      await ChatModel.markRead(req.user.id, Number(req.params.partnerId));
      return res.json({ message: 'Marked as read' });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/chat/unread-count
  async getUnreadCount(req, res) {
    try {
      const unread_count = await ChatModel.getUnreadCount(req.user.id);
      return res.json({ unread_count });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};

export default chatController;