const express = require('express');
const cors = require('cors');
const config = require('./config/app.config');
const apiRoutes = require('./routes/api.routes');
const notFoundHandler = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

// Middleware: CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (seperti Postman, curl, mobile apps)
      if (!origin) return callback(null, true);

      // Cek apakah origin ada di daftar yang diizinkan atau mode development
      if (config.cors.origin.includes(origin) || config.app.env === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Akses diblokir oleh kebijakan CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware: Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root info route
app.get('/', (req, res) => {
  res.json({
    name: 'SIM Workshop Universitas Andalas (UNAND) API',
    version: '1.0.0',
    documentation: '/docs',
    healthCheck: `${config.app.apiPrefix}/health`,
  });
});

// Registrasi API Routes dengan prefix /api/v1
app.use(config.app.apiPrefix, apiRoutes);

// Middleware: 404 Not Found Handler
app.use(notFoundHandler);

// Middleware: Centralized Error Handler
app.use(errorHandler);

module.exports = app;

