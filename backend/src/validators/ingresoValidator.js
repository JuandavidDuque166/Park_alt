const z = require('zod');

const ingresoSchema = z.object({
  placa: z.string().min(4, 'La placa debe tener al menos 4 caracteres').max(12, 'La placa no puede exceder 12 caracteres').regex(/^[A-Z0-9-]+$/i, 'Formato de placa inválido'),
  id_tipo: z.number().int().positive('El tipo de vehículo debe ser un número positivo'),
  nivel: z.string().min(3, 'El nivel es requerido').max(80, 'El nivel no puede exceder 80 caracteres')
});

const placaImangeSchema = z.object({
  placa: z.string().min(4, 'La placa debe tener al menos 4 caracteres').max(12, 'La placa no puede exceder 12 caracteres').regex(/^[A-Z0-9-]+$/i, 'Formato de placa inválido')
});

const validateIngreso = (data) => ingresoSchema.safeParse(data);
const validatePlaca = (data) => placaImangeSchema.safeParse(data);

module.exports = { validateIngreso, validatePlaca };
