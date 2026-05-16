// Ajusta la ruta si tu archivo se llama conexion_db.js dentro de config
const db = require('../config/conexion_db');

const UserModel = {
    async findByEmail(email) {
        const query = `
            SELECT u.id_usuario, u.nombre, u.email, u.clave, u.id_rol, r.nombre as rol_nombre
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.email = ?
        `;
        const [rows] = await db.execute(query, [email]);
        return rows[0];
    },

    async create(user) {
        const { nombre, email, clave, id_rol } = user;
        const query = `
            INSERT INTO usuarios (nombre, email, clave, id_rol)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [nombre, email, clave, id_rol]);
        return result.insertId;
    },

    async update(user) {
        const { id, nombre, email, clave, id_rol } = user;
        const query = `
            UPDATE usuarios
            SET nombre = ?, email = ?, clave = ?, id_rol = ?
            WHERE id_usuario = ?
        `;
        
        const [result] = await db.execute(query, [nombre, email, clave, id_rol, id]);
        return result.affectedRows;
    },

    async findById(id) {
        const query = `
            SELECT u.id_usuario, u.nombre, u.email, u.clave, u.id_rol, r.nombre as rol_nombre
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = ?
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    },

    // Método para obtener todos los usuarios con sus roles
    async findAll() {
        const query = `
            SELECT u.id_usuario, u.nombre, u.email, u.id_rol, r.nombre as rol
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    // Método para borrar un usuario por ID
    async deleteById(id) {
        const query = 'DELETE FROM usuarios WHERE id_usuario = ?';
        const [result] = await db.execute(query, [id]);
        return result.affectedRows; // Retorna número de filas borradas
    }
};

module.exports = UserModel;