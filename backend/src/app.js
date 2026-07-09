const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const AppError = require('./errors/AppError');
const globalErrorHandler = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');
const sanitizeInput = require('./middlewares/sanitizationMiddleware');
const logger = require('./utils/logger');

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(sanitizeInput);

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:4200', 'http://localhost:5173'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.noSniff());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
app.use(helmet.crossOriginResourcePolicy({ policy: 'same-origin' }));
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", 'http://localhost:3000'],
        imgSrc: ["'self'", 'data:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"]
    }
}));

// Limitar la API general para evitar abuso
app.use('/api', apiLimiter);

app.use((req, res, next) => {
    logger.logInfo(`${req.method} ${req.originalUrl} - ${req.ip}`);
    next();
});

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    index: false,
    dotfiles: 'deny',
    maxAge: '1d'
}));

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
const controlRoutes = require('./routes/controlRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

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
app.use('/api/control', controlRoutes);
app.use('/api/reportes', reporteRoutes);

// Manejo de rutas no encontradas (404)
app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`No se pudo encontrar ${req.originalUrl} en este servidor`, 404));
});

// Middleware Global de Errores
app.use(globalErrorHandler);

module.exports = app;