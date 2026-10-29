const express = require('express');
const router = express.Router();
const partnersController = require('./partners.controller');

// Rute dasar placeholder modul partners
router.get('/', (req, res) => partnersController.index(req, res));

module.exports = router;
