const express = require('express');
const router = express.Router();
const IngresoController = require('../controllers/ingresoVehiculoController');
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rolesMiddleware');

router.use(protect);

router.post('/', restrictTo('Crear'), upload.single('foto'), IngresoController.registrar);
router.get('/cupos', restrictTo('Leer'), IngresoController.obtenerCupos); // Endpoint para el Badge superior
// --- NUEVA RUTA PARA LA CÁMARA E IA ---
router.post('/leer-placa', restrictTo('Leer'), upload.single('imagen'), IngresoController.leerPlaca);

module.exports = router;