const express = require('express');
const router = express.Router();
const c = require('./workshops.controller');
const v = require('./workshops.validation');
const { validate } = require('../../middlewares/validation.middleware');
const { authenticate, optionalAuth } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { asyncHandler } = require('../../utils/http.util');

// Katalog publik; bila login, data disesuaikan dengan role (mitra hanya kegiatannya, peserta + status pendaftaran)
router.get('/', optionalAuth, asyncHandler(c.list));
router.get('/:id/calendar.ics', optionalAuth, asyncHandler(c.calendar));
router.get('/:id', optionalAuth, asyncHandler(c.detail));

router.post('/', authenticate, authorizeRoles('humas'), validate(v.create), asyncHandler(c.create));
router.put('/:id', authenticate, authorizeRoles('humas'), asyncHandler(c.update));
router.patch('/:id/status', authenticate, authorizeRoles('humas'), asyncHandler(c.updateStatus));
router.delete('/:id', authenticate, authorizeRoles('humas'), asyncHandler(c.remove));

module.exports = router;
