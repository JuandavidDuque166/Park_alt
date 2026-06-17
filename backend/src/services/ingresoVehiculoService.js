const IngresoVehiculoModel = require('../models/ingresoVehiculoModel');

class IngresoVehiculoService {
    static async procesarIngreso(datosIngreso, archivoFoto) {
        const { placa, id_tipo, nivel, idUsuario } = datosIngreso;

        let vehiculo = await IngresoVehiculoModel.buscarVehiculo(placa);
        let idVehiculo;

        if (vehiculo) {
            idVehiculo = vehiculo.id_vehiculo;
        } else {
            idVehiculo = await IngresoVehiculoModel.registrarVehiculoNuevo(placa, id_tipo);
        }

        const estaAdentro = await IngresoVehiculoModel.verificarVehiculoDentro(idVehiculo);
        if (estaAdentro) {
            throw new Error(`El vehículo con placa ${placa} ya se encuentra ocupando un espacio en el parqueadero.`);
        }

        let urlImagen = null;
        if (archivoFoto) {
            urlImagen = `/uploads/${archivoFoto.filename}`;
        }

        // Enviamos los nuevos parámetros requeridos
        const resultadoRegistro = await IngresoVehiculoModel.registrarIngreso({
            idVehiculo,
            urlImagen,
            nivel,
            idUsuario
        });

        return {
            idIngreso: resultadoRegistro.idIngreso,
            espacioAsignado: resultadoRegistro.espacioAsignado,
            placa,
            mensaje: "Ingreso registrado exitosamente",
            urlImagen
        };
    }

    static async obtenerCupos() {
        return await IngresoVehiculoModel.obtenerEspaciosDisponibles();
    }
}

module.exports = IngresoVehiculoService;