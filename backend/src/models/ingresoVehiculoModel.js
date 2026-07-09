const db = require('../config/conexion_db');

class IngresoVehiculoModel {
    static async buscarVehiculo(placa) {
        const [rows] = await db.query(
            'SELECT id_vehiculo FROM vehiculo WHERE placa = ?',
            [placa]
        );
        return rows[0];
    }

    static async registrarVehiculoNuevo(placa, idTipo) {
        const [result] = await db.query(
            'INSERT INTO vehiculo (placa, id_tipo) VALUES (?, ?)',
            [placa, idTipo]
        );
        return result.insertId;
    }

    static async verificarVehiculoDentro(idVehiculo) {
        const [rows] = await db.query(
            'SELECT id_ingreso FROM control_i_s WHERE id_vehiculo = ? AND fecha_hora_salida IS NULL',
            [idVehiculo]
        );
        return rows.length > 0;
    }

    // Obtener contador de espacios disponibles usando ingresos activos
    static async obtenerEspaciosDisponibles() {
        const [totalRows] = await db.query(
            "SELECT COUNT(*) as total FROM espacio WHERE estado != 'INACTIVO'"
        );
        const [ocupadosRows] = await db.query(
            `SELECT COUNT(*) AS ocupados
             FROM control_i_s c
             WHERE c.fecha_hora_salida IS NULL`
        );
        return {
            disponibles: Math.max(0, Number(totalRows[0].total) - Number(ocupadosRows[0].ocupados)),
            total: Number(totalRows[0].total)
        };
    }

    // MODIFICADO: Busca espacio por nivel, lo ocupa y registra ingreso
    static async registrarIngreso(data) {
        const { idVehiculo, urlImagen, nivel, idUsuario } = data;
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Buscar un espacio disponible en el nivel seleccionado
            const [espacios] = await connection.query(
                "SELECT id_espacio, numero FROM espacio WHERE nivel = ? AND estado = 'DISPONIBLE' LIMIT 1",
                [nivel]
            );

            if (espacios.length === 0) {
                throw new Error(`No hay espacios disponibles en el nivel: ${nivel}`);
            }

            const idEspacio = espacios[0].id_espacio;
            const numeroEspacio = espacios[0].numero;

            // 2. Marcar el espacio como OCUPADO
            await connection.query(
                "UPDATE espacio SET estado = 'OCUPADO' WHERE id_espacio = ?",
                [idEspacio]
            );

            // 3. Insertar en control_i_s vinculando espacio y usuario operario
            const [result] = await connection.query(
                `INSERT INTO control_i_s (fecha_hora_entrada, url_imagen, id_vehiculo, id_espacio, id_usuario) 
                 VALUES (NOW(), ?, ?, ?, ?)`,
                [urlImagen, idVehiculo, idEspacio, idUsuario || null]
            );

            await connection.commit();
            return {
                idIngreso: result.insertId,
                espacioAsignado: numeroEspacio
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = IngresoVehiculoModel;