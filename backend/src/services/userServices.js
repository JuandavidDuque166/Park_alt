const bcrypt = require('bcrypt');
const AppError = require ('../errors/appError');
const httpStatus = require ('../constants/httpStatus');
const UserModel = require('../models/userModel');

const UserService = {
    async getAllUsers() {
        //El servicio delega la busqueda al modelo
        const users = await UserModel.findAll();
        return users;
    },

    async createUser(userData) {
    // 1. Validar si el email ya existe (Regla de Negocio)
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
        throw new AppError('El email ya está registrado', httpStatus.BAD_REQUEST);
    }

    // 2. Encriptar la contraseña (SEGURIDAD OBLIGATORIA)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.clave, salt);

    // 3. Preparar objeto para el modelo
    const newUser = {
        ...userData,
        clave: hashedPassword
    };

    // 4. Llamar al modelo
    const userId = await UserModel.create(newUser);
    return { id: userId, ...newUser };
},

async updateUser(id, updateData) {
    // 1. Verificar si el usuario existe
    const userExists = await UserModel.findById(id);
    if (!userExists) {
        throw new AppError('Usuario no encontrado', httpStatus.NOT_FOUND);
    }

    // 2. Validar email único si se está cambiando
    if (updateData.email && updateData.email !== userExists.email) {
        const emailInUse = await UserModel.findByEmail(updateData.email);
        if (emailInUse) {
            throw new AppError('El email ya está registrado', httpStatus.BAD_REQUEST);
        }
    }

    // 3. Manejo de contraseña en actualización
    let hashedKey = userExists.clave; // Por defecto usamos la que ya tiene

    if (updateData.clave && updateData.clave.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        hashedKey = await bcrypt.hash(updateData.clave, salt);
    }

    // 4. Construir objeto con valores actualizados o existentes
    const userToUpdate = {
        id: id,
        nombre: updateData.nombre !== undefined ? updateData.nombre : userExists.nombre,
        email: updateData.email !== undefined ? updateData.email : userExists.email,
        id_rol: updateData.id_rol !== undefined ? updateData.id_rol : userExists.id_rol,
        clave: hashedKey
    };

const affectedRows = await UserModel.update(userToUpdate);
    return affectedRows > 0;
},

// Añadir currentUserId
async deleteUser(idToDelete, currentUserId) {
    // Prevención de auto sabotaje (admin no puede borrarse a sí mismo)
    if (Number(idToDelete) === Number(currentUserId)) {
        throw new AppError(
            'No puedes eliminar tu propia cuenta de administrador.',
            httpStatus.FORBIDDEN
        );
    }

    // Verificación previa
    // Primero verificamos si existe antes de intentar borrar
    const userExists = await UserModel.findById(idToDelete);

    if (!userExists) {
        // Lanzar el error aquí mismo.
        // Así el controlador solo tiene que llamar a la función y listo.
        throw new AppError('Usuario no encontrado', httpStatus.NOT_FOUND);
    }

    // 3. EJECUTAR BORRADO
    const affectedRows = await UserModel.deleteById(idToDelete);

    // Retornar true en caso de éxito en el borrado
    return affectedRows > 0;
}
};

module.exports = UserService;
