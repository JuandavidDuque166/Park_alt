const express = require('express');
const router = express.Router();
const controlParqueaderoController = require('../controllers/controlParqueaderoController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rolesMiddleware');

router.use(protect);
router.get('/datos', restrictTo('Leer'), controlParqueaderoController.obtenerDatosControl);

module.exports = router;