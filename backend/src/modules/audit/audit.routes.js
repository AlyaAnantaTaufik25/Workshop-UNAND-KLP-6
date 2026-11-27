const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { asyncHandler } = require('../../utils/http.util');
const { successResponse } = require('../../utils/response.util');
const auditService = require('../../services/audit.service');

/**
 * @route GET /api/v1/audit-logs?action=&entity=&entityId=&q=&page=&limit=
 * Jejak audit (login, TTE, verifikasi, penerbitan, perbaikan). Humas melihat semua;
 * Sekretariat & Rektor melihat aktivitas sertifikat.
 */
router.get('/', authenticate, authorizeRoles('humas', 'sekretariat', 'rektor'), asyncHandler(async (req, res) => {
  const query = { ...req.query };
  if (req.user.role !== 'humas' && !String(query.action || '').match(/^(certificate|replacement|correction)/)) {
    query.entity = query.entity && query.entity.startsWith('certificate') ? query.entity : undefined;
    query.action = query.action || 'certificate';
  }
  return successResponse(res, 'Log audit', await auditService.list(query));
}));

module.exports = router;
