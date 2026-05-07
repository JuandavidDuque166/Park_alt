const db = require('../config/conexion_db');

const PermisoModel = {
    async findAll() {
        const query = `
            SELECT id_permiso, nombre, descripcion
            FROM permisos
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    async findById(id) {
        const query = `
            SELECT id_permiso, nombre, descripcion
            FROM permisos
            WHERE id_permiso = ?
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    },

    async create(permiso) {
        const { nombre, descripcion } = permiso;
        const query = `
            INSERT INTO permisos (nombre, descripcion)
            VALUES (?, ?)
        `;
        const [result] = await db.execute(query, [nombre, descripcion]);
        return result.insertId;
    },

    async update(id, permiso) {
        const { nombre, descripcion } = permiso;
        const query = `
            UPDATE permisos
            SET nombre = ?, descripcion = ?
            WHERE id_permiso = ?
        `;
        const [result] = await db.execute(query, [nombre, descripcion, id]);
        return result.affectedRows;
    },

    async delete(id) {
        const query = 'DELETE FROM permisos WHERE id_permiso = ?';
        const [result] = await db.execute(query, [id]);
        return result.affectedRows;
    }
};

module.exports = PermisoModel;