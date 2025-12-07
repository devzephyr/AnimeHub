const { body, param, query, validationResult } = require('express-validator');

// Handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    validate
  ],
  login: [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    validate
  ]
};

// Title validation rules
const titleValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Title name is required')
      .isLength({ max: 200 })
      .withMessage('Title name cannot exceed 200 characters'),
    body('type')
      .isIn(['anime', 'movie', 'series', 'ova', 'special'])
      .withMessage('Invalid type'),
    body('genres')
      .optional()
      .isArray()
      .withMessage('Genres must be an array'),
    body('year')
      .optional()
      .isInt({ min: 1900, max: 2100 })
      .withMessage('Year must be between 1900 and 2100'),
    body('synopsis')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Synopsis cannot exceed 5000 characters'),
    validate
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title name cannot exceed 200 characters'),
    body('type')
      .optional()
      .isIn(['anime', 'movie', 'series', 'ova', 'special'])
      .withMessage('Invalid type'),
    body('genres')
      .optional()
      .isArray()
      .withMessage('Genres must be an array'),
    body('year')
      .optional()
      .isInt({ min: 1900, max: 2100 })
      .withMessage('Year must be between 1900 and 2100'),
    validate
  ]
};

// Review validation rules
const reviewValidation = {
  create: [
    body('titleId')
      .notEmpty()
      .withMessage('Title ID is required')
      .isMongoId()
      .withMessage('Invalid title ID'),
    body('rating')
      .isInt({ min: 1, max: 10 })
      .withMessage('Rating must be between 1 and 10'),
    body('text')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Review text cannot exceed 5000 characters'),
    validate
  ],
  update: [
    body('rating')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Rating must be between 1 and 10'),
    body('text')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Review text cannot exceed 5000 characters'),
    validate
  ]
};

// Watchlist validation rules
const watchlistValidation = {
  addItem: [
    body('titleId')
      .notEmpty()
      .withMessage('Title ID is required')
      .isMongoId()
      .withMessage('Invalid title ID'),
    body('status')
      .optional()
      .isIn(['plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped'])
      .withMessage('Invalid status'),
    validate
  ],
  updateItem: [
    body('status')
      .optional()
      .isIn(['plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped'])
      .withMessage('Invalid status'),
    body('progress')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Progress must be a non-negative number'),
    validate
  ]
};

// Common param validation
const paramValidation = {
  mongoId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid ID format'),
    validate
  ]
};

// Pagination query validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
];

module.exports = {
  validate,
  userValidation,
  titleValidation,
  reviewValidation,
  watchlistValidation,
  paramValidation,
  paginationValidation
};
