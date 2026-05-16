const catchAsync = require('../errors/catchAsync');
const AppError = require('../errors/appError');
const httpStatus = require('../constants/httpStatus');

/**
 * Controlador para subir imagenes
 * Multer procesa el archivo antes de llegar aqui
 */
exports.uploadImage = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('No se ha subido ningún archivo', httpStatus.BAD_REQUEST));
    }

    //construir URL completa del archivo
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(httpStatus.OK).json({
        status: 'success',
        data: {
            filename: req.file.filename,
            url: imageUrl,
            size: req.file.size
        }
    });
});