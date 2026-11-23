const express = require('express');
const router = express.Router();
const c = require('./roles.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { asyncHandler } = require('../../utils/http.util');

router.get('/', authenticate, authorizeRoles('humas'), asyncHandler(c.list));

module.exports = router;
