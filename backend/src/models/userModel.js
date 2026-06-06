const db = require('../config/conexion_db');

const roleLabel = `
    CASE
        WHEN rol = 'ADMINISTRADOR' THEN 'Administrador'
        WHEN rol = 'OPERARIO' THEN 'Operario'
        ELSE rol
    END
`;

const roleId = `
    CASE
        WHEN rol = 'ADMINISTRADOR' THEN 1
        WHEN rol = 'OPERARIO' THEN 2
        ELSE NULL
    END
`;

const UserModel = {
    async findByEmail(login) {
        const query = `
            SELECT
                u.id_usuario,
                u.nombre,
                u.email,
                u.clave,
                u.id_rol,
                r.nombre as rol,
                u.estado,
                u.fecha_creacion
            FROM usuario u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.email = ? AND u.estado = 1
        `;
        const [rows] = await db.execute(query, [login]);
        return rows[0];
    },

    async create(user) {
        const { nombre, email, clave, id_rol } = user;
        const query = `
            INSERT INTO usuario (nombre, email, clave, id_rol)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [nombre, email, clave, id_rol]);
        return result.insertId;
    },

    async update(user) {
        const { id, nombre, email, clave, id_rol, estado } = user;
        const query = `
            UPDATE usuario
            SET nombre = ?, email = ?, clave = ?, id_rol = ?, estado = ?
            WHERE id_usuario = ?
        `;

        const [result] = await db.execute(query, [nombre, email, clave, id_rol, estado, id]);
        return result.affectedRows;
    },

    async findById(id, onlyActive = true) {
        const query = `
            SELECT
                id_usuario,
                nombre,
                email,
                clave,
                id_rol,
                estado,
                fecha_creacion
            FROM usuario
            WHERE id_usuario = ? ${onlyActive ? 'AND estado = 1' : ''}
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    },

    async findAll() {
        const query = `
            SELECT
                u.id_usuario,
                u.nombre,
                u.email,
                clave,
                u.id_rol,
                r.nombre as rol,
                u.estado,
                u.fecha_creacion
            FROM usuario u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
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
