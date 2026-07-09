const { isBlocked, registerFailure, resetAttempts } = require('../utils/loginAttempts');

const loginSecurity = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  if (isBlocked(ip)) {
    return res.status(429).json({ status: 'fail', message: 'Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.' });
  }
  req.loginSecurity = { ip };
  next();
};

const loginSecurityFailure = (req, res, next) => {
  const ip = req.loginSecurity?.ip || req.ip || 'unknown';
  registerFailure(ip);
  next();
};

const loginSecuritySuccess = (req, res, next) => {
  const ip = req.loginSecurity?.ip || req.ip || 'unknown';
  resetAttempts(ip);
  next();
};

module.exports = { loginSecurity, loginSecurityFailure, loginSecuritySuccess };
