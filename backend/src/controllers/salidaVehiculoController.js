const db = require('../config/conexion_db'); 

const salidaVehiculoController = {
  
  obtenerActivos: async (req, res) => {
    try {
      // Ajustamos los nombres de tablas y columnas según tu archivo SQL
      const [vehiculos] = await db.query(`
        SELECT c.id_ingreso, v.placa, t.nombre as tipo_vehiculo, e.nivel, c.fecha_hora_entrada 
        FROM control_i_s c
        JOIN vehiculo v ON c.id_vehiculo = v.id_vehiculo
        JOIN tipo_vehiculo t ON v.id_tipo = t.id_tipo
        JOIN espacio e ON c.id_espacio = e.id_espacio
        WHERE c.fecha_hora_salida IS NULL
        ORDER BY c.fecha_hora_entrada DESC
      `);

      const horaActual = new Date();
      const tarifaHora = 5000; // Puedes ajustar esto después

      const dataConCalculos = vehiculos.map(v => {
        const horaIngreso = new Date(v.fecha_hora_entrada);
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
    const { id_ingreso } = req.body;

    try {
      // 1. Obtener datos del ingreso
      const [rows] = await db.query("SELECT * FROM control_i_s WHERE id_ingreso = ?", [id_ingreso]);
      if (rows.length === 0) return res.status(404).json({ success: false, error: "Registro no encontrado" });

      const horaSalida = new Date();
      const totalPagar = 5000; // Lógica simplificada

      // 2. Actualizar fecha_hora_salida en control_i_s
      await db.query(`
        UPDATE control_i_s 
        SET fecha_hora_salida = ? 
        WHERE id_ingreso = ?
      `, [horaSalida, id_ingreso]);

      // 3. Registrar en tabla pago
      await db.query(`
        INSERT INTO pago (metodo_pago, valor_total, fecha_pago, id_ingreso) 
        VALUES ('EFECTIVO', ?, ?, ?)
      `, [totalPagar, horaSalida, id_ingreso]);

      res.json({ success: true, total_pagar: totalPagar });

    } catch (error) {
      console.error("Error en procesarSalida:", error);
      res.status(500).json({ success: false, error: "Error al registrar la salida" });
    }
  }
};

module.exports = salidaVehiculoController;