const z = require('zod');

const telefoneRegex = /^[0-9+\s]{7,20}$/;
const placaRegex = /^[A-Z0-9-]{4,12}$/;

const mensualidadSchema = z.object({
  placa: z.string().trim().regex(placaRegex, 'Formato de placa inválido'),
  tipo: z.string().trim().min(3, 'El tipo de vehículo es requerido').max(80, 'El tipo de vehículo no puede ser tan largo'),
  nivel_servicio: z.string().trim().min(3, 'El nivel de servicio es requerido').max(80, 'El nivel de servicio no puede ser tan largo'),
  propietario: z.string().trim().min(3, 'El propietario es requerido').max(100, 'El nombre del propietario es muy largo'),
  telefono: z.string().trim().regex(telefoneRegex, 'Teléfono inválido'),
  fecha_inicio: z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), 'fecha_inicio inválida'),
  fecha_fin: z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), 'fecha_fin inválida'),
  valor: z.number().min(0, 'El valor debe ser mayor o igual a 0')
});

const validateMensualidad = (data) => mensualidadSchema.safeParse(data);

module.exports = { validateMensualidad };
