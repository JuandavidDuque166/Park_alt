const { logError } = require('../utils/logger');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    const responsePayload = {
        status: err.status,
        message: err.isOperational ? err.message : 'Se produjo un error en el servidor.'
    };

    if (process.env.NODE_ENV === 'development') {
        responsePayload.stack = err.stack;
    }

    logError({
        method: req.method,
        url: req.originalUrl,
        statusCode: err.statusCode,
        message: err.message,
        stack: err.stack
    });

    res.status(err.statusCode).json(responsePayload);
};