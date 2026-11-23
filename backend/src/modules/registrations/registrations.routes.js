const express = require('express');
const router = express.Router();
const c = require('./registrations.controller');
const v = require('./registrations.validation');
const { validate } = require('../../middlewares/validation.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { asyncHandler } = require('../../utils/http.util');

router.use(authenticate);

router.post('/', authorizeRoles('peserta'), validate(v.register), asyncHandler(c.register));
router.get('/my', authorizeRoles('peserta'), asyncHandler(c.my));
router.patch('/:id/cancel', authorizeRoles('peserta', 'humas'), asyncHandler(c.cancel));

router.get('/', authorizeRoles('humas', 'mitra', 'sekretariat', 'rektor'), asyncHandler(c.list));
router.get('/workshop/:workshopId', authorizeRoles('humas', 'mitra', 'sekretariat', 'rektor'), asyncHandler(c.byWorkshop));

module.exports = router;
