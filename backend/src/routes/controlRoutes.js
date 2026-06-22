const express = require('express');
const router = express.Router();
const controlParqueaderoController = require('../controllers/controlParqueaderoController');

router.get('/datos', controlParqueaderoController.obtenerDatosControl);

module.exports = router;