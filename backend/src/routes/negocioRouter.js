const express = require('express');
const router = express.Router();
const negocioController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// Todas las rutas estan protegidas 
router.use(protect);

//GET /apo/negocios - obtener todos (require permiso Leer)
router.get('/', restrictTo('Leer'), negocioController.getAllNegocios);

// GET /api/negocios/:id - obetener uno por ID (require permiso Leer
router.get('/:id', restrictTo('Leer'), negocioController.getNegocioById);

// POST /api/negocios - crear nuevo negocio (require permiso Crear)
router.post('/', restrictTo('Crear'), negocioController.createNegocio);

// PUT /api/negocios/:id - actualizar negocio (require permiso Actualizar)
router.put('/:id', restrictTo('Actualizar'), negocioController.updateNegocio);

module.exports = router;