const express = require('express');
const router = express.Router();
const IngresoController = require('../controllers/ingresoVehiculoController');
const upload = require('../middlewares/uploadMiddleware');

// El nombre 'foto' debe coincidir con el name="" del formData en el Frontend
router.post('/', upload.single('foto'), IngresoController.registrar);

module.exports = router;