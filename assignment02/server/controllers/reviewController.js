const Review = require('../models/Review');
const Title = require('../models/Title');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get reviews for a title
// @route   GET /api/reviews?titleId=xxx
// @access  Public
const getReviews = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      titleId,
      userId
    } = req.query;

    const query = {};
    if (titleId) query.titleId = titleId;
    if (userId) query.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'username avatar')
        .populate('titleId', 'name poster type')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Review.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
const getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'username avatar')
      .populate('titleId', 'name poster type')
      .lean();

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { titleId, rating, text } = req.body;

    // Check if title exists
    const title = await Title.findById(titleId);
    if (!title) {
      throw new AppError('Title not found', 404);
    }

    // Check if user already reviewed this title
    const existingReview = await Review.findOne({
      userId: req.user._id,
      titleId
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this title', 400);
    }

    const review = await Review.create({
      userId: req.user._id,
      titleId,
      rating,
      text
    });

    // Populate user data
    await review.populate('userId', 'username avatar');
    await review.populate('titleId', 'name poster type');

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (owner only)
const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check ownership
    if (review.userId.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized to update this review', 403);
    }

    const { rating, text } = req.body;
    const updates = {};
    if (rating !== undefined) updates.rating = rating;
    if (text !== undefined) updates.text = text;

    review = await Review.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('userId', 'username avatar')
      .populate('titleId', 'name poster type');

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (owner or admin)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check ownership or admin
    if (
      review.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      throw new AppError('Not authorized to delete this review', 403);
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's review for a specific title
// @route   GET /api/reviews/my/:titleId
// @access  Private
const getMyReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      userId: req.user._id,
      titleId: req.params.titleId
    })
      .populate('titleId', 'name poster type')
      .lean();

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getMyReview
};
