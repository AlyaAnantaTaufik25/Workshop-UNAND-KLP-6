const express = require('express');
const router = express.Router();
const registrationsController = require('./registrations.controller');

// Rute dasar placeholder modul registrations
router.get('/', (req, res) => registrationsController.index(req, res));

module.exports = router;
