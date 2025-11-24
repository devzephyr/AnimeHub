require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const moriaRoutes = require('./routes/moria.routes');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const { fail } = require('./utils/responses');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/v1/moria', moriaRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json(fail('Not Found'));
});

// Error Handler
app.use(errorHandler);

module.exports = app;
