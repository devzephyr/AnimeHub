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
  };

  if (err.meta && typeof err.meta === 'object') {
    Object.assign(meta, err.meta);
  }

  let details = null;

  if (err.details) {
    details = err.details;
  } else if (!isProduction) {
    details = { stack: err.stack };
  }

  const clientMessage = status >= 500 ? 'Internal server error' : err.message || 'Request failed';
  const response = fail(clientMessage, details, meta);

  // Always log the full error internally
  console.error(`[reqId=${req.requestId || 'n/a'}]`, err);

  return res.status(status).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
