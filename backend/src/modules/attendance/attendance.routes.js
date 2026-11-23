const express = require('express');
const router = express.Router();
const c = require('./attendance.controller');
const v = require('./attendance.validation');
const { validate } = require('../../middlewares/validation.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { asyncHandler } = require('../../utils/http.util');

router.use(authenticate);

router.post('/check-in', authorizeRoles('peserta'), validate(v.submit), asyncHandler(c.checkIn));
router.post('/upload', authorizeRoles('peserta'), validate(v.submit), asyncHandler(c.upload));
router.post('/generate-qr', authorizeRoles('humas'), validate(v.submit), asyncHandler(c.generateQr));
router.patch('/:id/verify', authorizeRoles('humas', 'mitra'), asyncHandler(c.verify));
router.get('/workshop/:workshopId', authorizeRoles('humas', 'mitra', 'sekretariat', 'rektor'), asyncHandler(c.byWorkshop));

module.exports = router;
