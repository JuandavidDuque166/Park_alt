const express = require('express');
const DashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/resumen', DashboardController.getResumen);

module.exports = router;
