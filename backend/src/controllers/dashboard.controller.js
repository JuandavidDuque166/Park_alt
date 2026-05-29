const db = require('../db');

const getDashboardData = async (req, res) => {
    try {
        // 1. Vehículos Activos (Sin fecha_hora_salida)
        const [activos] = await db.query(
            `SELECT COUNT(*) AS total FROM control_i_s WHERE fecha_hora_salida IS NULL`
        );

        // 2. Espacios Disponibles
        const [espacios] = await db.query(
            `SELECT 
                (SELECT COUNT(*) FROM espacio WHERE estado = 'DISPONIBLE') AS disponibles,
                (SELECT COUNT(*) FROM espacio) AS totales`
        );

        // 3. Recaudo del día actual
        const [recaudo] = await db.query(
            `SELECT SUM(valor_total) AS total_dia 
             FROM pago 
             WHERE DATE(fecha_pago) = CURDATE()`
        );

        // 4. Entradas del día
        const [entradasDia] = await db.query(
            `SELECT COUNT(*) AS total_entradas 
             FROM control_i_s 
             WHERE DATE(fecha_hora_entrada) = CURDATE()`
        );

        // 5. Últimos 5 vehículos ingresados
        const [ultimosIngresos] = await db.query(
            `SELECT 
                v.placa, 
                tv.nombre AS tipo, 
                e.nivel, 
                c.fecha_hora_entrada,
                'Temporal' AS estado
             FROM control_i_s c
             JOIN vehiculo v ON c.id_vehiculo = v.id_vehiculo
             JOIN tipo_vehiculo tv ON v.id_tipo = tv.id_tipo
             JOIN espacio e ON c.id_espacio = e.id_espacio
             WHERE c.fecha_hora_salida IS NULL
             ORDER BY c.fecha_hora_entrada DESC 
             LIMIT 5`
        );

        res.status(200).json({
            vehiculosActivos: activos[0].total,
            espaciosDisponibles: espacios[0].disponibles,
            espaciosTotales: espacios[0].totales,
            recaudoDia: recaudo[0].total_dia || 0,
            entradasDia: entradasDia[0].total_entradas,
            ultimosIngresos
        });

    } catch (error) {
        console.error("Error obteniendo datos del dashboard:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

module.exports = { getDashboardData };