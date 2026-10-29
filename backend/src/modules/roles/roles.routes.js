const express = require('express');
const router = express.Router();
const rolesController = require('./roles.controller');

// Rute dasar placeholder modul roles
router.get('/', (req, res) => rolesController.index(req, res));

module.exports = router;
