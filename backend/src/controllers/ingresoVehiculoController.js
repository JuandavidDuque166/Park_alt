const IngresoService = require('../services/ingresoVehiculoService');
const AIService = require('../services/aiService'); // <-- ¡ESTA ES LA LÍNEA QUE FALTA, MANITO!

class IngresoVehiculoController {
    static async registrar(req, res, next) {
        try {
            // Recibimos 'nivel' desde el cliente
            const { placa, id_tipo, nivel } = req.body;
            const archivoFoto = req.file;
            
            // Si tu middleware de autenticación inyecta al usuario en req.user:
            const idUsuario = req.user?.id_usuario || req.body.idUsuario;

            if (!placa || !id_tipo || !nivel) {
                return res.status(400).json({
                    success: false,
                    error: 'Faltan datos obligatorios (placa, id_tipo, nivel)'
                });
            }

            const resultado = await IngresoService.procesarIngreso(
                { 
                    placa: placa.trim().toUpperCase(), 
                    id_tipo: parseInt(id_tipo, 10),
                    nivel: nivel,
                    idUsuario: idUsuario
                }, 
                archivoFoto
            );

            res.status(201).json({
                success: true,
                data: resultado
            });
        } catch (error) {
            if (error.message.includes('ya se encuentra ocupando') || error.message.includes('No hay espacios')) {
                return res.status(409).json({ 
                    success: false, 
                    error: error.message 
                });
            }
            next(error); 
        }
    }

static async leerPlaca(req, res, next) {
    try {
        const archivoImagen = req.file;
        if (!archivoImagen) {
            return res.status(400).json({ success: false, error: 'No se recibió imagen' });
        }

        const placaDetectada = await AIService.reconocerPlaca(archivoImagen.path);

        if (placaDetectada) {
            return res.status(200).json({ success: true, placa: placaDetectada });
        } else {
            return res.status(200).json({ 
                success: false, 
                error: 'No se detectó ninguna placa en la imagen. Intente enfocar mejor.' 
            });
        }
    } catch (error) {
        console.error("Error en el controlador leerPlaca:", error);
        res.status(500).json({ success: false, error: 'Error interno en el servidor.' });
    }
}

    // Nuevo método para consultar cupos desde el Front
    static async obtenerCupos(req, res, next) {
        try {
            const cupos = await IngresoService.obtenerCupos();
            res.status(200).json({ success: true, ...cupos });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = IngresoVehiculoController;