const { fail } = require('../utils/responses');

const notFoundHandler = (req, res) => {
  const meta = { path: req.originalUrl, method: req.method };
  return res.status(404).json(fail('Resource not found', null, meta));
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || err.status || 500;
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const meta = {
    requestId: req.requestId,
    ...(err.meta || {}),
  };

  let details = null;
  if (err.details) {
    details = err.details;
  } else if (!isProduction && err.stack) {
    details = { stack: err.stack };
  }

  const message = status >= 500 ? 'Internal server error' : err.message || 'Request failed';
  console.error(`[reqId=${req.requestId || 'n/a'}]`, err);
  return res.status(status).json(fail(message, details, meta));
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

