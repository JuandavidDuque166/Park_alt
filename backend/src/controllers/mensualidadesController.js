const db = require('../config/conexion_db');
const { normalizarNivelServicioParaGuardar, esNivelServicioValido } = require('../utils/nivelServicio');

const normalizarTexto = (value) => String(value || '').trim();
const campoVacio = (value) => value === undefined || value === null || String(value).trim() === '';

const normalizarTipoVehiculo = (tipo) => {
    return normalizarTexto(tipo)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();
};

const normalizarNivelServicio = (nivelServicio) => {
    return normalizarTexto(nivelServicio)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();
};

const validarFecha = (fecha, nombreCampo) => {
    if (campoVacio(fecha)) {
        return { valido: false, error: `${nombreCampo} es requerida` };
    }
    
    const dateObj = new Date(fecha);
    if (isNaN(dateObj.getTime())) {
        return { valido: false, error: `${nombreCampo} tiene un formato inválido. Use YYYY-MM-DD` };
    }
    
    return { valido: true, fecha: dateObj };
};

const obtenerMensualidades = async (req, res) => {
    try {
        const query = `
            SELECT
                m.id_mensualidad AS id,
                COALESCE(v.placa, '') AS placa,
                COALESCE(tv.nombre, '') AS tipo,
                COALESCE(m.nivel_servicio, '') AS nivel_servicio,
                COALESCE(c.nombre_completo, '') AS propietario,
                COALESCE(c.telefono, '') AS telefono,
                DATE_FORMAT(m.fecha_inicio, '%Y-%m-%d') AS vigencia,
                DATE_FORMAT(m.fecha_fin, '%Y-%m-%d') AS fecha_fin,
                COALESCE(m.valor, 0) AS valor,
                COALESCE(m.estado, 'DESCONOCIDO') AS estado
            FROM mensualidad m
            LEFT JOIN cliente c ON m.id_cliente = c.id_cliente
            LEFT JOIN vehiculo v ON m.id_vehiculo = v.id_vehiculo
            LEFT JOIN tipo_vehiculo tv ON v.id_tipo = tv.id_tipo
            ORDER BY m.id_mensualidad DESC
        `;

        const [rows] = await db.query(query);
        const processedRows = rows.map(row => ({
            ...row,
            valor: Number(row.valor) || 0
        }));
        
        return res.status(200).json(processedRows);
    } catch (error) {
        console.error('Error al listar mensualidades:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            stack: error.stack
        });
        return res.status(500).json({
            status: 'fail',
            message: 'Error al listar mensualidades',
            error: error.message
        });
    }
};

