const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');

// Rute dasar placeholder modul attendance
router.get('/', (req, res) => attendanceController.index(req, res));

module.exports = router;
