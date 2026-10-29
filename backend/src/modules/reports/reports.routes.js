const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');

// Rute dasar placeholder modul reports
router.get('/', (req, res) => reportsController.index(req, res));

module.exports = router;
