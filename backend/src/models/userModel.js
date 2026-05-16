const db = require('../config/conexion_db');

const roleLabel = `
    CASE
        WHEN rol = 'ADMINISTRADOR' THEN 'Administrador'
        WHEN rol = 'VIGILANTE' THEN 'Vigilante'
        ELSE rol
    END
`;

const UserModel = {
    async findByEmail(login) {
        const query = `
            SELECT
                id_usuario,
                nombre,
                contrasena AS clave,
                rol,
                rol AS id_rol,
                ${roleLabel} AS rol_nombre
            FROM usuario
            WHERE nombre = ? AND estado = 1
        `;
        const [rows] = await db.execute(query, [login]);
        return rows[0];
    },

    async create(user) {
        const { nombre, clave, id_rol } = user;
        const query = `
            INSERT INTO usuario (nombre, contrasena, rol)
            VALUES (?, ?, ?)
        `;
        const [result] = await db.execute(query, [nombre, clave, id_rol]);
        return result.insertId;
    },

    async update(user) {
        const { id, nombre, clave, id_rol } = user;
        const query = `
            UPDATE usuario
            SET nombre = ?, contrasena = ?, rol = ?
            WHERE id_usuario = ?
        `;

        const [result] = await db.execute(query, [nombre, clave, id_rol, id]);
        return result.affectedRows;
    },

    async findById(id) {
        const query = `
            SELECT
                id_usuario,
                nombre,
                contrasena AS clave,
                rol,
                rol AS id_rol,
                ${roleLabel} AS rol_nombre
            FROM usuario
            WHERE id_usuario = ? AND estado = 1
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    },

    async findAll() {
        const query = `
            SELECT
                id_usuario,
                nombre,
                rol,
                rol AS id_rol,
                ${roleLabel} AS rol_nombre,
                estado
            FROM usuario
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    async deleteById(id) {
        const query = 'DELETE FROM usuario WHERE id_usuario = ?';
        const [result] = await db.execute(query, [id]);
        return result.affectedRows;
    }
};

module.exports = UserModel;
