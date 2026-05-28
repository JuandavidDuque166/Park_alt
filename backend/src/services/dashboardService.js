const db = require('../config/conexion_db');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');

const DashboardService = {
  async getResumen() {
    try {
      const [vehiculosActivosRows] = await db.execute(
        `SELECT COUNT(*) AS total FROM control_i_s WHERE fecha_hora_salida IS NULL`
      );

      const [espaciosTotalesRows] = await db.execute(
        `SELECT COUNT(*) AS total FROM espacio`
      );

      const [entradasDiaRows] = await db.execute(
        `SELECT COUNT(*) AS total FROM control_i_s WHERE DATE(fecha_hora_entrada) = CURDATE()`
      );

      const [recaudoDiaRows] = await db.execute(
        `SELECT IFNULL(SUM(valor_total), 0) AS total FROM pago WHERE DATE(fecha_pago) = CURDATE()`
      );

      const [ultimosIngresosRows] = await db.execute(
        `SELECT
            v.placa,
            tv.nombre AS tipo,
            e.nivel,
            DATE_FORMAT(c.fecha_hora_entrada, '%H:%i') AS hora,
            IF(c.fecha_hora_salida IS NULL, 'En curso', 'Salido') AS estado
          FROM control_i_s c
          JOIN vehiculo v ON c.id_vehiculo = v.id_vehiculo
          JOIN tipo_vehiculo tv ON v.id_tipo = tv.id_tipo
          JOIN espacio e ON c.id_espacio = e.id_espacio
          ORDER BY c.fecha_hora_entrada DESC
          LIMIT 10`
      );

      return {
        vehiculosActivos: vehiculosActivosRows[0]?.total || 0,
        espaciosTotales: espaciosTotalesRows[0]?.total || 0,
        espaciosDisponibles: Math.max((espaciosTotalesRows[0]?.total || 0) - (vehiculosActivosRows[0]?.total || 0), 0),
        recaudoDia: Number(recaudoDiaRows[0]?.total || 0),
        entradasDia: entradasDiaRows[0]?.total || 0,
        ultimosIngresos: ultimosIngresosRows
      };
    } catch (error) {
      console.error('DashboardService.getResumen - error:', error.message);
      throw new AppError('Error al obtener estadísticas del dashboard', httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
};

module.exports = DashboardService;
