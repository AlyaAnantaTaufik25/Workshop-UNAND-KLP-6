const express = require('express');
const router = express.Router();
const c = require('./users.controller');
const v = require('./users.validation');
const { validate } = require('../../middlewares/validation.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { asyncHandler } = require('../../utils/http.util');

router.use(authenticate);

router.get('/', authorizeRoles('humas'), asyncHandler(c.list));
router.post('/', authorizeRoles('humas'), validate(v.create), asyncHandler(c.create));
router.get('/:id', asyncHandler(c.get));
router.put('/:id', asyncHandler(c.update));
router.patch('/:id/status', authorizeRoles('humas'), asyncHandler(c.setStatus));
router.delete('/:id', authorizeRoles('humas'), asyncHandler(c.remove));

module.exports = router;
