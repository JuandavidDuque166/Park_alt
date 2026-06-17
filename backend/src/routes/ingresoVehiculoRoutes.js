const express = require('express');
const router = express.Router();
const IngresoController = require('../controllers/ingresoVehiculoController');
const upload = require('../middlewares/uploadMiddleware');

router.post('/', upload.single('foto'), IngresoController.registrar);
router.get('/cupos', IngresoController.obtenerCupos); // Endpoint para el Badge superior

module.exports = router;