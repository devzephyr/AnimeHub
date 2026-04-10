const Watchlist = require('../models/Watchlist');
const Title = require('../models/Title');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const watchlist = await Watchlist.findByUserId(req.user._id, { populate: true });

    // Filter by status if provided
    let items = watchlist.items || [];
    if (status) {
      items = items.filter(item => item.status === status);
    }

    // Manual pagination
    const total = items.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    items = items.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        ...watchlist,
        items
      },
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

// @desc    Add item to watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res, next) => {
  try {
    const { titleId, status = 'plan_to_watch' } = req.body;

    // Check if title exists
    const title = await Title.findById(titleId);
    if (!title) {
      throw new AppError('Title not found', 404);
    }

    // Check if already in watchlist
    const existing = await Watchlist.checkItem(req.user._id, titleId);

    // Add or update
    await Watchlist.addItem(req.user._id, titleId, status);

    // Return populated watchlist
    const watchlist = await Watchlist.findByUserId(req.user._id, { populate: true });

    res.status(201).json({
      success: true,
      message: existing ? 'Watchlist item updated' : 'Added to watchlist',
      data: watchlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update watchlist item
// @route   PUT /api/watchlist/:titleId
// @access  Private
const updateWatchlistItem = async (req, res, next) => {
  try {
    const { titleId } = req.params;
    const { status, progress } = req.body;

    const existing = await Watchlist.checkItem(req.user._id, titleId);
    if (!existing) {
      throw new AppError('Item not in watchlist', 404);
    }

    await Watchlist.updateItem(req.user._id, titleId, { status, progress });

    const watchlist = await Watchlist.findByUserId(req.user._id, { populate: true });

    res.json({
      success: true,
      data: watchlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from watchlist
// @route   DELETE /api/watchlist/:titleId
// @access  Private
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { titleId } = req.params;

    const removed = await Watchlist.removeItem(req.user._id, titleId);

    if (!removed) {
      throw new AppError('Item not in watchlist', 404);
    }

    res.json({
      success: true,
      message: 'Removed from watchlist'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if title is in watchlist
// @route   GET /api/watchlist/check/:titleId
// @access  Private
const checkInWatchlist = async (req, res, next) => {
  try {
    const { titleId } = req.params;

    const item = await Watchlist.checkItem(req.user._id, titleId);

    res.json({
      success: true,
      data: {
        inWatchlist: !!item,
        item: item || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get watchlist stats
// @route   GET /api/watchlist/stats
// @access  Private
const getWatchlistStats = async (req, res, next) => {
  try {
    const stats = await Watchlist.getStats(req.user._id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  checkInWatchlist,
  getWatchlistStats
};
