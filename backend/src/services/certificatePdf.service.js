/**
 * PDF sertifikat resmi dibuat di SERVER (bukan di browser) agar isinya konsisten
 * dan tidak bisa dimanipulasi. Setiap PDF memuat QR menuju halaman verifikasi publik
 * `/verifikasi/<nomor>` dan kode keaslian (potongan SHA-256 isi sertifikat).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const storage = require('./storage.service');

const APP_URL = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');
const LOGO = path.join(__dirname, '../../assets/logo-unand.png');
const GREEN = '#14532d';
const MUTED = '#5d6a63';

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const tanggal = (iso) => {
  const d = String(iso || '').slice(0, 10).split('-');
  return d.length === 3 ? `${Number(d[2])} ${BULAN[Number(d[1]) - 1]} ${d[0]}` : '';
};

const verifyUrl = (nomor) => `${APP_URL}/verifikasi/${encodeURIComponent(nomor)}`;

/** Kode keaslian: 12 karakter pertama SHA-256 dari data inti sertifikat */
function authenticityCode(c) {
  return crypto.createHash('sha256')
    .update([c.nomor, c.nama_penerima, c.gelar || '', c.workshop_id, c.issued_at].join('|'))
    .digest('hex').slice(0, 12).toUpperCase();
}

/**
 * @param c   baris sertifikat (dengan workshop_nama, sumber, partner_nama, tanggal_mulai/selesai)
 * @param sub baris pengajuan TTE (mitra/rektor signature + nama penandatangan) atau null
 * @returns Promise<Buffer>
 */
async function buildCertificatePdf(c, sub) {
  const qr = await QRCode.toBuffer(verifyUrl(c.nomor), { margin: 0, width: 220, color: { dark: '#0f3d24', light: '#ffffff' } });
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0, info: {
    Title: `Sertifikat ${c.nomor}`, Author: 'Universitas Andalas', Subject: c.workshop_nama, Creator: 'Sistem Informasi Workshop UNAND',
  } });
  const chunks = [];
  doc.on('data', (b) => chunks.push(b));
  const done = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const W = doc.page.width; const H = doc.page.height;

  // Bingkai ganda
  doc.rect(22, 22, W - 44, H - 44).lineWidth(3).stroke(GREEN);
  doc.rect(32, 32, W - 64, H - 64).lineWidth(0.8).stroke('#8fb39c');

  // Kop
  if (fs.existsSync(LOGO)) doc.image(LOGO, W / 2 - 26, 58, { width: 52 });
  doc.font('Helvetica-Bold').fontSize(15).fillColor(GREEN).text('UNIVERSITAS ANDALAS', 0, 122, { align: 'center', width: W });
  const penyelenggara = c.sumber === 'Mitra' ? `Kerja sama dengan ${c.partner_nama || c.penyelenggara}` : 'Sistem Informasi Workshop';
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).text(penyelenggara, 0, 141, { align: 'center', width: W });

  // Judul & penerima
  doc.font('Helvetica-Bold').fontSize(34).fillColor(GREEN).text('SERTIFIKAT', 0, 172, { align: 'center', width: W, characterSpacing: 4 });
  doc.font('Helvetica').fontSize(10.5).fillColor(MUTED).text(`Nomor: ${c.nomor}`, 0, 214, { align: 'center', width: W });
  doc.font('Helvetica').fontSize(12).fillColor('#33433a').text('Diberikan kepada', 0, 246, { align: 'center', width: W });
  const nama = [c.nama_penerima, c.gelar].filter(Boolean).join(', ');
  doc.font('Times-Bold').fontSize(30).fillColor('#10291b').text(nama, 60, 266, { align: 'center', width: W - 120 });
  doc.moveTo(W / 2 - 170, 306).lineTo(W / 2 + 170, 306).lineWidth(0.8).stroke('#b9cec0');

  doc.font('Helvetica').fontSize(12).fillColor('#33433a').text(`atas partisipasinya sebagai peserta ${String(c.jenis || 'kegiatan').toLowerCase()}`, 0, 318, { align: 'center', width: W });
  doc.font('Helvetica-Bold').fontSize(16).fillColor(GREEN).text(c.workshop_nama, 80, 338, { align: 'center', width: W - 160 });
  const periode = c.tanggal_selesai && c.tanggal_selesai !== c.tanggal_mulai ? `${tanggal(c.tanggal_mulai)} – ${tanggal(c.tanggal_selesai)}` : tanggal(c.tanggal_mulai);
  doc.font('Helvetica').fontSize(11).fillColor(MUTED).text(`Dilaksanakan ${periode} · Padang, ${tanggal(c.issued_at)}`, 0, 364, { align: 'center', width: W });
  if (c.info_tambahan) doc.fontSize(10).text(c.info_tambahan, 100, 382, { align: 'center', width: W - 200 });

  // Tanda tangan
  const slots = [];
  if (sub?.mitra_signed_at) slots.push({ jabatan: `Pimpinan ${c.partner_nama || 'Mitra'}`, nama: sub.mitra_signer || '', ttd: storage.readBuffer(sub.mitra_signature) });
  if (sub?.rektor_signed_at) slots.push({ jabatan: 'Rektor Universitas Andalas', nama: sub.rektor_signer || '', ttd: storage.readBuffer(sub.rektor_signature) });
  if (!slots.length) slots.push({ jabatan: 'Universitas Andalas', nama: '', ttd: null });
  const slotW = 200; const gap = 60;
  const totalW = slots.length * slotW + (slots.length - 1) * gap;
  let x = (W - totalW) / 2;
  const yTtd = 418;
  for (const s of slots) {
    doc.font('Helvetica').fontSize(10).fillColor('#33433a').text(s.jabatan, x, yTtd, { width: slotW, align: 'center' });
    if (s.ttd) { try { doc.image(s.ttd, x + 50, yTtd + 16, { fit: [100, 46], align: 'center' }); } catch { /* gambar tidak valid */ } }
    doc.moveTo(x + 20, yTtd + 68).lineTo(x + slotW - 20, yTtd + 68).lineWidth(0.6).stroke('#8a9a90');
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#10291b').text(s.nama || '', x, yTtd + 73, { width: slotW, align: 'center' });
    doc.font('Helvetica').fontSize(8).fillColor(MUTED).text('Ditandatangani secara elektronik', x, yTtd + 88, { width: slotW, align: 'center' });
    x += slotW + gap;
  }

  // QR verifikasi + kode keaslian
  doc.image(qr, W - 128, H - 132, { width: 70 });
  doc.font('Helvetica').fontSize(7).fillColor(MUTED).text('Pindai untuk verifikasi', W - 146, H - 58, { width: 106, align: 'center' });
  doc.font('Helvetica').fontSize(7.5).fillColor(MUTED)
    .text(`Kode keaslian: ${authenticityCode(c)}`, 58, H - 70)
    .text(`Verifikasi: ${verifyUrl(c.nomor)}`, 58, H - 58, { width: W - 230 });

  doc.end();
  return done;
}

module.exports = { buildCertificatePdf, authenticityCode, verifyUrl };
