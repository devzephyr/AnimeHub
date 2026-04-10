// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found handler
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    const detail = err.detail || '';
    const match = detail.match(/\((\w+)\)/);
    const field = match ? match[1] : 'field';
    const message = `${field} already exists`;
    error = new AppError(message, 400);
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    const message = 'Referenced resource not found';
    error = new AppError(message, 400);
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    const message = 'Validation failed';
    error = new AppError(message, 400);
  }

  // PostgreSQL invalid text representation (e.g., invalid UUID)
  if (err.code === '22P02') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  // Send response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { AppError, notFound, errorHandler };
