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

        // 1. Buscar usuario por email
        const user = await UserModel.findByEmail(login);
        console.log('AuthService.loginUser - login intent:', { login, userFound: !!user });

        // 2. Verificar si existe
        if (!user) {
            throw new AppError('Credenciales inválidas', httpStatus.UNAUTHORIZED);
        }

        const storedPassword = String(user.clave || '');
        const userRole = user.id_rol;
        const roleNombre = user.rol; // Viene del JOIN con la tabla roles

        // 3. Comparar contraseñas (Texto plano vs Hash en BD)
        const isHashedPassword = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');
        const isMatch = isHashedPassword
            ? await bcrypt.compare(clave, storedPassword)
            : clave === storedPassword;

        if (!isMatch) {
            console.log('AuthService.loginUser - password mismatch for user:', { login, userId: user.id_usuario });
            throw new AppError('Credenciales inválidas', httpStatus.UNAUTHORIZED);
        }

        // 4. Generar Token JWT
        const token = signToken(user.id_usuario, userRole);

        // 5. Retornar datos limpios
        const safeUser = {
            id_usuario: user.id_usuario,
            nombre: user.nombre,
            email: user.email,
            id_rol: userRole,
            rol_nombre: roleNombre,
            estado: user.estado
        };

        return { user: safeUser, token };
    }
};

module.exports = AuthService;

// Lógica de Negocio (Services)
// Aquí el servicio orquesta: valida reglas de negocio (email único), seguridad (hash de clave) y llama al modelo.
