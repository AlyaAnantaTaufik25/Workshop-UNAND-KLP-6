const express = require('express');
const router = express.Router();
const locationsController = require('./locations.controller');

// Rute dasar placeholder modul locations
router.get('/', (req, res) => locationsController.index(req, res));

module.exports = router;
