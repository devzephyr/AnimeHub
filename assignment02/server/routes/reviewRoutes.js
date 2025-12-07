const express = require('express');
const router = express.Router();
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getMyReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { reviewValidation, paramValidation, paginationValidation } = require('../middleware/validation');

// Public routes
router.get('/', paginationValidation, getReviews);
router.get('/:id', paramValidation.mongoId, getReview);

// Protected routes
router.get('/my/:titleId', protect, getMyReview);
router.post('/', protect, reviewValidation.create, createReview);
router.put('/:id', protect, paramValidation.mongoId, reviewValidation.update, updateReview);
router.delete('/:id', protect, paramValidation.mongoId, deleteReview);

module.exports = router;
