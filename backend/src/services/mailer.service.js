/**
 * Email notifikasi lewat antrean `email_outbox`.
 *
 * - queue(): menyimpan email (cepat, tidak menunggu SMTP).
 * - flush(): dikirim berkala oleh scheduler. Dengan SMTP_HOST di .env email dikirim
 *   sungguhan; tanpa SMTP (pengembangan) email ditandai 'logged' dan ditulis ke log
 *   sehingga isinya tetap bisa diperiksa di tabel email_outbox.
 */
const nodemailer = require('nodemailer');
const { pool } = require('../config/database');
const logger = require('../utils/logger.util');

const SMTP = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.MAIL_FROM || 'Workshop UNAND <no-reply@unand.ac.id>',
};
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const ENABLED = process.env.MAIL_ENABLED !== 'false';

let transporter = null;
function getTransport() {
  if (!SMTP.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP.host, port: SMTP.port, secure: SMTP.secure,
      auth: SMTP.user ? { user: SMTP.user, pass: SMTP.pass } : undefined,
    });
  }
  return transporter;
}

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Templat email sederhana bergaya portal */
function render({ judul, deskripsi, link, nama }) {
  const url = link ? `${APP_URL}${link}` : APP_URL;
  const text = `Halo ${nama || ''},\n\n${judul}\n${deskripsi || ''}\n\nBuka di portal: ${url}\n\n— Sistem Informasi Workshop UNAND`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f8f5;font-family:Arial,Helvetica,sans-serif;color:#10291b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #e3eae5;border-radius:12px">
    <tr><td style="padding:20px 24px;border-bottom:1px solid #e3eae5;font-weight:700;color:#14532d">Workshop UNAND</td></tr>
    <tr><td style="padding:22px 24px">
      <p style="margin:0 0 12px;color:#66736c">Halo ${escapeHtml(nama || '')},</p>
      <h1 style="margin:0 0 8px;font-size:18px">${escapeHtml(judul)}</h1>
      <p style="margin:0 0 20px;line-height:1.55">${escapeHtml(deskripsi || '')}</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;padding:10px 18px;background:#14532d;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Buka di portal</a>
    </td></tr>
    <tr><td style="padding:14px 24px;border-top:1px solid #e3eae5;font-size:12px;color:#66736c">Email otomatis dari Sistem Informasi Workshop Universitas Andalas. Mohon tidak membalas email ini.</td></tr>
  </table></td></tr></table></body></html>`;
  return { text, html };
}

/** Masukkan email ke antrean untuk daftar penerima [{ email, nama }] */
async function queue(recipients, { judul, deskripsi, link }) {
  if (!ENABLED || !recipients?.length) return 0;
  const rows = recipients.filter((r) => r?.email).map((r) => {
    const { text, html } = render({ judul, deskripsi, link, nama: r.nama });
    return [r.email, r.nama || null, `[Workshop UNAND] ${judul}`.slice(0, 200), text, html];
  });
  if (!rows.length) return 0;
  await pool.query('INSERT INTO email_outbox (to_email, to_name, subject, body_text, body_html) VALUES ?', [rows]);
  return rows.length;
}

/** Kirim email yang tertunda (dipanggil berkala) */
async function flush(limit = 20) {
  const [rows] = await pool.query(
    "SELECT * FROM email_outbox WHERE status = 'pending' OR (status = 'failed' AND attempts < 3) ORDER BY id LIMIT ?", [limit]
  );
  if (!rows.length) return 0;
  const transport = getTransport();
  for (const m of rows) {
    if (!transport) {
      await pool.query("UPDATE email_outbox SET status = 'logged', sent_at = NOW(), attempts = attempts + 1 WHERE id = ?", [m.id]);
      logger.info(`[Email] (tanpa SMTP) → ${m.to_email}: ${m.subject}`);
      continue;
    }
    try {
      await transport.sendMail({ from: SMTP.from, to: m.to_name ? `"${m.to_name}" <${m.to_email}>` : m.to_email, subject: m.subject, text: m.body_text, html: m.body_html || undefined });
      await pool.query("UPDATE email_outbox SET status = 'sent', sent_at = NOW(), attempts = attempts + 1, last_error = NULL WHERE id = ?", [m.id]);
    } catch (err) {
      await pool.query("UPDATE email_outbox SET status = 'failed', attempts = attempts + 1, last_error = ? WHERE id = ?", [String(err.message).slice(0, 500), m.id]);
      logger.warn(`[Email] Gagal ke ${m.to_email}: ${err.message}`);
    }
  }
  return rows.length;
}

module.exports = { queue, flush, render };
