const { fail } = require('../utils/responses');

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json(fail('Internal Server Error', err.message));
};

module.exports = errorHandler;
