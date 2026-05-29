const db = require('../config/conexion_db'); 

class IngresoVehiculoModel {
  // 1. Buscar si el vehículo ya está registrado en la base de datos
  static async buscarVehiculo(placa) {
    const [rows] = await db.query(
      'SELECT id_vehiculo FROM vehiculo WHERE placa = ?',
      [placa]
    );
    return rows[0]; // Retorna el vehículo o undefined
  }

  // 2. Registrar un vehículo nuevo si es su primera vez
  static async registrarVehiculoNuevo(placa, idTipo) {
    const [result] = await db.query(
      'INSERT INTO vehiculo (placa, id_tipo) VALUES (?, ?)',
      [placa, idTipo]
    );
    return result.insertId;
  }

  // 3. Verificar si el vehículo ya está adentro (fecha_hora_salida es NULL)
  static async verificarVehiculoDentro(idVehiculo) {
    const [rows] = await db.query(
      'SELECT id_ingreso FROM control_i_s WHERE id_vehiculo = ? AND fecha_hora_salida IS NULL',
      [idVehiculo]
    );
    return rows.length > 0;
  }

  // 4. Registrar el ingreso y actualizar el estado del espacio
  static async registrarIngreso(data) {
    const { idVehiculo, idEspacio, idUsuario, urlImagen } = data;
    
    // Obtenemos una conexión para manejar una transacción (opcional pero recomendado)
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Insertar en control_i_s
      const [result] = await connection.query(
        `INSERT INTO control_i_s (fecha_hora_entrada, url_imagen, id_vehiculo, id_espacio, id_usuario) 
         VALUES (NOW(), ?, ?, ?, ?)`,
        [urlImagen, idVehiculo, idEspacio, idUsuario]
      );

      // Actualizar el espacio a OCUPADO
      await connection.query(
        `UPDATE espacio SET estado = 'OCUPADO' WHERE id_espacio = ?`,
        [idEspacio]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = IngresoVehiculoModel;