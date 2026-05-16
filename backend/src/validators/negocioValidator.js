const { z } = require('zod');

const capacidadSchema = z.number().int().nonnegative();
const horaSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Hora inválida (HH:mm o HH:mm:ss)');

exports.createNegocioSchema = z
    .object({
    nombre_parqueadero: z.string().min(3, 'El nombre del parqueadero debe tener al menos 3 caracteres'),
    logo_url: z.string().url('logo_url debe ser una URL válida').optional().or(z.literal('')),
    direccion: z.string().min(5).max(255),
    telefono: z.string().max(20),
    email: z.string().email('Formato de email inválido'),
    nit: z.string().min(5).max(30),
    capacidad_total: capacidadSchema,
    capacidad_altura: capacidadSchema,
    capacidad_subterraneo: capacidadSchema,
    hora_apertura: horaSchema,
    hora_cierre: horaSchema
    })
    .refine(
        (data) => data.capacidad_altura + data.capacidad_subterraneo <= data.capacidad_total,
        {
        message: 'La suma de capacidad_altura y capacidad_subterraneo no puede superar capacidad_total',
        path: ['capacidad_total']
        }
    );

// Schema para actualizar negocio (todos los campos opcionales)
exports.updateNegocioSchema = z
    .object({
    nombre_parqueadero: z.string().min(3, 'El nombre del parqueadero debe tener al menos 3 caracteres').optional(),
    logo_url: z.string().url('logo_url debe ser una URL válida').optional().or(z.literal('')),
    direccion: z.string().min(5).max(255).optional(),
    telefono: z.string().max(20).optional(),
    email: z.string().email('Formato de email inválido').optional(),
    nit: z.string().min(5).max(30).optional(),
    capacidad_total: capacidadSchema.optional(),
    capacidad_altura: capacidadSchema.optional(),
    capacidad_subterraneo: capacidadSchema.optional(),
    hora_apertura: horaSchema.optional(),
    hora_cierre: horaSchema.optional()
    })
    .refine(
        (data) => {
        if (
            data.capacidad_total === undefined ||
            data.capacidad_altura === undefined ||
            data.capacidad_subterraneo === undefined
        ) {
            return true;
        }

        return data.capacidad_altura + data.capacidad_subterraneo <= data.capacidad_total;
        },
        {
        message: 'La suma de capacidad_altura y capacidad_subterraneo no puede superar capacidad_total',
        path: ['capacidad_total']
        }
    );
