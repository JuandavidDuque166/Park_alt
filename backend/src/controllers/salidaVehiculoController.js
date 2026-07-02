const db = require('../config/conexion_db'); 

const salidaVehiculoController = {
  
  obtenerActivos: async (req, res) => {
    try {
      const [vehiculos] = await db.query(`
        SELECT
          c.id_ingreso,
          v.placa,
          t.nombre AS tipo_vehiculo,
          DATE_FORMAT(c.fecha_hora_entrada, '%Y-%m-%dT%H:%i:%s') AS hora_ingreso,
          CASE
            WHEN m.id_mensualidad IS NOT NULL THEN 'Mensualidad'
            ELSE 'Temporal'
          END AS tipo_servicio,
          CASE
            WHEN m.id_mensualidad IS NOT NULL THEN 0
            ELSE GREATEST(CEIL(TIMESTAMPDIFF(MINUTE, c.fecha_hora_entrada, NOW()) / 60), 1) * COALESCE(tar.valor_hora, 0)
          END AS valor_estimado,
          CONCAT(
            FLOOR(TIMESTAMPDIFF(MINUTE, c.fecha_hora_entrada, NOW()) / 60), 'h ',
            LPAD(MOD(TIMESTAMPDIFF(MINUTE, c.fecha_hora_entrada, NOW()), 60), 2, '0'), 'm'
          ) AS tiempo_formateado
        FROM control_i_s c
        LEFT JOIN vehiculo v ON c.id_vehiculo = v.id_vehiculo
        LEFT JOIN tipo_vehiculo t ON v.id_tipo = t.id_tipo
        LEFT JOIN tarifa tar ON t.id_tipo = tar.id_tipo
        LEFT JOIN (
          SELECT id_vehiculo, MAX(id_mensualidad) AS id_mensualidad
          FROM mensualidad
          WHERE estado = 'ACTIVA'
            AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
          GROUP BY id_vehiculo
        ) m ON m.id_vehiculo = v.id_vehiculo
        -- Solo ingresos abiertos: vehículos dentro del parqueadero
        WHERE c.fecha_hora_salida IS NULL
        ORDER BY c.fecha_hora_entrada DESC
      `);

      res.status(200).json({ success: true, data: vehiculos });
    } catch (error) {
      console.error('Error en obtenerActivos:', error);
      res.status(500).json({ success: false, error: 'Error interno en la base de datos' });
    }
  },

  procesarSalida: async (req, res) => {
    console.log('procesarSalida req.body:', req.body);
    const { id_ingreso, metodo_pago: metodoPago = 'EFECTIVO' } = req.body;

    const normalizeMetodoPago = (value) => {
      const raw = String(value || '').trim().toUpperCase();
      if (raw === 'TRANSFERENCIA' || raw === 'TRASNFERENCIA') return 'TRASNFERENCIA';
      return 'EFECTIVO';
    };

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [rows] = await connection.query(
        `
          SELECT c.id_ingreso, c.id_espacio, c.id_vehiculo, v.placa, c.fecha_hora_entrada
          FROM control_i_s c
          INNER JOIN vehiculo v ON c.id_vehiculo = v.id_vehiculo
          WHERE c.id_ingreso = ?
          LIMIT 1
        `,
        [id_ingreso]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, error: 'Registro no encontrado' });
      }

      const ingreso = rows[0];
      const id_espacio = ingreso.id_espacio;
      const horaSalida = new Date();

      const [mensualidades] = await connection.query(
        `
          SELECT id_mensualidad, estado, fecha_inicio, fecha_fin, valor, nivel_servicio
          FROM mensualidad
          WHERE id_vehiculo = ?
            AND estado = 'ACTIVA'
            AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
          ORDER BY fecha_fin DESC
          LIMIT 1
        `,
        [ingreso.id_vehiculo]
      );

      const mensualidadActiva = mensualidades.length > 0 ? mensualidades[0] : null;
      const totalPagar = mensualidadActiva ? 0 : 5000;
      const tipoServicioSalida = mensualidadActiva ? 'Mensualidad' : 'Temporal';
      const metodoPagoFinal = mensualidadActiva ? 'EFECTIVO' : normalizeMetodoPago(metodoPago);

      await connection.query(
        `
          UPDATE espacio
          SET estado = 'DISPONIBLE'
          WHERE id_espacio = ?
        `,
        [id_espacio]
      );

      await connection.query(
        `
          UPDATE control_i_s
          SET fecha_hora_salida = ?
          WHERE id_ingreso = ?
        `,
        [horaSalida, id_ingreso]
      );

      await connection.query(
        `
          INSERT INTO pago (metodo_pago, valor_total, fecha_pago, id_ingreso)
          VALUES (?, ?, ?, ?)
        `,
        [metodoPagoFinal, totalPagar, horaSalida, id_ingreso]
      );

      await connection.commit();

      return res.status(200).json({
        success: true,
        total_pagar: totalPagar,
        mensualidad_activa: Boolean(mensualidadActiva),
        tipo_servicio: tipoServicioSalida,
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error en procesarSalida:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error al registrar la salida y liberar el espacio' });
    } finally {
      connection.release();
    }
  }
};

module.exports = salidaVehiculoController;
module.exports = salidaVehiculoController;