const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');

// Rute dasar placeholder modul users
router.get('/', (req, res) => usersController.index(req, res));

module.exports = router;
