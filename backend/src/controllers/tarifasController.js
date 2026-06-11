const db = require('../config/conexion_db');

const tarifaController = {
    obtenerTodas: async (req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT
                    tv.id_tipo,
                    tv.nombre AS tipo,
                    COALESCE(t.valor_hora, 0) AS valor_hora,
                    COALESCE(t.valor_fraccion, 0) AS valor_fraccion,
                    COALESCE(t.valor_dia, 0) AS valor_dia,
                    COALESCE(t.valor_mensual, 0) AS valor_mensual,
                    t.id_tarifa
                 FROM tipo_vehiculo tv
                 LEFT JOIN tarifa t ON tv.id_tipo = t.id_tipo`
            );
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error al obtener tarifas:', error);
            res.status(500).json({ message: 'Error al obtener tarifas' });
        }
    },

    crearTarifa: async (req, res) => {
        // Agregamos valor_mensual a la destructuración
        const { id_tipo, valor_hora, valor_fraccion, valor_dia, valor_mensual } = req.body;

        if (!id_tipo || valor_hora == null || valor_fraccion == null || valor_dia == null || valor_mensual == null) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        try {
            await db.query(
                `INSERT INTO tarifa (id_tipo, valor_hora, valor_fraccion, valor_dia, valor_mensual)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    valor_hora = VALUES(valor_hora), 
                    valor_fraccion = VALUES(valor_fraccion), 
                    valor_dia = VALUES(valor_dia),
                    valor_mensual = VALUES(valor_mensual)`,
                [id_tipo, valor_hora, valor_fraccion, valor_dia, valor_mensual]
            );
            res.status(201).json({ id_tipo, valor_hora, valor_fraccion, valor_dia, valor_mensual });
        } catch (error) {
            console.error('Error al crear tarifa:', error);
            res.status(500).json({ message: 'Error al crear tarifa' });
        }
    },

    obtenerTiposVehiculo: async (req, res) => {
        try {
            const [rows] = await db.query(`SELECT id_tipo, nombre FROM tipo_vehiculo`);
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error al obtener tipos de vehículo:', error);
            res.status(500).json({ message: 'Error al obtener tipos de vehículo' });
        }
    },

    actualizarTarifa: async (req, res) => {
        const id_tipo = Number(req.params.id);
        const { valor_hora, valor_fraccion, valor_dia, valor_mensual } = req.body;

        if (!id_tipo || valor_hora == null || valor_fraccion == null || valor_dia == null || valor_mensual == null) {
            return res.status(400).json({ message: 'Faltan campos requeridos para actualizar la tarifa' });
        }

        try {
            const [result] = await db.query(
                `UPDATE tarifa SET valor_hora = ?, valor_fraccion = ?, valor_dia = ?, valor_mensual = ?
                 WHERE id_tipo = ?`,
                [valor_hora, valor_fraccion, valor_dia, valor_mensual, id_tipo]
            );

            if (result.affectedRows === 0) {
                await db.query(
                    `INSERT INTO tarifa (id_tipo, valor_hora, valor_fraccion, valor_dia, valor_mensual)
                     VALUES (?, ?, ?, ?, ?)`,
                    [id_tipo, valor_hora, valor_fraccion, valor_dia, valor_mensual]
                );
            }

            res.status(200).json({ message: 'Tarifa actualizada' });
        } catch (error) {
            console.error('Error al actualizar tarifa:', error);
            res.status(500).json({ message: 'Error al actualizar la tarifa' });
        }
    }
};

module.exports = tarifaController;