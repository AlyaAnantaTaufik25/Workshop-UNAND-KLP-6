const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');
const { authenticate } = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/http.util');
const { successResponse } = require('../../utils/response.util');
const { formatTanggalJam } = require('../../utils/format.util');

/**
 * Notifikasi untuk user yang login: notifikasi pribadi + notifikasi untuk role-nya.
 */
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT * FROM notifications WHERE user_id = ? OR role_code = ? ORDER BY created_at DESC LIMIT 30`,
    [req.user.id, req.user.role]
  );
  const data = rows.map((n) => ({
    id: n.id,
    judul: n.judul,
    deskripsi: n.deskripsi || '',
    link: n.link || null,
    belumDibaca: !n.read_at,
    waktu: `${formatTanggalJam(n.created_at)}${n.read_at ? '' : ' · belum dibaca'}`,
    createdAt: n.created_at,
  }));
  return successResponse(res, 'Notifikasi', data);
}));

router.patch('/read', asyncHandler(async (req, res) => {
  const { id } = req.body || {};
  await pool.query(
    `UPDATE notifications SET read_at = NOW() WHERE read_at IS NULL AND (user_id = ? OR role_code = ?) ${id ? 'AND id = ?' : ''}`,
    id ? [req.user.id, req.user.role, id] : [req.user.id, req.user.role]
  );
  return successResponse(res, 'Notifikasi ditandai dibaca', null);
}));

module.exports = router;
