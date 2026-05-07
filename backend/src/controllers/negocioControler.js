const NegocioService = require('../services/negocioService');
const catchAsync = require('../errors/catchAsync');
const httpStatus = require('../constants/httpStatus');
const { createNegocioSchema, updateNegocioSchema } = require('../validators/negocioValidator');

exports.getAllNegocios = catchAsync(async (req, res, next) => {
    const negocios = await NegocioService.getAllNegocios();

    res.status(httpStatus.OK).json({
        status: 'success',
        results: negocios.length,
        data: negocios
    });
});

exports.getNegocioById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const negocio = await NegocioService.getNegocioById(id);

    res.status(httpStatus.OK).json({
        status: 'success',
        data: negocio
    });
});

exports.createNegocio = catchAsync(async (req, res, next) => {
    // Validar datos con Zod
    const validatedData = createNegocioSchema.parse(req.body);
    const negocio = await NegocioService.createNegocio(validatedData);

    res.status(httpStatus.CREATED).json({
        status: 'success',
        data: negocio
    });
});

exports.updateNegocio = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // Validar datos con Zod
    const validatedData = updateNegocioSchema.parse(req.body);
    await NegocioService.updateNegocio(id, validatedData);

    res.status(httpStatus.OK).json({
        status: 'success',
        message: 'Negocio actualizado correctamente'
    });
});