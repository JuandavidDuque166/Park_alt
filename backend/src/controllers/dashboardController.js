const DashboardService = require('../services/dashboardService');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');

const dashboardController = {
  async getResumen(req, res, next) {
    try {
      console.log('DashboardController.getResumen - petición recibida');
      const resumen = await DashboardService.getResumen();

      res.status(httpStatus.OK).json({
        status: 'success',
        data: resumen
      });
    } catch (error) {
      console.error('DashboardController.getResumen - error:', {
        message: error.message,
        stack: error.stack,
        original: error.original || null
      });
      next(error);
    }
  }
};

module.exports = dashboardController;
