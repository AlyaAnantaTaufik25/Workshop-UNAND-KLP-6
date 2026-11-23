const express = require('express');
const router = express.Router();
const c = require('./locations.controller');
const v = require('./locations.validation');
const { validate } = require('../../middlewares/validation.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { asyncHandler } = require('../../utils/http.util');

router.get('/', asyncHandler(c.list));
router.get('/:id', asyncHandler(c.get));
router.post('/', authenticate, authorizeRoles('humas'), validate(v.create), asyncHandler(c.create));
router.put('/:id', authenticate, authorizeRoles('humas'), asyncHandler(c.update));
router.delete('/:id', authenticate, authorizeRoles('humas'), asyncHandler(c.remove));

module.exports = router;
