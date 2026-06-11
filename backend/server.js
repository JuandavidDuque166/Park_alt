require('dotenv').config(); // 1. Cargar variables de entorno lo antes posible

console.log('=== INICIANDO SERVIDOR ===');
console.log(`Tiempo: ${new Date().toLocaleString()}`);
console.log(`Node env: ${process.env.NODE_ENV || 'development'}`);

// Manejo de errores síncronos no capturados (ej: variable no definida)
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION! Apagando servidor...');
    console.error(err.name, err.message);
    process.exit(1); // Salida forzada
});

const app = require('./src/app'); // Importamos la app configurada desde src
const pool = require('./src/config/conexion_db'); // Importamos la DB para probar conexión
const tarifasRoutes = require('./src/routes/tarifasRoutes.js'); // Importamos las rutas de tarifas
const PORT = process.env.PORT || 3000;

// 2. Función para iniciar el servidor
const startServer = async () => {
    try {
        console.log('\n🔗 Verificando conexión a Base de Datos...');
        // 3. Verificar conexión a DB antes de levantar el servidor
        // Hacemos una consulta ligera ('SELECT 1') para asegurar que hay conexión
        await pool.query('SELECT 1');
        console.log('✅ Conexión a Base de Datos MySQL exitosa\n');

        const server = app.listen(PORT, () => {
            console.log('========================================');
            console.log(`✅ SERVIDOR INICIADO CORRECTAMENTE`);
            console.log(`📡 Puerto: ${PORT}`);
            console.log(`🌐 URL local: http://localhost:${PORT}`);
            console.log(`🌐 URL API: http://localhost:${PORT}/api`);
            console.log(`👀 CORS habilitado para: http://localhost:5173`);
            console.log('========================================\n');
            console.log('✨ Esperando peticiones...\n');
        });

        // Manejo de promesas rechazadas no controladas (ej: fallo de conexión a DB en tiempo de ejecución)
        process.on('unhandledRejection', (err) => {
            console.error('❌ UNHANDLED REJECTION! Apagando servidor...');
            console.error(err.name, err.message);
            // Cerramos el servidor amablemente antes de salir
            server.close(() => {
                process.exit(1);
            });
        });

    } catch (error) {
        console.error('❌ Error al conectar con la Base de Datos:');
        console.error(error.message);
        console.error('\n📋 Verifica:');
        console.error('   1. MySQL está corriendo');
        console.error('   2. Las credenciales en .env son correctas');
        console.error('   3. La base de datos existe\n');
        process.exit(1); // Si no hay DB, matamos el proceso
    }
};

startServer();