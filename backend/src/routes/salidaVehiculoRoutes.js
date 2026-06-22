const express = require('express');
const router = express.Router();
const salidaVehiculoController = require('../controllers/salidaVehiculoController');

// Ruta para obtener los vehículos activos en el parqueadero (GET /api/salidas/activos)
router.get('/activos', salidaVehiculoController.obtenerActivos);

// Ruta para procesar el pago y dar salida al vehículo (POST /api/salidas/procesar)
router.post('/procesar', salidaVehiculoController.procesarSalida);

module.exports = router;