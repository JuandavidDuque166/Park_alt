const express = require('express');
const AuthController = require('../controllers/authController');
// const { protect } = require('../middleware/authMiddleware'); //Proteger la ruta
// const { restricTo } = require('../middleware/roleMiddleware'); //Restrinccion según su roles

const router = express.Router();

//Importaciones de las rutas de autenticación
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// // --- Ruta protegida (prueba) ---
// router.get('/perfil', protect, (req, res) => {
 //     res.status(200).json({
 //         status: 'success',
 //         message: 'Si ves esto, es porque tienes un token válido.',
 //         user: req.user // Aquí verás los datos que el middleware inyectó
 //     });
 // });
 
 // // --- Ruta según el rol para quien pueda 'Eliminar' (prueba) ---
 // router.delete('/borrar-sistema', protect, restrictTo('Eliminar'), (req, res) => {
 // //     res.status(200).json({
 // //         status: 'success',
 // //         message: 'ACCESO VIP: Tienes permiso para Eliminar. El sistema ha sido borrado (mentira, es una prueba).'
 // //     });
 // // });
 // 
    module.exports = router;
 // // Se definen los endpoints
