const express = require('express');
const router = express.Router();
const mensualidadesController = require('../controllers/mensualidadesController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rolesMiddleware');

router.use(protect);

router.get('/mensualidades/verificar/:placa', restrictTo('Leer'), mensualidadesController.verificarMensualidad);
router.get('/mensualidades', restrictTo('Leer'), mensualidadesController.obtenerMensualidades);
router.post('/mensualidades', restrictTo('Crear'), mensualidadesController.crearMensualidad);
router.put('/mensualidades/:id', restrictTo('Actualizar'), mensualidadesController.actualizarMensualidad);
router.delete('/mensualidades/:id', restrictTo('Eliminar'), mensualidadesController.eliminarMensualidad);

module.exports = router;
