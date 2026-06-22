const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const AppError = require('./errors/AppError');
const globalErrorHandler = require('./middlewares/errorHandler');
const IngresoController = require('./controllers/ingresoVehiculoController');
const upload = require('./middlewares/uploadMiddleware');

const app = express();

// Configurar CORS para permitir acceso desde Angular y React
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configurar Helmet con políticas relajadas para desarrollo
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Desactivar CSP en desarrollo para evitar bloqueos
}));

app.use(express.json());

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/rolesRoutes');
const permisoRoutes = require('./routes/permisosRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const tarifasRoutes = require('./routes/tarifasRoutes');
const mensualidadesRoutes = require('./routes/mensualidadesRoutes');
const ingresoVehiculoRoutes = require('./routes/ingresoVehiculoRoutes');
const salidaVehiculoRoutes = require('./routes/salidaVehiculoRoutes');

// Rutas de autenticación y usuarios
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ingresos', ingresoVehiculoRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tarifas', tarifasRoutes);
app.use('/api', mensualidadesRoutes);
app.use('/api/salidas', salidaVehiculoRoutes);

// Manejo de rutas no encontradas (404)
app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`No se pudo encontrar ${req.originalUrl} en este servidor`, 404));
});

// Middleware Global de Errores
app.use(globalErrorHandler);

module.exports = app;