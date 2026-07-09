const express = require('express');
const router = express.Router();
const salidaVehiculoController = require('../controllers/salidaVehiculoController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rolesMiddleware');

router.use(protect);

// Ruta para obtener los vehículos activos en el parqueadero (GET /api/salidas/activos)
router.get('/activos', restrictTo('Leer'), salidaVehiculoController.obtenerActivos);

// Ruta para procesar el pago y dar salida al vehículo (POST /api/salidas/procesar)
router.post('/procesar', restrictTo('Actualizar'), salidaVehiculoController.procesarSalida);

module.exports = router;