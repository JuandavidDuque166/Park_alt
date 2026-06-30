const express = require('express');
const router = express.Router();
const { getReportes } = require('../controllers/reporteController');

// GET /api/reportes
router.get('/', getReportes);

module.exports = router;