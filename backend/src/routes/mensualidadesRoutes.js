const express = require('express');
const router = express.Router();
const mensualidadesController = require('../controllers/mensualidadesController');

router.get('/mensualidades/verificar/:placa', mensualidadesController.verificarMensualidad);
router.get('/mensualidades', mensualidadesController.obtenerMensualidades);
router.post('/mensualidades', mensualidadesController.crearMensualidad);
router.put('/mensualidades/:id', mensualidadesController.actualizarMensualidad);
router.delete('/mensualidades/:id', mensualidadesController.eliminarMensualidad);

module.exports = router;
