const AuthService = require('../services/authService');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');

const authController = {
    //Controlador para el registro de usuarios
    async register(req, res, next) {
        try {
            //1. Validacion de estructura (zod)
            const validation = validateRegister(req.body);
            
            if (!validation.success) {
                // Formateamos los errores de zod
                const errorMenssage = validation.error.issues.map(e => e.message).join('.');
                throw new AppError(errorMenssage, httpStatus.BAD_REQUEST);
            }
            // 2. Llamada al servicio
            const user = await AuthService.registerUser(validation.data);
            // 3. Enviar respuesta
            res.status(httpStatus.CREATED).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            next(error); // Pasa el error al global Error Handler
        }
    },

    //Controlador para el login de usuarios
    async login(req, res, next) {
        try {
            //1. Validacion de entrada
            const validation = validateLogin(req.body);

            if (!validation.success) {
                const errorMenssage = validation.error.issues.map(e => e.message).join(', ');
                throw new AppError(errorMenssage, httpStatus.BAD_REQUEST);
            }

            // 2. lógica de servicio
            const { user, token } = await AuthService.loginUser(validation.data);
            
            // 3. Enviar respuesta
            res.status(httpStatus.OK).json({
                status: 'success',
                token, //El frontend guardará esto
                data: user
            });

        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;

//El controlador recibe la peticion HTTP, valida el formato con Zoz, llama al servicio y devuelve una respuesta. no contiene lógica.
