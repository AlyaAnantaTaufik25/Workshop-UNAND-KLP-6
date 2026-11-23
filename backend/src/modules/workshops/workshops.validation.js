/**
 * Validasi skema request untuk modul workshops
 */
const workshopsValidation = {
  create(req) {
    const errors = [];
    if (!(req.body.nama || req.body.judul)) errors.push('Judul kegiatan wajib diisi');
    if (!req.body.tanggalMulai) errors.push('Tanggal mulai wajib diisi');
    if (req.body.tanggalSelesai && req.body.tanggalMulai && req.body.tanggalSelesai < req.body.tanggalMulai) {
      errors.push('Tanggal selesai tidak boleh sebelum tanggal mulai');
    }
    return errors.length ? { error: { details: errors } } : {};
  },
};

module.exports = workshopsValidation;