const crearMensualidad = async (req, res) => {
    const {
        placa,
        tipo,
        nivel_servicio,
        propietario,
        telefono,
        fecha_inicio: fechaInicioBody,
        vigencia,
        fecha_fin,
        valor
    } = req.body;

    const fecha_inicio = fechaInicioBody || vigencia;
    const camposFaltantes = [];

    if (campoVacio(placa)) camposFaltantes.push('placa');
    if (campoVacio(tipo)) camposFaltantes.push('tipo');
    if (campoVacio(nivel_servicio)) camposFaltantes.push('nivel_servicio');
    if (campoVacio(propietario)) camposFaltantes.push('propietario');
    if (campoVacio(telefono)) camposFaltantes.push('telefono');
    if (campoVacio(fecha_inicio)) camposFaltantes.push('fecha_inicio o vigencia');
    if (campoVacio(fecha_fin)) camposFaltantes.push('fecha_fin');
    if (campoVacio(valor)) camposFaltantes.push('valor');

    if (camposFaltantes.length > 0) {
        return res.status(400).json({
            status: 'fail',
            message: 'Faltan campos requeridos',
            fields: camposFaltantes
        });
    }

    // Validación de fechas
    const validacionInicio = validarFecha(fecha_inicio, 'fecha_inicio');
    if (!validacionInicio.valido) {
        return res.status(400).json({
            status: 'fail',
            message: validacionInicio.error
        });
    }

    const validacionFin = validarFecha(fecha_fin, 'fecha_fin');
    if (!validacionFin.valido) {
        return res.status(400).json({
            status: 'fail',
            message: validacionFin.error
        });
    }

    if (validacionInicio.fecha >= validacionFin.fecha) {
        return res.status(400).json({
            status: 'fail',
            message: 'fecha_inicio debe ser anterior a fecha_fin'
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.query('START TRANSACTION');

        const placaNormalizada = normalizarTexto(placa).toUpperCase();
        const tipoNormalizado = normalizarTipoVehiculo(tipo);
        const nivelServicioNormalizado = normalizarNivelServicioParaGuardar(nivel_servicio);
        const propietarioNormalizado = normalizarTexto(propietario);
        const telefonoNormalizado = normalizarTexto(telefono);

        console.log(
            `[Mensualidades] tipo recibido=${JSON.stringify(tipo)} | tipo normalizado=${JSON.stringify(tipoNormalizado)} | nivel_servicio recibido=${JSON.stringify(nivel_servicio)} | nivel_servicio normalizado=${JSON.stringify(nivelServicioNormalizado)}`
        );

        if (!esNivelServicioValido(nivel_servicio)) {
            await connection.rollback();
            return res.status(400).json({
                status: 'fail',
                message: `Nivel de servicio invalido: ${nivel_servicio}`
            });
        }

        const [tiposVehiculo] = await connection.execute(
            'SELECT id_tipo FROM tipo_vehiculo WHERE UPPER(TRIM(nombre)) = ? LIMIT 1',
            [tipoNormalizado]
        );

        if (tiposVehiculo.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                status: 'fail',
                message: `No existe el tipo de vehiculo: ${tipo}`
            });
        }

        const idTipo = tiposVehiculo[0].id_tipo;

        const [vehiculos] = await connection.execute(
            'SELECT id_vehiculo FROM vehiculo WHERE placa = ? LIMIT 1',
            [placaNormalizada]
        );

        let idVehiculo;

        if (vehiculos.length > 0) {
            idVehiculo = vehiculos[0].id_vehiculo;
        } else {
            const [vehiculoCreado] = await connection.execute(
                'INSERT INTO vehiculo (placa, id_tipo) VALUES (?, ?)',
                [placaNormalizada, idTipo]
            );
            idVehiculo = vehiculoCreado.insertId;
        }

        const [clientes] = await connection.execute(
            'SELECT id_cliente FROM cliente WHERE nombre_completo = ? LIMIT 1',
            [propietarioNormalizado]
        );

        let idCliente;

        if (clientes.length > 0) {
            idCliente = clientes[0].id_cliente;
            await connection.execute(
                'UPDATE cliente SET telefono = ? WHERE id_cliente = ?',
                [telefonoNormalizado, idCliente]
            );
        } else {
            const documentoTemporal = `SIN-DOC-${placaNormalizada}-${Date.now()}`;
            const [clienteCreado] = await connection.execute(
                'INSERT INTO cliente (nombre_completo, documento, telefono) VALUES (?, ?, ?)',
                [propietarioNormalizado, documentoTemporal, telefonoNormalizado]
            );
            idCliente = clienteCreado.insertId;
        }

        const [mensualidadCreada] = await connection.execute(
            `
                INSERT INTO mensualidad
                    (id_cliente, id_vehiculo, fecha_inicio, fecha_fin, nivel_servicio, valor, estado)
                VALUES
                    (?, ?, ?, ?, ?, ?, 'ACTIVA')
            `,
            [idCliente, idVehiculo, fecha_inicio, fecha_fin, nivelServicioNormalizado, valor]
        );

        await connection.commit();

        return res.status(201).json({
            message: 'Mensualidad creada correctamente',
            data: {
                id_mensualidad: mensualidadCreada.insertId,
                id_cliente: idCliente,
                id_vehiculo: idVehiculo,
                nivel_servicio: nivelServicioNormalizado
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al crear mensualidad:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            stack: error.stack
        });

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'fail',
                message: 'Ya existe un registro duplicado en cliente o vehiculo',
                error: error.sqlMessage || error.message
            });
        }

        if (
            error.code === 'ER_TRUNCATED_WRONG_VALUE' ||
            error.code === 'WARN_DATA_TRUNCATED' ||
            error.code === 'ER_DATA_TOO_LONG' ||
            error.code === 'ER_BAD_NULL_ERROR'
        ) {
            return res.status(400).json({
                status: 'fail',
                message: 'Los datos enviados no coinciden con el formato esperado',
                error: error.sqlMessage || error.message
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({
                status: 'fail',
                message: 'Referencia de clave foránea inválida. Verifica los IDs relacionados.',
                error: error.sqlMessage || error.message
            });
        }

        return res.status(500).json({
            status: 'fail',
            message: 'Error al crear la mensualidad. No se guardo ningun dato.',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

const actualizarMensualidad = async (req, res) => {
    const { id } = req.params;
    const {
        placa,
        tipo,
        nivel_servicio,
        propietario,
        telefono,
        fecha_inicio: fechaInicioBody,
        vigencia,
        fecha_fin,
        valor
    } = req.body;

    const fecha_inicio = fechaInicioBody || vigencia;
    const camposFaltantes = [];

    if (campoVacio(id)) camposFaltantes.push('id');
    if (campoVacio(placa)) camposFaltantes.push('placa');
    if (campoVacio(tipo)) camposFaltantes.push('tipo');
    if (campoVacio(nivel_servicio)) camposFaltantes.push('nivel_servicio');
    if (campoVacio(propietario)) camposFaltantes.push('propietario');
    if (campoVacio(telefono)) camposFaltantes.push('telefono');
    if (campoVacio(fecha_inicio)) camposFaltantes.push('fecha_inicio o vigencia');
    if (campoVacio(fecha_fin)) camposFaltantes.push('fecha_fin');
    if (campoVacio(valor)) camposFaltantes.push('valor');

    if (camposFaltantes.length > 0) {
        return res.status(400).json({
            status: 'fail',
            message: 'Faltan campos requeridos',
            fields: camposFaltantes
        });
    }

    // Validación de fechas
    const validacionInicio = validarFecha(fecha_inicio, 'fecha_inicio');
    if (!validacionInicio.valido) {
        return res.status(400).json({
            status: 'fail',
            message: validacionInicio.error
        });
    }

    const validacionFin = validarFecha(fecha_fin, 'fecha_fin');
    if (!validacionFin.valido) {
        return res.status(400).json({
            status: 'fail',
            message: validacionFin.error
        });
    }

    if (validacionInicio.fecha >= validacionFin.fecha) {
        return res.status(400).json({
            status: 'fail',
            message: 'fecha_inicio debe ser anterior a fecha_fin'
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.query('START TRANSACTION');

        const [mensualidades] = await connection.execute(
            'SELECT id_mensualidad FROM mensualidad WHERE id_mensualidad = ? LIMIT 1',
            [id]
        );

        if (mensualidades.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                status: 'fail',
                message: 'Mensualidad no encontrada'
            });
        }

        const placaNormalizada = normalizarTexto(placa).toUpperCase();
        const tipoNormalizado = normalizarTipoVehiculo(tipo);
        const nivelServicioNormalizado = normalizarNivelServicioParaGuardar(nivel_servicio);
        const propietarioNormalizado = normalizarTexto(propietario);
        const telefonoNormalizado = normalizarTexto(telefono);

        console.log(
            `[Mensualidades] tipo recibido=${JSON.stringify(tipo)} | tipo normalizado=${JSON.stringify(tipoNormalizado)} | nivel_servicio recibido=${JSON.stringify(nivel_servicio)} | nivel_servicio normalizado=${JSON.stringify(nivelServicioNormalizado)}`
        );

        if (!esNivelServicioValido(nivel_servicio)) {
            await connection.rollback();
            return res.status(400).json({
                status: 'fail',
                message: `Nivel de servicio invalido: ${nivel_servicio}`
            });
        }

        const [tiposVehiculo] = await connection.execute(
            'SELECT id_tipo FROM tipo_vehiculo WHERE UPPER(TRIM(nombre)) = ? LIMIT 1',
            [tipoNormalizado]
        );

        if (tiposVehiculo.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                status: 'fail',
                message: `No existe el tipo de vehiculo: ${tipo}`
            });
        }

        const idTipo = tiposVehiculo[0].id_tipo;

        const [vehiculos] = await connection.execute(
            'SELECT id_vehiculo FROM vehiculo WHERE placa = ? LIMIT 1',
            [placaNormalizada]
        );

        let idVehiculo;

        if (vehiculos.length > 0) {
            idVehiculo = vehiculos[0].id_vehiculo;
            await connection.execute(
                'UPDATE vehiculo SET id_tipo = ? WHERE id_vehiculo = ?',
                [idTipo, idVehiculo]
            );
        } else {
            const [vehiculoCreado] = await connection.execute(
                'INSERT INTO vehiculo (placa, id_tipo) VALUES (?, ?)',
                [placaNormalizada, idTipo]
            );
            idVehiculo = vehiculoCreado.insertId;
        }

        const [clientes] = await connection.execute(
            'SELECT id_cliente FROM cliente WHERE nombre_completo = ? LIMIT 1',
            [propietarioNormalizado]
        );

        let idCliente;

        if (clientes.length > 0) {
            idCliente = clientes[0].id_cliente;
            await connection.execute(
                'UPDATE cliente SET telefono = ? WHERE id_cliente = ?',
                [telefonoNormalizado, idCliente]
            );
        } else {
            const documentoTemporal = `SIN-DOC-${placaNormalizada}-${Date.now()}`;
            const [clienteCreado] = await connection.execute(
                'INSERT INTO cliente (nombre_completo, documento, telefono) VALUES (?, ?, ?)',
                [propietarioNormalizado, documentoTemporal, telefonoNormalizado]
            );
            idCliente = clienteCreado.insertId;
        }

        await connection.execute(
            `
                UPDATE mensualidad
                SET
                    id_cliente = ?,
                    id_vehiculo = ?,
                    fecha_inicio = ?,
                    fecha_fin = ?,
                    nivel_servicio = ?,
                    valor = ?
                WHERE id_mensualidad = ?
            `,
            [idCliente, idVehiculo, fecha_inicio, fecha_fin, nivelServicioNormalizado, valor, id]
        );

        await connection.commit();

        return res.status(200).json({
            status: 'success',
            message: 'Mensualidad actualizada correctamente',
            data: {
                id_mensualidad: Number(id),
                id_cliente: idCliente,
                id_vehiculo: idVehiculo,
                nivel_servicio: nivelServicioNormalizado
            }
        });
    } catch (err) {
        await connection.rollback();
        console.error('Error al actualizar mensualidad:', {
            message: err.message,
            code: err.code,
            sqlMessage: err.sqlMessage,
            stack: err.stack
        });

        if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({
                status: 'fail',
                message: 'Referencia de clave foránea inválida. Verifica los IDs relacionados.',
                error: err.sqlMessage || err.message
            });
        }

        return res.status(500).json({
            status: 'fail',
            message: 'Error al actualizar la mensualidad',
            error: err.message
        });
    } finally {
        connection.release();
    }
};

const eliminarMensualidad = async (req, res) => {
    const { id } = req.params;

    try {
        const [resultado] = await db.execute(
            'DELETE FROM mensualidad WHERE id_mensualidad = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'Mensualidad no encontrada'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Mensualidad eliminada correctamente'
        });
    } catch (err) {
        console.error('Error al eliminar mensualidad:', {
            message: err.message,
            code: err.code,
            sqlMessage: err.sqlMessage,
            stack: err.stack
        });
        return res.status(500).json({
            status: 'fail',
            message: 'Error al eliminar la mensualidad',
            error: err.message
        });
    }
};

