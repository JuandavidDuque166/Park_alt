import connection from '../config/conexion_db.js';

export const registrarSalidaVehiculo = async (placa, metodoPago) => {
    return new Promise((resolve, reject) => {
        // 1. Buscar el ingreso activo del vehículo por su placa
        const queryIngreso = `
            SELECT c.id_ingreso, c.fecha_hora_entrada, c.id_espacio, v.id_tipo, t.valor_hora, t.valor_fraccion
            FROM control_i_s c
            INNER JOIN vehiculo v ON c.id_vehiculo = v.id_vehiculo
            INNER JOIN tarifa t ON v.id_tipo = t.id_tipo
            WHERE v.placa = ? AND c.fecha_hora_salida IS NULL
            LIMIT 1;
        `;

        connection.query(queryIngreso, [placa], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) {
                return reject({ statusCode: 404, message: 'No se encontró un ingreso activo para esta placa.' });
            }

            const ingreso = results[0];
            const fechaEntrada = new Date(ingreso.fecha_hora_entrada);
            const fechaSalida = new Date();
            
            // 2. Calcular tiempo y tarifa total
            const diferenciaMs = fechaSalida - fechaEntrada;
            const minutosTotales = Math.ceil(diferenciaMs / (1000 * 60));
            const horas = Math.floor(minutosTotales / 60);
            const minutosRestantes = minutosTotales % 60;

            let valorTotal = horas * ingreso.valor_hora;
            if (minutosRestantes > 0) {
                // Si sobra tiempo, se calcula por fracciones (por ejemplo, cada 15 min o proporcional)
                // Ajusta este cálculo según las reglas de negocio de tu parqueadero:
                valorTotal += Math.ceil(minutosRestantes / 15) * ingreso.valor_fraccion;
            }

            if (valorTotal <= 0) valorTotal = ingreso.valor_fraccion; // Cobro mínimo

            // 3. Ejecutar las actualizaciones en la Base de Datos (Se recomienda usar transacciones)
            connection.beginTransaction((transactionError) => {
                if (transactionError) return reject(transactionError);

                // A. Actualizar control de ingresos/salidas
                const queryUpdateControl = `
                    UPDATE control_i_s 
                    SET fecha_hora_salida = NOW() 
                    WHERE id_ingreso = ?;
                `;
                
                connection.query(queryUpdateControl, [ingreso.id_ingreso], (err1) => {
                    if (err1) return connection.rollback(() => reject(err1));

                    // B. Liberar el espacio (Cambiar a DISPONIBLE)
                    const queryUpdateEspacio = `
                        UPDATE espacio 
                        SET estado = 'DISPONIBLE' 
                        WHERE id_espacio = ?;
                    `;

                    connection.query(queryUpdateEspacio, [ingreso.id_espacio], (err2) => {
                        if (err2) return connection.rollback(() => reject(err2));

                        // C. Registrar el pago
                        const queryInsertPago = `
                            INSERT INTO pago (metodo_pago, valor_total, fecha_pago, id_ingreso) 
                            VALUES (?, ?, NOW(), ?);
                        `;

                        connection.query(queryInsertPago, [metodoPago, valorTotal, ingreso.id_ingreso], (err3) => {
                            if (err3) return connection.rollback(() => reject(err3));

                            connection.commit((commitError) => {
                                if (commitError) return connection.rollback(() => reject(commitError));
                                
                                // Retornar información del recibo al frontend
                                resolve({
                                    id_ingreso: ingreso.id_ingreso,
                                    tiempo_total: `${horas}h ${minutosRestantes}m`,
                                    valor_total: valorTotal,
                                    fecha_salida: fechaSalida
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};