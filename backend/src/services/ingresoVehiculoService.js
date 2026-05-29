const IngresoModel = require('../models/ingresoVehiculoModel');

class IngresoVehiculoService {
  static async procesarIngreso(datosIngreso, archivoFoto) {
    // Estos nombres de variables asumen lo que viene de req.body en el Controlador
    const { placa, idTipo, idEspacio, idUsuario } = datosIngreso;

    // 1. Verificar si el vehículo existe en la DB; si no, crearlo.
    let vehiculo = await IngresoVehiculoModel.buscarVehiculo(placa);
    let idVehiculo;

    if (vehiculo) {
      idVehiculo = vehiculo.id_vehiculo;
    } else {
      idVehiculo = await IngresoVehiculoModel.registrarVehiculoNuevo(placa, idTipo);
    }

    // 2. Validar si el vehículo ya está adentro (control_i_s sin fecha_hora_salida)
    const estaAdentro = await IngresoVehiculoModel.verificarVehiculoDentro(idVehiculo);
    if (estaAdentro) {
      throw new Error(`El vehículo con placa ${placa} ya se encuentra ocupando un espacio en el parqueadero.`);
    }

    // 3. Construir la URL de la foto (si se subió una con multer)
    let urlImagen = null;
    if (archivoFoto) {
      urlImagen = `/uploads/${archivoFoto.filename}`; // Se guardará en url_imagen
    }

    // 4. Registrar en control_i_s y ocupar el espacio
    const idIngreso = await IngresoVehiculoModel.registrarIngreso({
      idVehiculo,
      idEspacio,
      idUsuario, // El ID del operario que está en turno haciendo el registro
      urlImagen
    });

    return {
      idIngreso,
      placa,
      mensaje: "Ingreso registrado exitosamente",
      urlImagen
    };
  }
}

module.exports = IngresoVehiculoService;