const NegocioModel = require('../models/negocioModel');
const AppError = require('../errors/AppError');
const httpStatus = require('../constants/httpStatus');

const NegocioService = {
    async getAllNegocios() {
        const negocios = await NegocioModel.findAll();
        return negocios;
    },

    async getNegocioById(id) {
        const negocio = await NegocioModel.findById(id);

        if (!negocio) {
            throw new AppError('Negocio no encontrado', httpStatus.NOT_FOUND);
        }

        return negocio;
    },

    async createNegocio(negocioData) {
        // Validar email único si se proporciona
        if (negocioData.email) {
            const negocios = await NegocioModel.findAll();
            const emailExists = negocios.some(n => n.email === negocioData.email);
            if (emailExists) {
                throw new AppError('El email ya está registrado', httpStatus.BAD_REQUEST);
            }
        }

        const negocioId = await NegocioModel.create(negocioData);
        return { id_negocio: negocioId, ...negocioData };
    },

    async updateNegocio(id, negocioData) {
        // Verificar si existe
        const negocioExists = await NegocioModel.findById(id);
        if (!negocioExists) {
            throw new AppError('Negocio no encontrado', httpStatus.NOT_FOUND);
        }

        // Validar email único si se está cambiando
        if (negocioData.email && negocioData.email !== negocioExists.email) {
            const negocios = await NegocioModel.findAll();
            const emailExists = negocios.some(n => n.email === negocioData.email && n.id_negocio !== id);
            if (emailExists) {
                throw new AppError('El email ya está registrado', httpStatus.BAD_REQUEST);
            }
        }

        const affectedRows = await NegocioModel.update(id, negocioData);
        return affectedRows > 0;
    }
};

module.exports = NegocioService;