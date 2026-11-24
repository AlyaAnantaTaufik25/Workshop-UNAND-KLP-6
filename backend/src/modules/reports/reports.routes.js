const express = require('express');
const router = express.Router();
const c = require('./reports.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { asyncHandler } = require('../../utils/http.util');

router.use(authenticate, authorizeRoles('humas', 'rektor', 'sekretariat', 'mitra'));

router.get('/dashboard', asyncHandler(c.dashboard));
router.get('/summary', asyncHandler(c.summary));
router.get('/workshops', asyncHandler(c.workshops));
router.get('/daily', asyncHandler(c.daily));
router.get('/workshops/:id/export', asyncHandler(c.exportWorkshop));

module.exports = router;
