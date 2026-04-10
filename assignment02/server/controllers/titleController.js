const Title = require('../models/Title');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get all titles with pagination, filtering, sorting
// @route   GET /api/titles
// @access  Public
const getTitles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      type,
      genre,
      year,
      status,
      search,
      minRating
    } = req.query;

    // Build query
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (year) query.year = parseInt(year);
    if (genre) query.genre = genre;
    if (minRating) query.minRating = minRating;
    if (search) query.search = search;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [titles, total] = await Promise.all([
      Title.find(query, { sort, skip, limit: parseInt(limit) }),
      Title.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: titles,
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

// @desc    Get single title by ID
// @route   GET /api/titles/:id
// @access  Public
const getTitle = async (req, res, next) => {
  try {
    const title = await Title.findById(req.params.id);

    if (!title) {
      throw new AppError('Title not found', 404);
    }

    res.json({
      success: true,
      data: title
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new title
// @route   POST /api/titles
// @access  Private
const createTitle = async (req, res, next) => {
  try {
    const titleData = {
      ...req.body,
      createdBy: req.user._id
    };

    const title = await Title.create(titleData);

    res.status(201).json({
      success: true,
      data: title
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update title
// @route   PUT /api/titles/:id
// @access  Private
const updateTitle = async (req, res, next) => {
  try {
    let title = await Title.findById(req.params.id);

    if (!title) {
      throw new AppError('Title not found', 404);
    }

    // Check ownership or admin
    if (
      title.createdBy &&
      title.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      throw new AppError('Not authorized to update this title', 403);
    }

    title = await Title.findByIdAndUpdate(req.params.id, req.body);

    res.json({
      success: true,
      data: title
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete title
// @route   DELETE /api/titles/:id
// @access  Private (Admin or owner)
const deleteTitle = async (req, res, next) => {
  try {
    const title = await Title.findById(req.params.id);

    if (!title) {
      throw new AppError('Title not found', 404);
    }

    // Check ownership or admin
    if (
      title.createdBy &&
      title.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      throw new AppError('Not authorized to delete this title', 403);
    }

    await Title.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Title deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available genres
// @route   GET /api/titles/genres
// @access  Public
const getGenres = async (req, res, next) => {
  try {
    const genres = await Title.distinct('genres');

    res.json({
      success: true,
      data: genres
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top rated titles
// @route   GET /api/titles/top-rated
// @access  Public
const getTopRated = async (req, res, next) => {
  try {
    const { limit = 10, type } = req.query;
    const query = { minRating: 0 };

    if (type) query.type = type;

    const titles = await Title.find(query, {
      sort: '-rating.average',
      limit: parseInt(limit),
      skip: 0
    });

    // Filter to only titles with at least 1 rating
    const rated = titles.filter(t => t.rating.count >= 1);

    res.json({
      success: true,
      data: rated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTitles,
  getTitle,
  createTitle,
  updateTitle,
  deleteTitle,
  getGenres,
  getTopRated
};
