const bcrypt = require('bcrypt');
const UserService = require('./userServices');
const UserModel = require('../models/userModel');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');
const { signToken } = require('../utils/jwtToken');

const AuthService = {
    async registerUser(userData) {
        const newUser = await UserService.createUser(userData);
        return {
            id: newUser.id,
            nombre: newUser.nombre,
            email: newUser.email
        };
    },

    async loginUser(credentials) {
        const { login, clave } = credentials;

        const user = await UserModel.findByEmail(login);

        if (!user) {
            throw new AppError('Credenciales inválidas', httpStatus.UNAUTHORIZED);
        }

        const storedPassword = String(user.clave || '');
        const userRole = user.id_rol;

        const isHashedPassword = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');
        const isMatch = isHashedPassword
            ? await bcrypt.compare(clave, storedPassword)
            : clave === storedPassword;

        if (!isMatch) {
            throw new AppError('Credenciales inválidas', httpStatus.UNAUTHORIZED);
        }

        const token = signToken(user.id_usuario, userRole);
        const refreshToken = signToken(user.id_usuario, userRole, '7d');

        // AQUÍ ESTÁ EL CAMBIO CLAVE: Agregamos rol_nombre
        const safeUser = {
            id_usuario: user.id_usuario,
            nombre: user.nombre,
            email: user.email,
            rol: userRole,
            rol_nombre: user.rol, // Este viene del JOIN en el modelo
            estado: user.estado
        };

        return { user: safeUser, token, refreshToken };
    }
};

module.exports = AuthService;