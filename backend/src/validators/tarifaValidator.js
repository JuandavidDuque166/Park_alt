const z = require('zod');

const tarifaSchema = z.object({
  id_tipo: z.number().int().positive('El ID del tipo de vehículo debe ser un número positivo.'),
  valor_hora: z.number().min(0, 'valor_hora debe ser un número mayor o igual a 0'),
  valor_fraccion: z.number().min(0, 'valor_fraccion debe ser un número mayor o igual a 0'),
  valor_dia: z.number().min(0, 'valor_dia debe ser un número mayor o igual a 0'),
  valor_mensual: z.number().min(0, 'valor_mensual debe ser un número mayor o igual a 0')
});

const validateTarifa = (data) => tarifaSchema.safeParse(data);

module.exports = { validateTarifa };
