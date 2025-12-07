const { protect, optionalAuth, adminOnly } = require('./auth');
const { AppError, notFound, errorHandler } = require('./errorHandler');
const {
  validate,
  userValidation,
  titleValidation,
  reviewValidation,
  watchlistValidation,
  paramValidation,
  paginationValidation
} = require('./validation');

module.exports = {
  protect,
  optionalAuth,
  adminOnly,
  AppError,
  notFound,
  errorHandler,
  validate,
  userValidation,
  titleValidation,
  reviewValidation,
  watchlistValidation,
  paramValidation,
  paginationValidation
};
