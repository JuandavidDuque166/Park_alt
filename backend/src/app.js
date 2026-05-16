const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const AppError = require('./errors/AppError');
const globalErrorHandler = require('./middlewares/errorHandler');

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
const roleRoutes = require('./routes/roleRoutes');
const permisoRoutes = require('./routes/permisoRoutes');
const negocioRoutes = require('./routes/negocioRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Rutas de autenticación y usuarios
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/negocios', negocioRoutes);
app.use('/api/upload', uploadRoutes);

// Manejo de rutas no encontradas (404)
app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`No se pudo encontrar ${req.originalUrl} en este servidor`, 404));
});

// Middleware Global de Errores
app.use(globalErrorHandler);

module.exports = app;