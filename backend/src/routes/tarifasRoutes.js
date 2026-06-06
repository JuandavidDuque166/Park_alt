const express = require('express');
const router = express.Router();
const controller = require('../controllers/tarifasController.js');

// Ajustamos los nombres para que coincidan con lo que realmente existe en tu controller
router.get('/tipos', controller.obtenerTiposVehiculo);
router.get('/', controller.obtenerTodas); 
router.post('/', controller.crearTarifa);
router.put('/:id', controller.actualizarTarifa);

module.exports = router;
