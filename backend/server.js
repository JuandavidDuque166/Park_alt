require('dotenv').config(); // 1. Cargar variables de entorno lo antes posible

// Manejo de errores síncronos no capturados (ej: variable no definida)
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Apagando servidor...');
    console.error(err.name, err.message);
    process.exit(1); // Salida forzada
});

const app = require('./src/app'); // Importamos la app configurada desde src
const pool = require('./src/config/conexion_db'); // Importamos la DB para probar conexión

const PORT = process.env.PORT || 3000;

// 2. Función para iniciar el servidor
const startServer = async () => {
    try {
        // 3. Verificar conexión a DB antes de levantar el servidor
        // Hacemos una consulta ligera ('SELECT 1') para asegurar que hay conexión
        await pool.query('SELECT 1');
        console.log('Conexión a Base de Datos MySQL exitosa');

        const server = app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
            console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });

        // Manejo de promesas rechazadas no controladas (ej: fallo de conexión a DB en tiempo de ejecución)
        process.on('unhandledRejection', (err) => {
            console.error('UNHANDLED REJECTION! Apagando servidor...');
            console.error(err.name, err.message);
            // Cerramos el servidor amablemente antes de salir
            server.close(() => {
                process.exit(1);
            });
        });

    } catch (error) {
        console.error('Error al conectar con la Base de Datos:', error.message);
        process.exit(1); // Si no hay DB, matamos el proceso
    }
};

startServer();