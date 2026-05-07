const RoleModel = require('../models/roleModel');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');

// Closure: Una función que devuelve otra función (el middleware real)
const restrictTo = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            // 1. Asegurarnos de que el usuario existe (protect ya debió ejecutarse)
            if (!req.user || !req.user.id_rol) {
                return next(new AppError('Error de sesión: Usuario no identificado.', httpStatus.INTERNAL_SERVER_ERROR));
            }

            // 2. Buscar los permisos del rol del usuario en la BD
            const userPermissions = await RoleModel.getPermissionsByRoleId(req.user.id_rol);

            console.log(`Usuario: ${req.user.email} | Rol: ${req.user.id_rol} | Permisos: ${userPermissions}`);

            // 3. Verificar si tiene el permiso requerido
            if (!userPermissions.includes(requiredPermission)) {
                return next(new AppError('No tienes permisos para realizar esta acción.', httpStatus.FORBIDDEN));
            }

            // 4. Acceso concedido
            next();

        } catch (error) {
            next(error);
        }
    };
};

module.exports = { restrictTo };

// Este middleware se ejecutará después de protect. Recibirá el permiso requerido (ej: 'Crear') y verificará si el usuario lo tiene