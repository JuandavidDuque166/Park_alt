const express = require('express');
const router = express.Router();
const controller = require('../controllers/tarifasController.js');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rolesMiddleware');

router.use(protect);

router.get('/tipos', restrictTo('Leer'), controller.obtenerTiposVehiculo);
router.get('/', restrictTo('Leer'), controller.obtenerTodas);
router.post('/', restrictTo('Crear'), controller.crearTarifa);
router.put('/:id', restrictTo('Actualizar'), controller.actualizarTarifa);

module.exports = router;
