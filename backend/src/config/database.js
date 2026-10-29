const mysql = require('mysql2/promise');
const config = require('./app.config');

// Inisialisasi pool koneksi MySQL
const pool = mysql.createPool(config.db);

/**
 * Menguji koneksi ke database MySQL.
 * Tidak menyebabkan aplikasi crash jika database belum menyala saat inisialisasi awal.
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Terhubung ke MySQL: ${config.db.host}:${config.db.port} (${config.db.database})`);
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[Database Warning] Gagal terhubung ke MySQL (${error.message}).`);
    console.warn('[Database Warning] Pastikan MySQL service aktif dan database telah dibuat.');
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
};

