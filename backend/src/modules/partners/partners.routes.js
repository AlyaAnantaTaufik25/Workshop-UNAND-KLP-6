const express = require('express');
const router = express.Router();
const c = require('./partners.controller');
const v = require('./partners.validation');
const { validate } = require('../../middlewares/validation.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { asyncHandler } = require('../../utils/http.util');

router.use(authenticate);

router.get('/', authorizeRoles('humas', 'mitra', 'sekretariat', 'rektor'), asyncHandler(c.list));
router.get('/:id', authorizeRoles('humas', 'mitra'), asyncHandler(c.get));
router.get('/:id/workshops', authorizeRoles('humas', 'mitra'), asyncHandler(c.workshops));
router.post('/', authorizeRoles('humas'), validate(v.create), asyncHandler(c.create));
router.put('/:id', authorizeRoles('humas'), asyncHandler(c.update));
router.delete('/:id', authorizeRoles('humas'), asyncHandler(c.remove));

module.exports = router;
