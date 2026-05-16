const express = require('express');
const router = express.Router();
const permisoController = require('../controllers/permisoController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.route('/')
    .get(restrictTo('Leer'), permisoController.getAllPermisos)
    .post(restrictTo('Crear'), permisoController.createPermiso);

router.route('/:id')
    .get(restrictTo('Leer'), permisoController.getPermisoById)
    .put(restrictTo('Actualizar'), permisoController.updatePermiso)
    .delete(restrictTo('Eliminar'), permisoController.deletePermiso);

module.exports = router;