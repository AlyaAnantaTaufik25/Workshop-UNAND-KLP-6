const express = require('express');
const router = express.Router();
const certificatesController = require('./certificates.controller');

// Rute dasar placeholder modul certificates
router.get('/', (req, res) => certificatesController.index(req, res));

module.exports = router;