const verificarMensualidad = async (req, res) => {
    try {
        const placa = String(req.params.placa || '').trim().toUpperCase();

        if (!placa) {
            return res.status(400).json({
                success: false,
                message: 'La placa es requerida'
            });
        }

        const [rows] = await db.execute(
            `
                SELECT
                    m.id_mensualidad,
                    m.nivel_servicio,
                    m.fecha_inicio,
                    m.fecha_fin,
                    v.id_tipo AS id_tipo,
                    tv.nombre AS tipo_vehiculo
                FROM mensualidad m
                INNER JOIN vehiculo v ON m.id_vehiculo = v.id_vehiculo
                INNER JOIN tipo_vehiculo tv ON v.id_tipo = tv.id_tipo
                WHERE UPPER(TRIM(v.placa)) = ?
                  AND m.estado = 'ACTIVA'
                  AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin
                ORDER BY m.fecha_fin DESC
                LIMIT 1
            `,
            [placa]
        );

        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                tieneMensualidad: false
            });
        }

        const mensualidad = rows[0];

        return res.status(200).json({
            success: true,
            tieneMensualidad: true,
            tipo_vehiculo: mensualidad.tipo_vehiculo,
            nivel_servicio: mensualidad.nivel_servicio,
            fecha_inicio: mensualidad.fecha_inicio,
            fecha_fin: mensualidad.fecha_fin
        });
    } catch (error) {
        console.error('Error verificando mensualidad:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            message: 'Error interno al verificar mensualidad',
            error: error.message
        });
    }
};

module.exports = {
    obtenerMensualidades,
    crearMensualidad,
    actualizarMensualidad,
    eliminarMensualidad,
    verificarMensualidad
};
