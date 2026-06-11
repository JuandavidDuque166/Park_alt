const UserService = require('../services/userServices');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');
const {validateCreateUser, validateUpdateUser} = require ('../validators/userValidator'); // <--- IMPORTACION NUEVA

const UserController = {
    async getAll(req, res, next) {
        try {
            const users = await UserService.getAllUsers();
            res.status(httpStatus.OK).json({
                status: 'success',
                results: users.length,
                data: users
            });
        } catch (error) {
            next(error);
        }
    },

    async create(req, res, next) {
        try {
            // Validación con Zod
            const validation = validateCreateUser(req.body);

            if (!validation.success) {
                // Formateamos los errores para que sean legibles
                const errorMessage = validation.error.issues.map(e => e.message).join(', ');
                throw new AppError(errorMessage, httpStatus.BAD_REQUEST);
            }

            // Si pasa, se llama al servicio con los datos ya validados (validation.data)
            // Nota: Usar validation.data es más seguro que req.body porque Zod limpia campos extraños
            const newUser = await UserService.createUser(validation.data);

            res.status(httpStatus.CREATED).json({
                status: 'success',
                data: newUser
            });
        } catch (error) {
            next(error);
        }
    },

    async update(req, res, next) {
        try {
            const { id } = req.params;

            // Validación con Zod
            const validation = validateUpdateUser(req.body);

            if (!validation.success) {
                const errorMessage = validation.error.issues.map(e => e.message).join(', ');
                throw new AppError(errorMessage, httpStatus.BAD_REQUEST);
            }

            // Verificar que al menos envíen un dato para actualizar
            if (Object.keys(validation.data).length === 0) {
                throw new AppError('No se enviaron datos para actualizar', httpStatus.BAD_REQUEST);
            }

            // Llamada al servicio
            const updated = await UserService.updateUser(id, validation.data);

            if (!updated) {
                // Puede que el usuario no exista, pero el servicio ya maneja eso lanzando error si no encuentra ID.
                // Si devuelve false, es porque no hubo cambios o error silencioso.
            }

            res.status(httpStatus.OK).json({
                status: 'success',
                message: 'Usuario actualizado correctamente'
            }); 
        } catch (error) {
            next(error);
        }
    },

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const currentUserId = req.user.id_usuario; 

            //Llamamos al servicio.
            //Si el usuario no existe, el servicio lanzara el erro 404.
            //Si intenta borrarse a si mismo, lanzará el error 403.
            //Si todo sale bien, la ejecución continua.
            await UserService.deleteUser(id, currentUserId);

            res.status(httpStatus.OK).json({
                status: 'success',
                message: 'Usuario inhabilitado correctamente'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = UserController;