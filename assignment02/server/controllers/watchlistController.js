const Watchlist = require('../models/Watchlist');
const Title = require('../models/Title');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    let watchlist = await Watchlist.findOne({ userId: req.user._id })
      .populate({
        path: 'items.titleId',
        select: 'name type poster year genres rating episodes status'
      })
      .lean();

    // Create watchlist if doesn't exist
    if (!watchlist) {
      watchlist = await Watchlist.create({
        userId: req.user._id,
        items: []
      });
      watchlist = watchlist.toObject();
    }

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

    // Find or create watchlist
    let watchlist = await Watchlist.findOne({ userId: req.user._id });

    if (!watchlist) {
      watchlist = new Watchlist({
        userId: req.user._id,
        items: []
      });
    }

    // Check if already in watchlist
    const existingItem = watchlist.items.find(
      item => item.titleId.toString() === titleId
    );

    if (existingItem) {
      // Update status if already exists
      existingItem.status = status;
      existingItem.addedAt = new Date();
    } else {
      // Add new item
      watchlist.items.push({ titleId, status });
    }

    await watchlist.save();

    // Populate and return
    await watchlist.populate({
      path: 'items.titleId',
      select: 'name type poster year genres rating'
    });

    res.status(201).json({
      success: true,
      message: existingItem ? 'Watchlist item updated' : 'Added to watchlist',
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

    const watchlist = await Watchlist.findOne({ userId: req.user._id });

    if (!watchlist) {
      throw new AppError('Watchlist not found', 404);
    }

    const item = watchlist.items.find(
      item => item.titleId.toString() === titleId
    );

    if (!item) {
      throw new AppError('Item not in watchlist', 404);
    }

    if (status) item.status = status;
    if (progress !== undefined) item.progress = progress;

    await watchlist.save();

    await watchlist.populate({
      path: 'items.titleId',
      select: 'name type poster year genres rating'
    });

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

    const watchlist = await Watchlist.findOne({ userId: req.user._id });

    if (!watchlist) {
      throw new AppError('Watchlist not found', 404);
    }

    const itemIndex = watchlist.items.findIndex(
      item => item.titleId.toString() === titleId
    );

    if (itemIndex === -1) {
      throw new AppError('Item not in watchlist', 404);
    }

    watchlist.items.splice(itemIndex, 1);
    await watchlist.save();

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

    const watchlist = await Watchlist.findOne({ userId: req.user._id });

    if (!watchlist) {
      return res.json({
        success: true,
        data: { inWatchlist: false, item: null }
      });
    }

    const item = watchlist.items.find(
      item => item.titleId.toString() === titleId
    );

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
    const watchlist = await Watchlist.findOne({ userId: req.user._id });

    if (!watchlist || watchlist.items.length === 0) {
      return res.json({
        success: true,
        data: {
          total: 0,
          byStatus: {}
        }
      });
    }

    // Count by status
    const byStatus = watchlist.items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: watchlist.items.length,
        byStatus
      }
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
