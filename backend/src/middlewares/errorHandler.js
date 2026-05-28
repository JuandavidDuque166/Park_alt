module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    console.error('Global Error Handler:', {
        statusCode: err.statusCode,
        status: err.status,
        message: err.message,
        stack: err.stack
    });

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};