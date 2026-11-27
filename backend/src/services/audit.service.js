const crypto = require('crypto');
const { pool } = require('../config/database');
const { getContext } = require('../utils/requestContext');
const logger = require('../utils/logger.util');

/** SHA-256 dari isi dokumen (string/objek) — bukti versi dokumen saat ditandatangani */
function hashDocument(content) {
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Catat tindakan penting ke audit_logs. Tidak pernah melempar error
 * (kegagalan audit tidak boleh menggagalkan tindakan utama), tetapi dicatat ke log.
 *
 * audit({ action: 'certificate.sign', entity: 'certificate_submission', entityId: 5,
 *         description: '...', docHash, meta, user })
 */
async function audit({ action, entity = null, entityId = null, description = null, docHash = null, meta = null, user = null }) {
  const ctx = getContext();
  const actor = user || ctx.user || {};
  try {
    await pool.query('INSERT INTO audit_logs SET ?', [{
      user_id: actor.id || null,
      user_nama: actor.nama || null,
      user_role: actor.role || null,
      action,
      entity,
      entity_id: entityId,
      description: description ? String(description).slice(0, 500) : null,
      ip: ctx.ip || null,
      user_agent: ctx.userAgent || null,
      doc_hash: docHash,
      meta: meta ? JSON.stringify(meta) : null,
    }]);
  } catch (err) {
    logger.error ? logger.error(`[Audit] Gagal mencatat ${action}: ${err.message}`) : console.error('[Audit]', err.message);
  }
}

async function list({ action, entity, entityId, userId, q, page = 1, limit = 25 } = {}) {
  const where = []; const params = [];
  if (action) { where.push('action LIKE ?'); params.push(`${action}%`); }
  if (entity) { where.push('entity = ?'); params.push(entity); }
  if (entityId) { where.push('entity_id = ?'); params.push(Number(entityId)); }
  if (userId) { where.push('user_id = ?'); params.push(Number(userId)); }
  if (q) { where.push('(description LIKE ? OR user_nama LIKE ? OR ip LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  const sqlWhere = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const size = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 100);
  const current = Math.max(parseInt(page, 10) || 1, 1);
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM audit_logs ${sqlWhere}`, params);
  const [rows] = await pool.query(
    `SELECT * FROM audit_logs ${sqlWhere} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
    [...params, size, (current - 1) * size]
  );
  return {
    items: rows.map((r) => ({
      id: r.id, waktu: r.created_at, action: r.action, entity: r.entity, entityId: r.entity_id,
      deskripsi: r.description, pengguna: r.user_nama, peran: r.user_role, ip: r.ip, perangkat: r.user_agent,
      docHash: r.doc_hash, meta: typeof r.meta === 'string' ? JSON.parse(r.meta) : r.meta,
    })),
    meta: { page: current, limit: size, total, pages: Math.max(1, Math.ceil(total / size)) },
  };
}

module.exports = { audit, hashDocument, list };
