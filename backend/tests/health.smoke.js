const http = require('http');

/**
 * Basic Smoke Test untuk Endpoint Health Check
 * Menggunakan modul bawaan Node.js tanpa dependensi pihak ketiga.
 */
function testHealthEndpoint() {
  const options = {
    hostname: 'localhost',
    port: process.env.PORT || 5000,
    path: '/api/v1/health',
    method: 'GET',
    timeout: 3000,
  };

  console.log(`[Test] Menguji endpoint: http://${options.hostname}:${options.port}${options.path}...`);

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`[Test] Status Code: ${res.statusCode}`);
      try {
        const json = JSON.parse(data);
        if (json.success === true && json.data.status === 'healthy') {
          console.log('[Test PASSED] Health check endpoint berfungsi dengan benar!');
          console.log(JSON.stringify(json, null, 2));
          process.exit(0);
        } else {
          console.error('[Test FAILED] Respon tidak sesuai spesifikasi standar:', json);
          process.exit(1);
        }
      } catch (err) {
        console.error('[Test FAILED] Respon bukan format JSON yang valid:', data);
        process.exit(1);
      }
    });
  });

  req.on('error', (err) => {
    console.error(`[Test ERROR] Gagal menghubungi server: ${err.message}`);
    console.error('Pastikan server backend sudah dijalankan terlebih dahulu (npm run dev).');
    process.exit(1);
  });

  req.end();
}

testHealthEndpoint();

