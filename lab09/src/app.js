require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const membersRouter = require('./routes/members.routes');
const requestLogger = require('./middlewares/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

if (!isProduction) {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/members', membersRouter);
app.get('/api/v1/health', (req, res) => {
  res.json({
    data: { status: 'ok' },
    error: null,
    meta: { service: 'fellowship-registry', environment: NODE_ENV },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

