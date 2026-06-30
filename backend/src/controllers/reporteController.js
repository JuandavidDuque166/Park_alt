const ReporteModel = require('../models/reporteModel');

const getReportes = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    const transacciones = await ReporteModel.obtenerTransacciones(fechaInicio, fechaFin);
    
    return res.status(200).json({
      success: true,
      data: transacciones
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener los reportes del parqueadero",
      error: error.message
    });
  }
};

module.exports = {
  getReportes
};