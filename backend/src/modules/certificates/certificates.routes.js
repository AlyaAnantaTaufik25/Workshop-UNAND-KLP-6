const express = require('express');
const router = express.Router();
const c = require('./certificates.controller');
const v = require('./certificates.validation');
const { validate } = require('../../middlewares/validation.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { asyncHandler } = require('../../utils/http.util');

const auth = (...roles) => [authenticate, authorizeRoles(...roles)];

// Verifikasi publik keabsahan nomor sertifikat
router.get('/verify/:serialNumber', asyncHandler(c.verify));

// Template desain sertifikat
router.get('/templates', auth('humas', 'mitra', 'sekretariat', 'rektor'), asyncHandler(c.listTemplates));
router.post('/templates', auth('humas', 'mitra'), validate(v.template), asyncHandler(c.createTemplate));
router.put('/templates/:id', auth('humas', 'mitra'), asyncHandler(c.updateTemplate));
router.delete('/templates/:id', auth('humas', 'mitra'), asyncHandler(c.deleteTemplate));
router.get('/templates/:id/file', auth('humas', 'mitra', 'sekretariat', 'rektor'), asyncHandler(c.templateFile));

// Pengajuan sertifikat & tanda tangan elektronik
router.get('/submissions', auth('humas', 'mitra', 'sekretariat', 'rektor'), asyncHandler(c.listSubmissions));
router.get('/submissions/:id', auth('humas', 'mitra', 'sekretariat', 'rektor'), asyncHandler(c.getSubmission));
router.post('/submissions', auth('humas'), validate(v.submission), asyncHandler(c.createSubmission));
router.post('/submissions/:id/sign', auth('mitra', 'rektor'), validate(v.sign), asyncHandler(c.signSubmission));
router.patch('/submissions/:id/verify', auth('sekretariat'), asyncHandler(c.verifySubmission));

// Sertifikat peserta
router.get('/my', auth('peserta'), asyncHandler(c.my));

// Perbaikan sertifikat
router.get('/corrections', auth('peserta', 'humas', 'mitra'), asyncHandler(c.listCorrections));
router.post('/corrections', auth('peserta'), validate(v.correction), asyncHandler(c.createCorrection));
router.patch('/corrections/read', auth('peserta'), asyncHandler(c.markRead));
router.get('/corrections/:id', auth('peserta', 'humas', 'mitra'), asyncHandler(c.getCorrection));
router.patch('/corrections/:id/cancel', auth('peserta'), asyncHandler(c.cancelCorrection));
router.patch('/corrections/:id/process', auth('humas', 'mitra'), validate(v.process), asyncHandler(c.processCorrection));

// Dokumen pengganti (hasil perbaikan) yang perlu TTE ulang
router.get('/replacements', auth('sekretariat', 'rektor', 'humas', 'mitra'), asyncHandler(c.listReplacements));
router.get('/replacements/:id', auth('sekretariat', 'rektor', 'humas', 'mitra'), asyncHandler(c.getReplacement));
router.post('/replacements/:id/sign', auth('rektor'), validate(v.sign), asyncHandler(c.signReplacement));
router.post('/replacements/:id/approve', auth('mitra'), asyncHandler(c.approveReplacement));

module.exports = router;
