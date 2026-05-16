const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.route('/')
    .get(restrictTo('Leer'), roleController.getAllRoles)
    .post(restrictTo('Crear'), roleController.createRole);

router.route('/:id')
    .get(restrictTo('Leer'), roleController.getRoleById)
    .put(restrictTo('Actualizar'), roleController.updateRole)
    .delete(restrictTo('Eliminar'), roleController.deleteRole);

router.put('/:id/permisos', restrictTo('Actualizar'), roleController.assignPermissions);

module.exports = router;