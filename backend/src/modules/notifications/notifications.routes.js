const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');
const { authenticate } = require('../../middlewares/auth.middleware');
const { asyncHandler, badRequest } = require('../../utils/http.util');
const { successResponse } = require('../../utils/response.util');
const { formatTanggalJam } = require('../../utils/format.util');
const realtime = require('../../services/realtime.service');

/**
 * Notifikasi untuk user yang login: notifikasi pribadi + notifikasi untuk role-nya.
 */
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = ? OR (role_code = ? AND (partner_id IS NULL OR partner_id = ?))
     ORDER BY created_at DESC LIMIT 30`,
    [req.user.id, req.user.role, req.user.partnerId || 0]
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

/** Notifikasi real-time (Server-Sent Events) */
router.get('/stream', (req, res) => realtime.subscribe(req, res));

router.patch('/read', asyncHandler(async (req, res) => {
  const raw = (req.body || {}).id;
  // id opsional: angka positif. Nilai lain (array/objek) ditolak agar tidak
  // diperluas menjadi SQL oleh placeholder mysql2.
  const id = raw === undefined || raw === null || raw === '' ? null : Number(raw);
  if (id !== null && !(Number.isInteger(id) && id > 0)) throw badRequest('ID notifikasi tidak valid');
  await pool.query(
    `UPDATE notifications SET read_at = NOW() WHERE read_at IS NULL AND (user_id = ? OR (role_code = ? AND (partner_id IS NULL OR partner_id = ?))) ${id ? 'AND id = ?' : ''}`,
    id ? [req.user.id, req.user.role, req.user.partnerId || 0, id] : [req.user.id, req.user.role, req.user.partnerId || 0]
  );
  return successResponse(res, 'Notifikasi ditandai dibaca', null);
}));

module.exports = router;
