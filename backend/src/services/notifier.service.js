/**
 * Titik tunggal pembuatan notifikasi:
 *   1. disimpan ke tabel notifications (lonceng di portal),
 *   2. didorong real-time ke klien yang sedang terhubung (SSE),
 *   3. dimasukkan ke antrean email penerima.
 *
 * notify({ userId } | { roleCode, partnerId? }, { judul, deskripsi, link }, { email: true })
 */
const { pool } = require('../config/database');
const realtime = require('./realtime.service');
const mailer = require('./mailer.service');
const logger = require('../utils/logger.util');

async function recipientsFor({ userId, roleCode, partnerId }) {
  if (userId) {
    const [rows] = await pool.query("SELECT email, nama FROM users WHERE id = ? AND status = 'Aktif'", [userId]);
    return rows;
  }
  const params = [roleCode];
  let sql = "SELECT u.email, u.nama FROM users u JOIN roles r ON r.id = u.role_id WHERE r.code = ? AND u.status = 'Aktif'";
  if (partnerId) { sql += ' AND u.partner_id = ?'; params.push(partnerId); }
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function notify(target, { judul, deskripsi = '', link = null }, { email = true } = {}) {
  const row = {
    user_id: target.userId || null,
    role_code: target.userId ? null : target.roleCode || null,
    partner_id: target.partnerId || null,
    judul: String(judul).slice(0, 200),
    deskripsi: deskripsi ? String(deskripsi).slice(0, 500) : null,
    link,
  };
  const [res] = await pool.query('INSERT INTO notifications SET ?', [row]);
  realtime.publish(target, { id: res.insertId, judul: row.judul, deskripsi: row.deskripsi || '', link });
  if (email) {
    try {
      await mailer.queue(await recipientsFor(target), { judul: row.judul, deskripsi: row.deskripsi, link });
    } catch (err) {
      logger.warn(`[Notifier] Antrean email gagal: ${err.message}`);
    }
  }
  return res.insertId;
}

/** Adaptor untuk pemanggil lama: { user_id | role_code, partner_id?, judul, deskripsi, link } */
function notifyRow(data, opts) {
  return notify(
    { userId: data.user_id || null, roleCode: data.role_code || null, partnerId: data.partner_id || null },
    { judul: data.judul, deskripsi: data.deskripsi, link: data.link },
    opts
  );
}

module.exports = { notify, notifyRow };
