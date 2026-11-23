const express = require('express');
const router = express.Router();
const c = require('./auth.controller');
const v = require('./auth.validation');
const { validate } = require('../../middlewares/validation.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { asyncHandler } = require('../../utils/http.util');

router.post('/login', validate(v.login), asyncHandler(c.login));
router.post('/register', validate(v.register), asyncHandler(c.register));
router.post('/logout', authenticate, asyncHandler(c.logout));
router.get('/me', authenticate, asyncHandler(c.me));
router.put('/me', authenticate, asyncHandler(c.updateMe));
router.put('/me/password', authenticate, asyncHandler(c.changePassword));

// PIN tanda tangan elektronik (Rektor & Mitra)
router.post('/me/pin/verify', authenticate, authorizeRoles('rektor', 'mitra'), asyncHandler(c.verifyPin));
router.put('/me/pin', authenticate, authorizeRoles('rektor', 'mitra'), asyncHandler(c.changePin));
router.post('/me/pin/reset', authenticate, authorizeRoles('rektor', 'mitra'), asyncHandler(c.resetPin));

module.exports = router;
