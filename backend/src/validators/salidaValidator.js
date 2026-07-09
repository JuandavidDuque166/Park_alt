const z = require('zod');

const salidaSchema = z.object({
  id_ingreso: z.number().int().positive('El id_ingreso debe ser un número entero positivo'),
  metodo_pago: z.string().trim().optional()
});

const validateSalida = (data) => salidaSchema.safeParse(data);

module.exports = { validateSalida };
