const db = require('../config/conexion_db');

const TABLE_NAME = 'parqueadero';

const BASE_COLUMNS = [
    'id_parqueadero',
    'nombre_parqueadero',
    'logo_url',
    'direccion',
    'telefono',
    'email',
    'nit',
    'capacidad_total',
    'capacidad_altura',
    'capacidad_subterraneo',
    'hora_apertura',
    'hora_cierre',
    'fecha_actualizacion'
];

const MUTABLE_COLUMNS = [
    'nombre_parqueadero',
    'logo_url',
    'direccion',
    'telefono',
    'email',
    'nit',
    'capacidad_total',
    'capacidad_altura',
    'capacidad_subterraneo',
    'hora_apertura',
    'hora_cierre'
];

const ParqueaderoModel = {
    async findById(id) {
    const query = `
        SELECT ${BASE_COLUMNS.join(', ')}
        FROM ${TABLE_NAME}
        WHERE id_parqueadero = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
    },

    async findAll() {
    const query = `
        SELECT ${BASE_COLUMNS.join(', ')}
        FROM ${TABLE_NAME}
        ORDER BY id_parqueadero ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
    },

    async create(parqueadero) {
    const query = `
        INSERT INTO ${TABLE_NAME} (
        ${MUTABLE_COLUMNS.join(', ')},
        fecha_actualizacion
        )
        VALUES (
        ${MUTABLE_COLUMNS.map(() => '?').join(', ')},
        NOW()
        )
    `;

    const values = MUTABLE_COLUMNS.map((column) => parqueadero[column] ?? null);
    const [result] = await db.execute(query, values);
    return result.insertId;
    },

    async update(id, parqueadero) {
    const entries = Object.entries(parqueadero).filter(([, value]) => value !== undefined);

    if (entries.length === 0) {
        return 0;
    }

    const setClause = entries.map(([column]) => `${column} = ?`).join(', ');
    const values = entries.map(([, value]) => value);

    const query = `
        UPDATE ${TABLE_NAME}
        SET ${setClause}, fecha_actualizacion = NOW()
        WHERE id_parqueadero = ?
    `;

    const [result] = await db.execute(query, [...values, id]);
    return result.affectedRows;
    }
};

module.exports = ParqueaderoModel;