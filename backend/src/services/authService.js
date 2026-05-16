const bcrypt = require('bcrypt');
const UserService = require('./userServices'); // se importa para posibles validaciones adicionales
const UserModel = require('../models/userModel');
const AppError = require('../errors/AppError');
const errorDictionary = require('../errors/errorDictionary');
const httpStatus = require('../constants/httpStatus');
const { signToken } = require('../utils/jwtToken');


const AuthService = {
    async registerUser(userData) {
        // Delegamos toda la lógica de creación al UserService.
        // Él se encarga de validar duplicados y hashear la contraseña.
        const newUser = await UserService.createUser(userData);

        // Retornamos los datos limpios
        return {
            id: newUser.id,
            nombre: newUser.nombre,
            email: newUser.email
        };
    },

    async loginUser(credentials) {
        const { login, clave } = credentials;

        // 1. Buscar usuario por email (Usamos el modelo que ya creamos)
        const user = await UserModel.findByEmail(login);

        // 2. Verificar si existe
        if (!user) {
            // Retornamos null o lanzamos error genérico
            throw new AppError('Credenciales inválidas', httpStatus.UNAUTHORIZED);
        }

        // 3. Comparar contraseñas (Texto plano vs Hash en DB)
        const isHashedPassword = user.clave.startsWith('$2a$') || user.clave.startsWith('$2b$') || user.clave.startsWith('$2y$');
        const isMatch = isHashedPassword
            ? await bcrypt.compare(clave, user.clave)
            : clave === user.clave;

        if (!isMatch) {
            throw new AppError('Credenciales inválidas', httpStatus.UNAUTHORIZED);
        }

        // 4. Generar Token JWT
        const token = signToken(user.id_usuario, user.id_rol);

        // 5. Retornar datos (SIN LA CLAVE)
        // Eliminamos la clave del objeto antes de enviarlo
        delete user.clave;

        return { user, token };
    }
};

module.exports = AuthService;

// Lógica de Negocio (Services)
// Aquí el servicio orquesta: valida reglas de negocio (email único), seguridad (hash de clave) y llama al modelo.
