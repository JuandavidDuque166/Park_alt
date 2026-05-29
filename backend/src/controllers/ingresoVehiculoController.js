const IngresoService = require('../services/ingresoVehiculoService');

class IngresoVehiculoController {
  static async registrar(req, res, next) {
    try {
      // 1. Extraemos los datos exactos que requiere nuestro nuevo script SQL
      const { placa, idTipo, idEspacio, idUsuario } = req.body;
      const archivoFoto = req.file;

      // 2. Validación actualizada: Verificamos que lleguen las llaves foráneas necesarias
      if (!placa || !idTipo || !idEspacio || !idUsuario) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos obligatorios (placa, idTipo, idEspacio, idUsuario)'
        });
      }

      // 3. Llamar al servicio asegurando que los IDs sean números y la placa mayúscula
      const resultado = await IngresoService.procesarIngreso(
        { 
          placa: placa.trim().toUpperCase(), 
          idTipo: parseInt(idTipo, 10), 
          idEspacio: parseInt(idEspacio, 10), 
          idUsuario: parseInt(idUsuario, 10) 
        }, 
        archivoFoto
      );

      // 4. Respuesta exitosa (201 Created)
      res.status(201).json({
        success: true,
        data: resultado
      });

    } catch (error) {
      // Manejo del error específico de negocio (Ej: Vehículo ya adentro)
      if (error.message.includes('ya se encuentra ocupando')) {
         return res.status(409).json({ 
           success: false, 
           error: error.message 
         });
      }
      
      // Si es un error de base de datos o servidor, pasa al middleware global
      next(error); 
    }
  }
}

module.exports = IngresoVehiculoController;