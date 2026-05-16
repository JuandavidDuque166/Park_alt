const z = require('zod');

// Regla de validacion para el registro
const registerSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: z.string().email('Formato de correo invalido'),
    clave: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
    id_rol: z.number().int().positive()
});

const validateRegister = (data) => {
    return registerSchema.safeParse(data);
};

// Regla de validacion para el login.
// Acepta los nombres antiguos del backend y los nombres reales de la tabla usuario.
const loginSchema = z.object({
    email: z.string().optional(),
    nombre: z.string().optional(),
    usuario: z.string().optional(),
    clave: z.string().optional(),
    contrasena: z.string().optional(),
    password: z.string().optional()
}).superRefine((data, ctx) => {
    const login = data.email || data.nombre || data.usuario;
    const clave = data.clave || data.contrasena || data.password;

    if (!login || login.trim() === '') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El nombre de usuario es requerido'
        });
    }

    if (!clave || clave.trim() === '') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'La contrasena es requerida'
        });
    }
}).transform((data) => ({
    login: (data.email || data.nombre || data.usuario).trim(),
    clave: (data.clave || data.contrasena || data.password).trim()
}));

const validateLogin = (data) => {
    return loginSchema.safeParse(data);
};

module.exports = { validateRegister, validateLogin };
