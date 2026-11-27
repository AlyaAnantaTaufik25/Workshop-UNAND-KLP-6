/**
 * 003 — Pindahkan berkas base64 lama dari database ke disk (uploads/).
 * Setelah ini kolom-kolom berkas hanya berisi path '/uploads/...'.
 * Aman dijalankan pada database kosong maupun yang sudah berisi data.
 */
const storage = require('../../src/services/storage.service');

const COLUMNS = [
  ['workshops', 'poster', 'posters'],
  ['attendances', 'file_data', 'presensi'],
  ['certificate_templates', 'berkas_data', 'templates'],
  ['certificate_submissions', 'mitra_signature', 'signatures'],
  ['certificate_submissions', 'rektor_signature', 'signatures'],
];

async function up(conn) {
  let moved = 0;
  for (const [table, column, folder] of COLUMNS) {
    const [rows] = await conn.query(`SELECT id, \`${column}\` AS v FROM \`${table}\` WHERE \`${column}\` LIKE 'data:%'`);
    for (const row of rows) {
      const stored = storage.saveDataUrl(row.v, folder);
      await conn.query(`UPDATE \`${table}\` SET \`${column}\` = ? WHERE id = ?`, [stored, row.id]);
      moved++;
    }
  }
  // Lampiran perbaikan (JSON berisi dataUrl)
  const [corr] = await conn.query("SELECT id, attachment FROM certificate_corrections WHERE attachment LIKE '%\"dataUrl\":\"data:%'");
  for (const row of corr) {
    const att = JSON.parse(row.attachment);
    const url = storage.saveDataUrl(att.dataUrl, 'perbaikan');
    await conn.query('UPDATE certificate_corrections SET attachment = ? WHERE id = ?', [JSON.stringify({ name: att.name, type: att.type, size: att.size, url }), row.id]);
    moved++;
  }
  console.log(`[Migrate] 003: ${moved} berkas dipindahkan ke disk.`);
}

module.exports = { up };
