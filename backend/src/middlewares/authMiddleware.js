const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const UserModel = require('../models/userModel');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');
const errorDictionary = require('../errors/errorDictionary');

const protect = async (req, res, next) => {
    try {
        // 1. Obtener el token del header
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new AppError(
                'No has iniciado sesión. Por favor ingresa para obtener acceso.',
                httpStatus.UNAUTHORIZED
            );
        }

        // 2. Verificar el token (Verify)
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3. Verificar si el usuario todavía existe
        const currentUser = await UserModel.findById(decoded.id);

        if (!currentUser) {
            throw new AppError(
                'El usuario dueño de este token ya no existe.',
                httpStatus.UNAUTHORIZED
            );
        }

        // 4. Verificar si el usuario cambió la contraseña después de emitir el token
        // Esto se hace comparando 'iat' (issued at) con un campo 'passwordChangedAt' en DB.

        // ¡ACCESO CONCEDIDO! Ponemos el usuario en la request para que el controlador lo use
        req.user = currentUser;
        next();

    } catch (error) {
        // Capturar errores específicos de JWT
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Token inválido. Inicia sesión de nuevo.', httpStatus.UNAUTHORIZED));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Tu sesión ha expirado. Inicia sesión de nuevo.', httpStatus.UNAUTHORIZED));
        }
        next(error);
    }
};

// Middleware para restringir acceso por roles
//Uso: restrictTo('administrador', 'Empleado')
const restrictTo = (...roles) => {
    return (req, res, next) => {
        //req.user viene del middleware 'protect'
        if (!req.user) {
            return next(new AppError(
                'No tienes permiso para realizar esta acción.',
                httpStatus.FORBIDDEN
            ));
        }

        //Verificar si el rol del usuario está en la lista de roles permitidos
        if (!roles.includes(req.user.rol_nombre)) {
            return next(new AppError(
                'No tienes permiso para realizar esta acción.',
                httpStatus.FORBIDDEN
            ));
        }

        next();
    };
};

module.exports = {protect, restrictTo};