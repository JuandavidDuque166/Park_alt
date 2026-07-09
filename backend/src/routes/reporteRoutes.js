const express = require('express');
const router = express.Router();
const { getReportes } = require('../controllers/reporteController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rolesMiddleware');

router.use(protect);

// GET /api/reportes
router.get('/', restrictTo('Leer'), getReportes);

module.exports = router;