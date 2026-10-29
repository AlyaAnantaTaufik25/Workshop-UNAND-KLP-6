const express = require('express');
const router = express.Router();
const workshopsController = require('./workshops.controller');

// Rute dasar placeholder modul workshops
router.get('/', (req, res) => workshopsController.index(req, res));

module.exports = router;
