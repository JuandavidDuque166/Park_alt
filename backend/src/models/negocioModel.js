const db = require('../config/conexion_db');

const NegocioModel = {
    async findById(id) {
        const query = `
            SELECT id_negocio, razon_social, logo_url, descripcion,
                   telefono, email, direccion, redes_sociales, fecha_actualizacion
            FROM negocio
            WHERE id_negocio = ?
        `;
        const [rows] = await db.execute(query, [id]);

        // Parse JSON field safely
        if (rows[0] && rows[0].redes_sociales) {
            try {
                // Solo parsear si es string, si ya es objeto dejarlo como está
                rows[0].redes_sociales = typeof rows[0].redes_sociales === 'string'
                    ? JSON.parse(rows[0].redes_sociales)
                    : rows[0].redes_sociales;
            } catch (error) {
                console.error('Error parsing redes_sociales:', error);
                rows[0].redes_sociales = {};
            }
        } else if (rows[0]) {
            rows[0].redes_sociales = {};
        }

        return rows[0];
    },

    async findAll() {
        const query = `
            SELECT id_negocio, razon_social, logo_url, descripcion,
                   telefono, email, direccion, redes_sociales, fecha_actualizacion
            FROM negocio
        `;
        const [rows] = await db.execute(query);

        // Parse JSON fields safely
        rows.forEach(row => {
            if (row.redes_sociales) {
                try {
                    // Solo parsear si es string, si ya es objeto dejarlo como está
                    row.redes_sociales = typeof row.redes_sociales === 'string'
                        ? JSON.parse(row.redes_sociales)
                        : row.redes_sociales;
                } catch (error) {
                    console.error('Error parsing redes_sociales for negocio:', row.id_negocio, error);
                    row.redes_sociales = {};
                }
            } else {
                row.redes_sociales = {};
        }
    });

    return rows;
},

async create(negocio) {
    const { razon_social, logo_url, descripcion, telefono, email, direccion, redes_sociales } = negocio;

    const query = `
        INSERT INTO negocio (razon_social, logo_url, descripcion, telefono, email, direccion, redes_sociales)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Stringify JSON before saving
    const redesSocialesStr = JSON.stringify(redes_sociales || {});

    const [result] = await db.execute(query, [
        razon_social, logo_url, descripcion, telefono, email, direccion, redesSocialesStr
    ]);

    return result.insertId;
},

async update(id, negocio) {
    const { razon_social, logo_url, descripcion, telefono, email, direccion, redes_sociales } = negocio;

    const query = `
        UPDATE negocio
        SET razon_social = ?, logo_url = ?, descripcion = ?,
            telefono = ?, email = ?, direccion = ?, redes_sociales = ?
        WHERE id_negocio = ?
    `;

    const redesSocialesStr = JSON.stringify(redes_sociales || {});

    const [result] = await db.execute(query, [
        razon_social, logo_url, descripcion, telefono, email, direccion, redesSocialesStr, id
    ]);

    return result.affectedRows;
}   
};

module.exports = NegocioModel;