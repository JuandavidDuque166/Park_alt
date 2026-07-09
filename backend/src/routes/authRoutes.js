const express = require('express');
const AuthController = require('../controllers/authController');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimitMiddleware');
const { loginSecurity, loginSecurityFailure, loginSecuritySuccess } = require('../middlewares/loginSecurityMiddleware');

const router = express.Router();

router.post('/register', registerLimiter, AuthController.register);
router.post('/login', loginLimiter, loginSecurity, AuthController.login);

module.exports = router;
