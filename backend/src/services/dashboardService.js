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
        `SELECT COUNT(*) AS total FROM espacio WHERE estado != 'INACTIVO'`
      );

      const [entradasDiaRows] = await db.execute(
        `SELECT COUNT(*) AS total FROM control_i_s WHERE DATE(fecha_hora_entrada) = CURDATE()`
      );

      const [recaudoDiaRows] = await db.execute(
        `SELECT IFNULL(SUM(valor_total), 0) AS total FROM pago WHERE DATE(fecha_pago) = CURDATE()`
      );

      const [vehiculosPorTipoRows] = await db.execute(
        `SELECT
            tv.nombre AS nombre,
            COUNT(DISTINCT c.id_vehiculo) AS total
          FROM tipo_vehiculo tv
          LEFT JOIN vehiculo v ON v.id_tipo = tv.id_tipo
          LEFT JOIN (
            SELECT id_vehiculo
            FROM control_i_s
            WHERE fecha_hora_salida IS NULL
            GROUP BY id_vehiculo
          ) c ON c.id_vehiculo = v.id_vehiculo
          GROUP BY tv.id_tipo, tv.nombre
          ORDER BY tv.nombre`
      );

      const [ultimosIngresosRows] = await db.execute(
        `SELECT
            v.placa,
            tv.nombre AS tipo,
            e.nivel,
            DATE_FORMAT(c.fecha_hora_entrada, '%H:%i') AS hora,
            'En curso' AS estado
          FROM control_i_s c
          JOIN vehiculo v ON c.id_vehiculo = v.id_vehiculo
          JOIN tipo_vehiculo tv ON v.id_tipo = tv.id_tipo
          JOIN espacio e ON c.id_espacio = e.id_espacio
          WHERE c.fecha_hora_salida IS NULL
          ORDER BY c.fecha_hora_entrada DESC
          LIMIT 10`
      );

      const vehiculosActivos = vehiculosActivosRows[0]?.total || 0;
      const espaciosTotales = espaciosTotalesRows[0]?.total || 0;
      const espaciosDisponibles = Math.max(espaciosTotales - vehiculosActivos, 0);

      return {
        vehiculosActivos,
        espaciosTotales,
        espaciosDisponibles,
        ocupados: vehiculosActivos,
        libres: espaciosDisponibles,
        recaudoDia: Number(recaudoDiaRows[0]?.total || 0),
        entradasDia: Number(entradasDiaRows[0]?.total || 0),
        vehiculosPorTipo: vehiculosPorTipoRows,
        vehiculosportipo: vehiculosPorTipoRows,
        ocupacion: [
          { label: 'Disponibles', value: espaciosDisponibles },
          { label: 'Ocupados', value: vehiculosActivos }
        ],
        ultimosIngresos: ultimosIngresosRows
      };
    } catch (error) {
      console.error('DashboardService.getResumen - error:', error.message);
      throw new AppError('Error al obtener estadísticas del dashboard', httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
};

module.exports = DashboardService;
