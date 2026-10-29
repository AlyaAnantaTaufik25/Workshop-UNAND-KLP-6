const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// Rute dasar placeholder modul auth
router.get('/', (req, res) => authController.index(req, res));

module.exports = router;
