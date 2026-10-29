const app = require('./app');
const config = require('./config/app.config');
const { testConnection, pool } = require('./config/database');

const PORT = config.app.port;

/**
 * Memulai HTTP server Express
 */
async function startServer() {
  console.log('========================================================');
  console.log('   SISTEM INFORMASI MANAJEMEN WORKSHOP UNIVERSITAS ANDALAS');
  console.log('   Backend REST API Service');
  console.log('========================================================');

  // Menguji koneksi database saat startup
  await testConnection();

  const server = app.listen(PORT, () => {
    console.log(`[Server] Berjalan di port : http://localhost:${PORT}`);
    console.log(`[Health] Cek kesehatan API : http://localhost:${PORT}${config.app.apiPrefix}/health`);
    console.log(`[Env]    Environment     : ${config.app.env}`);
    console.log('--------------------------------------------------------');
  });

  // Graceful shutdown handling
  const handleShutdown = async (signal) => {
    console.log(`\n[Server] Menerima sinyal ${signal}. Menutup server dengan aman...`);
    server.close(async () => {
      console.log('[Server] HTTP server ditutup.');
      try {
        await pool.end();
        console.log('[Database] Koneksi pool MySQL ditutup.');
      } catch (err) {
        console.error('[Database Error] Gagal menutup pool MySQL:', err.message);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer();

