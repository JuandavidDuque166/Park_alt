const rateLimit = require('express-rate-limit');

const createLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        status: 'fail',
        message
      });
    }
  });
};

const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.'
});

const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de registro. Intenta de nuevo en una hora.'
});

const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Demasiadas solicitudes a la API. Intenta de nuevo en 15 minutos.'
});

module.exports = { loginLimiter, registerLimiter, apiLimiter };
