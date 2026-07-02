const db = require('../config/conexion_db'); 

const salidaVehiculoController = {
  
  obtenerActivos: async (req, res) => {
    try {
      // Ajustamos los nombres de tablas y columnas según tu archivo SQL
      const [vehiculos] = await db.query(`
        SELECT c.id_ingreso, v.placa, t.nombre as tipo_vehiculo, e.nivel, c.fecha_hora_entrada AS hora_ingreso
        , IF(m.id_mensualidad IS NOT NULL, 1, 0) AS tiene_mensualidad_activa
        , COALESCE(m.nivel_servicio, '') AS mensualidad_nivel_servicio
        FROM control_i_s c
        JOIN vehiculo v ON c.id_vehiculo = v.id_vehiculo
        JOIN tipo_vehiculo t ON v.id_tipo = t.id_tipo
        JOIN espacio e ON c.id_espacio = e.id_espacio
        LEFT JOIN (
          SELECT id_vehiculo, nivel_servicio, MAX(fecha_fin) AS fecha_fin
          FROM mensualidad
          WHERE estado = 'ACTIVA'
            AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
          GROUP BY id_vehiculo
        ) m ON m.id_vehiculo = v.id_vehiculo
        WHERE c.fecha_hora_salida IS NULL
        ORDER BY c.fecha_hora_entrada DESC
      `);

      const horaActual = new Date();
      const tarifaHora = 5000; // Puedes ajustar esto después

      const dataConCalculos = vehiculos.map(v => {
        const horaIngreso = new Date(v.hora_ingreso);
        const diffMilisegundos = horaActual - horaIngreso;
        const horasTotales = Math.floor(diffMilisegundos / (1000 * 60 * 60));
        const minutosTotales = Math.floor((diffMilisegundos % (1000 * 60 * 60)) / (1000 * 60));
        
        let horasCobro = Math.ceil(diffMilisegundos / (1000 * 60 * 60));
        if (horasCobro === 0) horasCobro = 1;

        return {
          ...v,
          tiempo_formateado: `${horasTotales}h ${minutosTotales}m`,
          valor_estimado: (horasCobro * tarifaHora).toLocaleString('es-CO')
        };
      });
      
      res.json({ success: true, data: dataConCalculos });
    } catch (error) {
      console.error("Error en obtenerActivos:", error);
      res.status(500).json({ success: false, error: "Error interno en la base de datos" });
    }
  },

  procesarSalida: async (req, res) => {
    const { id_ingreso, metodo_pago: metodoPago = 'EFECTIVO' } = req.body;
    
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
        return res.status(404).json({ success: false, error: "Registro no encontrado" });
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
      const metodoPagoFinal = mensualidadActiva ? 'EFECTIVO' : metodoPago;

      await connection.query(`
        UPDATE espacio 
        SET estado = 'DISPONIBLE' 
        WHERE id_espacio = ?
      `, [id_espacio]);

      await connection.query(`
        UPDATE control_i_s 
        SET fecha_hora_salida = ? 
        WHERE id_ingreso = ?
      `, [horaSalida, id_ingreso]);

      await connection.query(`
        INSERT INTO pago (metodo_pago, valor_total, fecha_pago, id_ingreso) 
        VALUES (?, ?, ?, ?)
      `, [metodoPagoFinal, totalPagar, horaSalida, id_ingreso]);

      await connection.commit();
      
      res.json({
        success: true,
        total_pagar: totalPagar,
        mensualidad_activa: Boolean(mensualidadActiva),
        tipo_servicio: tipoServicioSalida
      });

    } catch (error) {
      // Si algo falla en cualquiera de los 4 pasos, deshacemos todo para evitar corromper los datos
      await connection.rollback();
      console.error("Error en procesarSalida:", error);
      res.status(500).json({ success: false, error: "Error al registrar la salida y liberar el espacio" });
    } finally {
      // IMPORTANTE: Siempre devolvemos la conexión al pool para que no se quede congelada
      connection.release();
    }
  }
};

module.exports = salidaVehiculoController;
module.exports = salidaVehiculoController;