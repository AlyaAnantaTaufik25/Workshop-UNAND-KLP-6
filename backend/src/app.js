const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const config = require('./config/app.config');
const apiRoutes = require('./routes/api.routes');
const notFoundHandler = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');
const { requestContext } = require('./utils/requestContext');
const { UPLOAD_ROOT } = require('./services/storage.service');

const app = express();
const isDev = config.app.env !== 'production';

// Di belakang reverse proxy (nginx/Docker) agar IP klien & cookie Secure terbaca benar
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : process.env.TRUST_PROXY);

/** Origin frontend yang diizinkan (dev: semua localhost) */
const isAllowedOrigin = (origin) =>
  config.cors.origin.includes(origin) || (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));

// Header keamanan (berkas unggahan boleh dimuat dari origin frontend)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS dengan kredensial (cookie sesi)
app.use(
  cors({
    origin: (origin, callback) => {
      // Tanpa origin (Postman, curl, server-ke-server) atau origin terdaftar → izinkan.
      // Origin lain tidak diberi header CORS (browser memblokir); perubahan data ditolak 403 di bawah.
      callback(null, !origin || isAllowedOrigin(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Konteks per-request (IP & perangkat) untuk audit log
app.use(requestContext);

/**
 * Perlindungan CSRF: karena sesi memakai cookie, request yang mengubah data
 * dari situs lain ditolak. Browser selalu mengirim header Origin pada request lintas situs.
 */
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ success: false, message: 'Permintaan lintas situs ditolak', errors: ['CSRF'] });
  }
  return next();
});

// Pembatas laju: lindungi login/registrasi dari tebakan massal & API dari banjir request
const limiter = (max, windowMs, message) => rateLimit({
  windowMs, max, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { success: false, message, errors: ['RATE_LIMIT'] },
});
const prefix = config.app.apiPrefix;
app.use(`${prefix}/auth/login`, limiter(parseInt(process.env.RATE_LIMIT_LOGIN, 10) || (isDev ? 300 : 30), 15 * 60 * 1000, 'Terlalu banyak percobaan masuk dari jaringan ini. Coba lagi dalam 15 menit.'));
app.use(`${prefix}/auth/register`, limiter(isDev ? 100 : 10, 60 * 60 * 1000, 'Terlalu banyak pendaftaran akun dari jaringan ini. Coba lagi nanti.'));
app.use(prefix, limiter(parseInt(process.env.RATE_LIMIT_API, 10) || 1200, 60 * 1000, 'Terlalu banyak permintaan. Coba lagi sebentar lagi.'));

// Berkas unggahan (poster, bukti presensi, tanda tangan, PDF) — disimpan di disk, bukan database
app.use('/uploads', express.static(UPLOAD_ROOT, { maxAge: '7d', fallthrough: false, index: false }));

app.get('/', (req, res) => {
  res.json({
    name: 'SIM Workshop Universitas Andalas (UNAND) API',
    version: '1.1.0',
    healthCheck: `${prefix}/health`,
  });
});

app.use(prefix, apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
