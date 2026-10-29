const express = require('express');
const router = express.Router();
const { successResponse } = require('../utils/response.util');
const { pool } = require('../config/database');
const config = require('../config/app.config');

// Import modular routes
const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const rolesRoutes = require('../modules/roles/roles.routes');
const workshopsRoutes = require('../modules/workshops/workshops.routes');
const registrationsRoutes = require('../modules/registrations/registrations.routes');
const attendanceRoutes = require('../modules/attendance/attendance.routes');
const partnersRoutes = require('../modules/partners/partners.routes');
const locationsRoutes = require('../modules/locations/locations.routes');
const certificatesRoutes = require('../modules/certificates/certificates.routes');
const reportsRoutes = require('../modules/reports/reports.routes');

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint untuk memverifikasi kesiapan server dan database
 * @access  Public [ACTIVE]
 */
router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbMessage = 'Database belum terhubung atau service MySQL belum aktif';

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    dbStatus = 'connected';
    dbMessage = 'Koneksi ke MySQL aktif';
  } catch (error) {
    dbStatus = 'unreachable';
    dbMessage = error.message;
  }

  return successResponse(res, 'Sistem Informasi Manajemen Workshop UNAND API siap beroperasi', {
    app: 'SIM Workshop UNAND API',
    version: '1.0.0',
    status: 'healthy',
    environment: config.app.env,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      message: dbMessage,
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
    },
  });
});

// Pendaftaran rute modul fitur utama
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);
router.use('/workshops', workshopsRoutes);
router.use('/registrations', registrationsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/partners', partnersRoutes);
router.use('/locations', locationsRoutes);
router.use('/certificates', certificatesRoutes);
router.use('/reports', reportsRoutes);

module.exports = router;

