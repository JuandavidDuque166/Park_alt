const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/rolesMiddleware');

// Proteger todas las rutas
router.use(protect);

// POST /api/upload/image - Subir imagen (requiere permiso Crear)
router.post('/image', restrictTo('Crear'), upload.single('image'), uploadController.uploadImage);

module.exports = router;
