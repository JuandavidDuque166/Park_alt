const { z } = require('zod');

// Schema para validar redes sociales (objeto JSON)
const redesSocialesSchema = z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal(''))
}).optional();

// Schema para crear negocio
exports.createNegocioSchema = z.object({
    razon_social: z.string().min(3, 'La razón social debe tener al menos 3 caracteres'),
    logo_url: z.string().optional(),
    descripcion: z.string().optional(),
    telefono: z.string().max(20).optional(),
    email: z.string().email('Formato de email inválido').optional(),
    direccion: z.string().max(255).optional(),
    redes_sociales: redesSocialesSchema
});

// Schema para actualizar negocio (todos los campos opcionales)
exports.updateNegocioSchema = z.object({
    razon_social: z.string().min(3, 'La razón social debe tener al menos 3 caracteres').optional(),
    logo_url: z.string().optional(),
    descripcion: z.string().optional(),
    telefono: z.string().max(20).optional(),
    email: z.string().email('Formato de email inválido').optional(),
    direccion: z.string().max(255).optional(),
    redes_sociales: redesSocialesSchema
});