const { randomUUID } = require('crypto');

const requestLogger = (req, res, next) => {
  const requestId = randomUUID();
  req.requestId = requestId;
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1e6;
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(
        2,
      )}ms (reqId=${requestId})`,
    );
  });

  next();
};

module.exports = requestLogger;

