const pool = require('../config/conexion_db'); // Ajusta la ruta a donde tengas tu conexión/pool de mysql2

const ReporteModel = {
  obtenerTransacciones: async (fechaInicio, fechaFin) => {
    let query = `
      SELECT 
        c.id_ingreso AS id,
        v.placa AS placa,
        tv.nombre AS tipo,
        IF(m.id_mensualidad IS NOT NULL, 'Mensual', 'Ocasional') AS servicio,
        DATE_FORMAT(c.fecha_hora_entrada, '%Y-%m-%d') AS fecha,
        DATE_FORMAT(c.fecha_hora_entrada, '%H:%i') AS ingreso,
        IFNULL(DATE_FORMAT(c.fecha_hora_salida, '%H:%i'), '--:--') AS salida,
        IFNULL(c.fecha_hora_salida, '') AS fecha_salida,
        IFNULL(p.valor_total, 0) AS valor,
        IF(p.id_pago IS NOT NULL, 'Pagado', 'Pendiente') AS estado
      FROM control_i_s c
      LEFT JOIN vehiculo v ON c.id_vehiculo = v.id_vehiculo
      LEFT JOIN tipo_vehiculo tv ON v.id_tipo = tv.id_tipo
      LEFT JOIN pago p ON c.id_ingreso = p.id_ingreso
      LEFT JOIN mensualidad m ON v.id_vehiculo = m.id_vehiculo 
        AND c.fecha_hora_entrada BETWEEN m.fecha_inicio AND m.fecha_fin
      WHERE 1=1
    `;
    const params = [];

    if (fechaInicio) {
      query += " AND DATE(c.fecha_hora_entrada) >= ?";
      params.push(fechaInicio);
    }
    if (fechaFin) {
      query += " AND DATE(c.fecha_hora_entrada) <= ?";
      params.push(fechaFin);
    }

    query += " ORDER BY c.fecha_hora_entrada DESC";

    const [rows] = await pool.query(query, params);

    // Mapeo extra para calcular la diferencia de tiempo de forma legible para el front si ya salió
    return rows.map(row => {
      let tiempo = 'En parqueadero';
      if (row.fecha_salida && row.fecha) {
        const diffMs = new Date(row.fecha_salida) - new Date(`${row.fecha}T${row.ingreso}`);
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        tiempo = `${diffHrs}h ${diffMins}m`;
      }
      delete row.fecha_salida; // Limpiamos la propiedad de fecha completa
      return { ...row, tiempo };
    });
  }
};

module.exports = ReporteModel;