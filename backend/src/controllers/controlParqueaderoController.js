const db = require('../config/conexion_db');

const controlParqueaderoController = {
  obtenerDatosControl: async (req, res) => {
    try {
      // 1. Obtener estadísticas de los espacios por nivel
      const [nivelesData] = await db.query(`
        SELECT 
          nivel as nombre,
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'OCUPADO' THEN 1 ELSE 0 END) as ocupados,
          SUM(CASE WHEN estado = 'DISPONIBLE' THEN 1 ELSE 0 END) as disponibles
        FROM espacio
        WHERE estado != 'INACTIVO'
        GROUP BY nivel
      `);

      let totalEspacios = 0;
      let totalOcupados = 0;
      let totalDisponibles = 0;

      // Calcular porcentajes y totales generales
      const niveles = nivelesData.map(n => {
        const total = Number(n.total);
        const ocupados = Number(n.ocupados);
        const disponibles = Number(n.disponibles);
        const porcentaje = total > 0 ? Math.round((ocupados / total) * 100) : 0;

        totalEspacios += total;
        totalOcupados += ocupados;
        totalDisponibles += disponibles;

        return { nombre: n.nombre, total, ocupados, disponibles, porcentaje };
      });

      const stats = {
        total: totalEspacios,
        ocupados: totalOcupados,
        disponibles: totalDisponibles
      };

      // 2. Obtener los vehículos actualmente parqueados
      const [vehiculosData] = await db.query(`
        SELECT 
          v.placa, 
          t.nombre as tipo, 
          e.nivel, 
          c.fecha_hora_entrada
        FROM control_i_s c
        JOIN vehiculo v ON c.id_vehiculo = v.id_vehiculo
        JOIN tipo_vehiculo t ON v.id_tipo = t.id_tipo
        JOIN espacio e ON c.id_espacio = e.id_espacio
        WHERE c.fecha_hora_salida IS NULL
        ORDER BY c.fecha_hora_entrada DESC
      `);

      const horaActual = new Date();
      
      const vehiculos = vehiculosData.map(v => {
        const horaIngreso = new Date(v.fecha_hora_entrada);
        const diffMilisegundos = horaActual - horaIngreso;
        const horasTotales = Math.floor(diffMilisegundos / (1000 * 60 * 60));
        const minutosTotales = Math.floor((diffMilisegundos % (1000 * 60 * 60)) / (1000 * 60));

        // Formatear tipo de vehículo (ej: "AUTOMOVIL" -> "Automóvil")
        const tipoFormateado = v.tipo.charAt(0).toUpperCase() + v.tipo.slice(1).toLowerCase();

        return {
          placa: v.placa,
          tipo: tipoFormateado,
          nivel: v.nivel,
          horaIngreso: horaIngreso.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          tiempo: `${horasTotales}h ${minutosTotales}m`,
          estado: 'Temporal' // Aquí podrías validar contra la tabla mensualidad si lo requieres
        };
      });

      res.json({ 
        success: true, 
        data: { stats, niveles, vehiculos } 
      });

    } catch (error) {
      console.error("Error en obtenerDatosControl:", error);
      res.status(500).json({ success: false, error: "Error de servidor al cargar el control" });
    }
  }
};

module.exports = controlParqueaderoController;