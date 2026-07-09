const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rolesMiddleware');

const router = express.Router();

router.use(protect);
router.get('/resumen', restrictTo('Leer'), DashboardController.getResumen);

module.exports = router;
