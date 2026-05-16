const ParqueaderoModel = require('../models/parqueaderoModel');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');

const NegocioService = {
        async getAllNegocios() {
        return ParqueaderoModel.findAll();
    },

    async getNegocioById(id) {
        const parqueadero = await ParqueaderoModel.findById(id);

        if (!parqueadero) {
        throw new AppError('Parqueadero no encontrado', httpStatus.NOT_FOUND);
        }

        return parqueadero;
    },

    async createNegocio(negocioData) {
        if (negocioData.email) {
        const parqueaderos = await ParqueaderoModel.findAll();
        const emailExists = parqueaderos.some((p) => p.email === negocioData.email);
        if (emailExists) {
            throw new AppError('El email ya está registrado', httpStatus.BAD_REQUEST);
        }
        }

        const parqueaderoId = await ParqueaderoModel.create(negocioData);
        return { id_parqueadero: parqueaderoId, ...negocioData };
    },

    async updateNegocio(id, negocioData) {
        const parqueaderoExistente = await ParqueaderoModel.findById(id);
        if (!parqueaderoExistente) {
        throw new AppError('Parqueadero no encontrado', httpStatus.NOT_FOUND);
        }

        if (negocioData.email && negocioData.email !== parqueaderoExistente.email) {
        const parqueaderos = await ParqueaderoModel.findAll();
        const emailExists = parqueaderos.some(
            (p) => p.email === negocioData.email && p.id_parqueadero !== Number(id)
        );
        if (emailExists) {
            throw new AppError('El email ya está registrado', httpStatus.BAD_REQUEST);
        }
        }

        const affectedRows = await ParqueaderoModel.update(id, negocioData);
        return affectedRows > 0;
    }
    };

module.exports = NegocioService;
