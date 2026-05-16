const z = require ('zod');

//Regla de validación para el registro
const registerSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: z.string().email('Formato de correo invalido'),
    clave: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    //Asumimos que el frontend envia el ID del rol(ej: 2 para usuario normal)
    id_rol: z.number().int().positive()
});
const validateRegister = (data) => {
    return registerSchema.safeParse(data);
};

//Regla de validación para el login
const loginSchema = z.object({
    email: z.string().email('Formato de correo invalido'),
    clave: z.string().min(1, 'La contraseña es requerida')
});
const validateLogin = (data) => {
    return loginSchema.safeParse(data);
};
//Exportamos las funciones de validación
module.exports = {validateRegister, validateLogin};