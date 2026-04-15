import ReviewModel from '../models/reviewModel.js';
 
const reviewController = {
 
  async upsert(req, res) {
    try {
      const { book_id, borrow_id, rating, content } = req.body;
      if (!book_id || !rating) return res.status(400).json({ message: 'book_id and rating are required' });
      if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });
 
      const review = await ReviewModel.upsert(req.user.id, book_id, borrow_id, { rating: Number(rating), content });
      return res.status(201).json({ message: 'Review saved', review });
    } catch (err) {
      return res.status(400).json({ message: err.message || 'Failed to save review' });
    }
  },
 
  async delete(req, res) {
    try {
      await ReviewModel.delete(req.user.id, req.params.id);
      return res.json({ message: 'Review deleted' });
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  },
 
  async getByBook(req, res) {
    try {
      const data = await ReviewModel.findByBook(req.params.bookId, req.query);
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
 
  // Trả về review + canReview (đã trả sách chưa)
  async getMyReview(req, res) {
    try {
      const status = await ReviewModel.findUserReviewStatus(req.user.id, req.params.bookId);
      return res.json(status);   // { review, canReview, borrowId }
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
 
  async getPending(req, res) {
    try {
      const books = await ReviewModel.getPendingReviews(req.user.id);
      return res.json({ books });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
 
  async getMy(req, res) {
    try {
      const reviews = await ReviewModel.findByUser(req.user.id);
      return res.json({ reviews });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};
 
export default reviewController;
 