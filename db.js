const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');
const { initCryptoKeys, signPayload } = require('./crypto-helper');

const DB_PATH = path.join(__dirname, 'sim_workshop.db');
const db = new Database(DB_PATH);

// Enable WAL mode and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('peserta_mhs', 'peserta_umum', 'humas', 'sekretariat', 'rektor', 'mitra')),
      nim TEXT,
      jurusan TEXT,
      fakultas TEXT,
      instansi TEXT,
      phone TEXT,
      status TEXT DEFAULT 'AKTIF' CHECK(status IN ('AKTIF', 'NONAKTIF')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS master_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      building TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius_meters REAL NOT NULL DEFAULT 100,
      capacity INTEGER DEFAULT 100,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS master_partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('internal', 'eksternal')),
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      user_id INTEGER,
      status TEXT DEFAULT 'AKTIF' CHECK(status IN ('AKTIF', 'NONAKTIF')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS workshops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      speaker TEXT NOT NULL,
      speaker_title TEXT,
      partner_name TEXT,
      benefits TEXT,
      category TEXT DEFAULT 'Teknologi Informasi',
      event_type TEXT DEFAULT 'WORKSHOP' CHECK(event_type IN ('WORKSHOP', 'SEMINAR', 'KULIAH_UMUM')),
      partner_id INTEGER,
      location_id INTEGER,
      date_start DATETIME NOT NULL,
      date_end DATETIME NOT NULL,
      reg_start DATETIME NOT NULL,
      reg_end DATETIME NOT NULL,
      attendance_start DATETIME,
      attendance_end DATETIME,
      location_name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius_meters REAL NOT NULL DEFAULT 100,
      quota INTEGER NOT NULL DEFAULT 50,
      is_unlimited_quota INTEGER NOT NULL DEFAULT 0,
      target_audience TEXT NOT NULL CHECK(target_audience IN ('semua', 'mahasiswa', 'umum')),
      status TEXT NOT NULL DEFAULT 'pendaftaran_dibuka' CHECK(status IN ('draft', 'terjadwal', 'dipublikasikan', 'pendaftaran_dibuka', 'pendaftaran_ditutup', 'berlangsung', 'selesai', 'dibatalkan', 'diarsipkan')),
      published INTEGER NOT NULL DEFAULT 1,
      session_secret TEXT NOT NULL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (partner_id) REFERENCES master_partners(id),
      FOREIGN KEY (location_id) REFERENCES master_locations(id)
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workshop_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('TERDAFTAR', 'WAITING_LIST', 'DIBATALKAN')),
      waiting_number INTEGER,
      seat_number TEXT,
      attendance_status TEXT NOT NULL DEFAULT 'BELUM_HADIR' CHECK(attendance_status IN ('BELUM_HADIR', 'HADIR', 'TIDAK_HADIR', 'PERLU_VERIFIKASI')),
      attended_at DATETIME,
      attendance_method TEXT,
      checkin_lat REAL,
      checkin_lon REAL,
      distance_meters REAL,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(workshop_id, user_id),
      FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workshop_id INTEGER NOT NULL,
      user_id INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      attempt_status TEXT NOT NULL CHECK(attempt_status IN ('SUCCESS', 'REJECTED', 'WARNING')),
      rejection_reason TEXT,
      token_submitted TEXT,
      lat_submitted REAL,
      lon_submitted REAL,
      distance_meters REAL,
      accuracy_meters REAL,
      ip_address TEXT,
      FOREIGN KEY (workshop_id) REFERENCES workshops(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id INTEGER,
      actor_role TEXT,
      action TEXT NOT NULL,
      target_entity TEXT NOT NULL,
      target_id INTEGER,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (actor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      certificate_number TEXT UNIQUE NOT NULL,
      registration_id INTEGER UNIQUE NOT NULL,
      workshop_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      recipient_name TEXT NOT NULL,
      recipient_nim TEXT,
      workshop_title TEXT NOT NULL,
      issue_date DATE NOT NULL,
      payload_hash TEXT NOT NULL,
      digital_signature TEXT NOT NULL,
      signer_sekretariat TEXT DEFAULT 'Sekretariat Rektor UNAND',
      signer_rektor TEXT DEFAULT 'Prof. Dr. Efa Yonnedi, S.E., M.P.A',
      signer_mitra TEXT,
      issuer_type TEXT DEFAULT 'UNAND' CHECK(issuer_type IN ('UNAND', 'MITRA')),
      approval_status TEXT DEFAULT 'VALID' CHECK(approval_status IN ('DISIAPKAN', 'MENUNGGU_TTD_REKTOR', 'MENUNGGU_TTD_MITRA', 'DITOLAK_PERBAIKAN', 'VALID', 'REVOKED')),
      rejection_reason TEXT,
      signed_at_rektor DATETIME,
      signed_at_mitra DATETIME,
      template_name TEXT DEFAULT 'Sertifikat Standar UNAND',
      status TEXT NOT NULL DEFAULT 'VALID' CHECK(status IN ('VALID', 'REVOKED')),
      public_verification_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (registration_id) REFERENCES registrations(id),
      FOREIGN KEY (workshop_id) REFERENCES workshops(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS certificate_corrections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      certificate_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      current_name TEXT NOT NULL,
      requested_name TEXT NOT NULL,
      requested_nim_instansi TEXT,
      reason TEXT NOT NULL,
      issuer_type TEXT NOT NULL CHECK(issuer_type IN ('UNAND', 'MITRA')),
      status TEXT NOT NULL DEFAULT 'MENUNGGU' CHECK(status IN ('MENUNGGU', 'DISETUJUI', 'DITOLAK')),
      reviewed_by INTEGER,
      review_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (certificate_id) REFERENCES certificates(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (reviewed_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS certificate_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      owner_role TEXT NOT NULL CHECK(owner_role IN ('humas', 'mitra', 'sekretariat')),
      partner_id INTEGER,
      layout_config TEXT,
      file_name TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (partner_id) REFERENCES master_partners(id)
    );

    CREATE INDEX IF NOT EXISTS idx_reg_ws_user ON registrations(workshop_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_reg_status ON registrations(workshop_id, status);
    CREATE INDEX IF NOT EXISTS idx_cert_number ON certificates(certificate_number);
    CREATE INDEX IF NOT EXISTS idx_cert_ws ON certificates(workshop_id);
  `);
}

function applyMigrations() {
  // Dynamically check and add columns if they don't exist yet on existing tables
  const addColumnIfNotExists = (table, column, colDef) => {
    try {
      const cols = db.prepare(`PRAGMA table_info(${table})`).all();
      if (!cols.some(c => c.name === column)) {
        db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${colDef}`).run();
        console.log(`[DB Migration] Added column ${column} to table ${table}`);
      }
    } catch (e) {
      console.warn(`[DB Migration Notice] ${table}.${column}:`, e.message);
    }
  };

  addColumnIfNotExists('users', 'status', "TEXT DEFAULT 'AKTIF'");
  addColumnIfNotExists('workshops', 'event_type', "TEXT DEFAULT 'WORKSHOP'");
  addColumnIfNotExists('workshops', 'partner_id', 'INTEGER');
  addColumnIfNotExists('workshops', 'location_id', 'INTEGER');
  addColumnIfNotExists('workshops', 'is_unlimited_quota', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('workshops', 'published', 'INTEGER DEFAULT 1');

  addColumnIfNotExists('certificates', 'issuer_type', "TEXT DEFAULT 'UNAND'");
  addColumnIfNotExists('certificates', 'approval_status', "TEXT DEFAULT 'VALID'");
  addColumnIfNotExists('certificates', 'signer_type', "TEXT DEFAULT 'REKTOR'");
  addColumnIfNotExists('certificates', 'pdf_template_url', 'TEXT');
  addColumnIfNotExists('certificates', 'rejection_reason', 'TEXT');
  addColumnIfNotExists('certificates', 'signed_at_rektor', 'DATETIME');
  addColumnIfNotExists('certificates', 'signed_at_mitra', 'DATETIME');
  addColumnIfNotExists('certificates', 'template_name', "TEXT DEFAULT 'Sertifikat Standar UNAND'");
}

function hashPassword(plainText) {
  return crypto.createHash('sha256').update(plainText + '_UNAND_SALT_2026').digest('hex');
}

function seedMasterData() {
  const defaultPasswordHash = hashPassword('unand123');

  // 1. Seed Master Locations
  const locationCount = db.prepare('SELECT COUNT(*) as count FROM master_locations').get().count;
  if (locationCount === 0) {
    console.log('[DB] Seeding Master Lokasi Gedung/Ruangan UNAND (BR-07, FR-HUM-10)...');
    const insertLoc = db.prepare(`
      INSERT INTO master_locations (name, building, latitude, longitude, radius_meters, capacity, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertLoc.run(
      'Gedung FTI Lt. 2 Ruang Seminar',
      'Gedung Fakultas Teknologi Informasi',
      -0.91465, 100.46072, 150, 80,
      'Ruang seminar ber-AC dengan proyektor interaktif dan audio system lengkap.'
    );
    insertLoc.run(
      'Convention Hall Universitas Andalas',
      'Convention Hall Pusat UNAND',
      -0.91580, 100.45780, 100, 500,
      'Gedung pertemuan utama berskala besar untuk seminar nasional dan internasional.'
    );
    insertLoc.run(
      'Auditorium Universitas Andalas',
      'Auditorium UNAND Limau Manis',
      -0.91410, 100.45620, 200, 1200,
      'Gedung serbaguna kapasitas maksimal untuk kuliah umum akbar dan wisuda.'
    );
    insertLoc.run(
      'Gedung Rektorat UNAND Lt. 4 (Ruang Sidang Senat)',
      'Gedung Rektorat UNAND',
      -0.91480, 100.45890, 100, 150,
      'Ruang rapat eksekutif berfasilitas telekonferensi pimpinan.'
    );
    insertLoc.run(
      'Gedung Kuliah Bersama E (Ruang E-201)',
      'Gedung Perkuliahan Terpadu E',
      -0.91350, 100.46210, 120, 250,
      'Ruang kuliah berjenjang modern dengan sound system dan Wi-Fi eduroam.'
    );
  }

  // 2. Ensure Mitra Internal exists in Users
  const internalMitraUser = db.prepare('SELECT id FROM users WHERE email = ?').get('mitra.dsi@unand.ac.id');
  let internalMitraUserId;
  if (!internalMitraUser) {
    const res = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, nim, jurusan, fakultas, instansi, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Dr. Eng. Ir. Taufik, M.Kom (Koordinator Lab DSI FTI)',
      'mitra.dsi@unand.ac.id',
      defaultPasswordHash,
      'mitra',
      null,
      'Departemen Sistem Informasi',
      'Teknologi Informasi',
      'Departemen Sistem Informasi FTI UNAND (Internal)',
      '081399001122'
    );
    internalMitraUserId = res.lastInsertRowid;
  } else {
    internalMitraUserId = internalMitraUser.id;
  }

  const externalMitraUser = db.prepare('SELECT id FROM users WHERE email = ?').get('partner.gcp@unand.ac.id');
  const externalMitraUserId = externalMitraUser ? externalMitraUser.id : null;

  // 3. Seed Master Partners (BR-03, FR-HUM-09)
  const partnerCount = db.prepare('SELECT COUNT(*) as count FROM master_partners').get().count;
  if (partnerCount === 0) {
    console.log('[DB] Seeding Master Mitra Penyelenggara (Internal & Eksternal)...');
    const insertPartner = db.prepare(`
      INSERT INTO master_partners (name, type, contact_person, email, phone, user_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertPartner.run(
      'Google Cloud Indonesia',
      'eksternal',
      'Ir. Rian Hidayat, M.Kom',
      'partner.gcp@unand.ac.id',
      '08219988776',
      externalMitraUserId,
      'AKTIF'
    );
    insertPartner.run(
      'Badan Siber dan Sandi Negara (BSSN)',
      'eksternal',
      'Derry Pratama, CEH, OSCP',
      'kerjasama@bssn.go.id',
      '08129988112',
      null,
      'AKTIF'
    );
    insertPartner.run(
      'PT Semen Padang (Corporate Partner)',
      'eksternal',
      'Divisi CSR & Talent Development',
      'csr@semenpadang.co.id',
      '075120202',
      null,
      'AKTIF'
    );
    insertPartner.run(
      'Departemen Sistem Informasi FTI UNAND',
      'internal',
      'Dr. Eng. Ir. Taufik, M.Kom',
      'mitra.dsi@unand.ac.id',
      '081399001122',
      internalMitraUserId,
      'AKTIF'
    );
    insertPartner.run(
      'Fakultas Teknologi Informasi UNAND',
      'internal',
      'Wakil Dekan Bidang Kemahasiswaan & Kerjasama',
      'wd3@fti.unand.ac.id',
      '0751778899',
      null,
      'AKTIF'
    );
    insertPartner.run(
      'Lembaga Penelitian & Pengabdian Masyarakat (LPPM UNAND)',
      'internal',
      'Sekretariat LPPM UNAND Limau Manis',
      'lppm@unand.ac.id',
      '075171181',
      null,
      'AKTIF'
    );
  }

  // 4. Update workshops with master foreign keys & event types
  try {
    const locFTI = db.prepare(`SELECT id FROM master_locations WHERE name LIKE '%FTI%'`).get();
    const locConv = db.prepare(`SELECT id FROM master_locations WHERE name LIKE '%Convention%'`).get();
    const locAudit = db.prepare(`SELECT id FROM master_locations WHERE name LIKE '%Auditorium%'`).get();

    const partnerGCP = db.prepare(`SELECT id FROM master_partners WHERE name LIKE '%Google Cloud%'`).get();
    const partnerBSSN = db.prepare(`SELECT id FROM master_partners WHERE name LIKE '%BSSN%'`).get();
    const partnerDSI = db.prepare(`SELECT id FROM master_partners WHERE name LIKE '%Sistem Informasi%'`).get();

    // WS 1: Workshop
    db.prepare(`
      UPDATE workshops SET 
        event_type = 'WORKSHOP',
        location_id = ?,
        partner_id = ?,
        is_unlimited_quota = 0,
        published = 1
      WHERE id = 1
    `).run(locFTI ? locFTI.id : 1, partnerGCP ? partnerGCP.id : 1);

    // WS 2: Seminar
    db.prepare(`
      UPDATE workshops SET 
        event_type = 'SEMINAR',
        location_id = ?,
        partner_id = ?,
        is_unlimited_quota = 0,
        published = 1
      WHERE id = 2
    `).run(locConv ? locConv.id : 2, partnerBSSN ? partnerBSSN.id : 2);

    // WS 3: Kuliah Umum (Unlimit quota demo!)
    db.prepare(`
      UPDATE workshops SET 
        event_type = 'KULIAH_UMUM',
        location_id = ?,
        partner_id = ?,
        is_unlimited_quota = 1,
        published = 1
      WHERE id = 3
    `).run(locAudit ? locAudit.id : 3, partnerDSI ? partnerDSI.id : 4);

    // Update existing certificate with valid approval status
    db.prepare(`
      UPDATE certificates SET 
        issuer_type = 'UNAND',
        approval_status = 'VALID',
        template_name = 'Template Resmi UNAND 2026',
        signed_at_rektor = '2026-08-22 10:00:00'
      WHERE id = 1
    `).run();
  } catch (err) {
    console.warn('[DB Master Link Notice]', err.message);
  }

  // 5. Seed a sample Certificate Correction request (FR-PES-12, FR-HUM-13, BR-11)
  const corrCount = db.prepare('SELECT COUNT(*) as count FROM certificate_corrections').get().count;
  if (corrCount === 0) {
    const cert = db.prepare('SELECT id, user_id, recipient_name, recipient_nim FROM certificates LIMIT 1').get();
    if (cert) {
      db.prepare(`
        INSERT INTO certificate_corrections (
          certificate_id, user_id, current_name, requested_name, requested_nim_instansi,
          reason, issuer_type, status, review_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        cert.id,
        cert.user_id,
        cert.recipient_name,
        `${cert.recipient_name}, B.Sc (Hons)`,
        cert.recipient_nim || '2311522008',
        'Penambahan gelar kehormatan akademik dan ejaan resmi ijazah',
        'UNAND',
        'MENUNGGU',
        'Menunggu peninjauan oleh PPID Humas UNAND'
      );
    }
  }

  // 6. Seed Master Certificate Templates (UC-05, UC-18)
  const tplCount = db.prepare('SELECT COUNT(*) as count FROM certificate_templates').get().count;
  if (tplCount === 0) {
    const insertTpl = db.prepare(`
      INSERT INTO certificate_templates (name, owner_role, partner_id, layout_config, file_name, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertTpl.run(
      'Template Standar Resmi UNAND 2026',
      'humas',
      null,
      JSON.stringify({ border: 'classic_green_gold', orientation: 'landscape', header: 'UNIVERSITAS ANDALAS' }),
      'template_unand_resmi_2026.pdf',
      'Template resmi baku universitas berlogo UNAND dan kop FTI untuk seluruh kegiatan workshop.'
    );

    insertTpl.run(
      'Template Emas Dies Natalis UNAND',
      'humas',
      null,
      JSON.stringify({ border: 'gold_ornament', orientation: 'landscape', header: 'DIES NATALIS EMAS UNIVERSITAS ANDALAS' }),
      'template_dies_natalis_emas.pdf',
      'Template edisi khusus peringatan Dies Natalis dengan aksen pita emas dan cap rektorat.'
    );

    // Mitra templates
    const partnerGCP = db.prepare(`SELECT id FROM master_partners WHERE name LIKE '%Google Cloud%'`).get();
    insertTpl.run(
      'Template Kolaborasi Industri Google Cloud & UNAND',
      'mitra',
      partnerGCP ? partnerGCP.id : null,
      JSON.stringify({ border: 'tech_blue', orientation: 'landscape', header: 'CERTIFICATE OF COMPLETION - GOOGLE CLOUD & UNAND' }),
      'template_mitra_gcp_unand.pdf',
      'Template sertifikat bersama industri Google Cloud dan Universitas Andalas ber-TTE ganda.'
    );

    const partnerBSSN = db.prepare(`SELECT id FROM master_partners WHERE name LIKE '%BSSN%'`).get();
    insertTpl.run(
      'Template Sertifikat Seminar Siber Nasional (BSSN & UNAND)',
      'mitra',
      partnerBSSN ? partnerBSSN.id : null,
      JSON.stringify({ border: 'cyber_security', orientation: 'landscape', header: 'SEMINAR NASIONAL KETAHANAN SIBER' }),
      'template_mitra_bssn_unand.pdf',
      'Template sertifikat bersama BSSN dengan verifikasi kriptografi berjenjang.'
    );
  }
}

function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    seedMasterData();
    return;
  }

  console.log('[DB] Seeding realistic Universitas Andalas initial dataset...');

  // 1. Users
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, nim, jurusan, fakultas, instansi, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultPasswordHash = hashPassword('unand123');

  // Humas, Sekretariat, Rektor, Mitra, Mahasiswa, Umum
  const users = [
    {
      name: 'Kak Deva (PPID Humas)',
      email: 'humas@unand.ac.id',
      role: 'humas',
      nim: null,
      jurusan: 'Pusat Pelayanan Informasi Publik',
      fakultas: 'Biro Humas & Protokoler',
      instansi: 'Universitas Andalas',
      phone: '08126789001'
    },
    {
      name: 'Husnil Kamil, M.T (Sekretariat Rektor)',
      email: 'sekretariat@unand.ac.id',
      role: 'sekretariat',
      nim: null,
      jurusan: 'Sekretariat Eksekutif',
      fakultas: 'Rektorat',
      instansi: 'Universitas Andalas',
      phone: '08119820081'
    },
    {
      name: 'Prof. Dr. Efa Yonnedi, S.E., M.P.A (Rektor)',
      email: 'rektor@unand.ac.id',
      role: 'rektor',
      nim: null,
      jurusan: 'Pimpinan Universitas',
      fakultas: 'Rektorat UNAND',
      instansi: 'Universitas Andalas',
      phone: '08111223344'
    },
    {
      name: 'Google Cloud Indonesia (Mitra Eksternal)',
      email: 'partner.gcp@unand.ac.id',
      role: 'mitra',
      nim: null,
      jurusan: 'Academic Partner',
      fakultas: 'Industry Relations',
      instansi: 'Google Cloud Indonesia',
      phone: '08219988776'
    },
    // Mahasiswa Kelompok 6 & demo participants
    {
      name: 'Ahmad Rasha Radya Aufa Lubis',
      email: 'rasha@student.unand.ac.id',
      role: 'peserta_mhs',
      nim: '2311522008',
      jurusan: 'Sistem Informasi',
      fakultas: 'Teknologi Informasi',
      instansi: 'Universitas Andalas',
      phone: '081234567801'
    },
    {
      name: 'Nurul Aini',
      email: 'nurul@student.unand.ac.id',
      role: 'peserta_mhs',
      nim: '2311521013',
      jurusan: 'Sistem Informasi',
      fakultas: 'Teknologi Informasi',
      instansi: 'Universitas Andalas',
      phone: '081234567802'
    },
    {
      name: 'Mashia Zavira Septyana',
      email: 'mashia@student.unand.ac.id',
      role: 'peserta_mhs',
      nim: '2311522028',
      jurusan: 'Sistem Informasi',
      fakultas: 'Teknologi Informasi',
      instansi: 'Universitas Andalas',
      phone: '081234567803'
    },
    {
      name: 'Della Khairunnisa',
      email: 'della@student.unand.ac.id',
      role: 'peserta_mhs',
      nim: '2311523032',
      jurusan: 'Sistem Informasi',
      fakultas: 'Teknologi Informasi',
      instansi: 'Universitas Andalas',
      phone: '081234567804'
    },
    {
      name: 'Alya Ananta Taufik',
      email: 'alya@student.unand.ac.id',
      role: 'peserta_mhs',
      nim: '2311523005',
      jurusan: 'Sistem Informasi',
      fakultas: 'Teknologi Informasi',
      instansi: 'Universitas Andalas',
      phone: '081234567805'
    },
    {
      name: 'Budi Santoso, S.Kom (Peserta Umum)',
      email: 'budi.santoso@gmail.com',
      role: 'peserta_umum',
      nim: null,
      jurusan: null,
      fakultas: null,
      instansi: 'PT Inovasi Solusi Digital',
      phone: '085277889900'
    }
  ];

  for (const u of users) {
    insertUser.run(
      u.name,
      u.email,
      defaultPasswordHash,
      u.role,
      u.nim,
      u.jurusan,
      u.fakultas,
      u.instansi,
      u.phone
    );
  }

  // 2. Workshops
  const insertWorkshop = db.prepare(`
    INSERT INTO workshops (
      title, slug, description, speaker, speaker_title, partner_name, benefits, category, event_type,
      date_start, date_end, reg_start, reg_end, attendance_start, attendance_end,
      location_name, latitude, longitude, radius_meters, quota, is_unlimited_quota, target_audience,
      status, published, session_secret, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Workshop 1: Active TODAY (Attendance Window OPEN right now for testing!)
  const ws1Secret = crypto.randomBytes(16).toString('hex');
  const ws1Start = `${todayStr} 08:30:00`;
  const ws1End = `${todayStr} 17:00:00`;
  const ws1AttStart = `${todayStr} 08:00:00`;
  const ws1AttEnd = `${todayStr} 23:59:59`;

  const ws1Id = insertWorkshop.run(
    'Workshop Implementasi Cloud Computing & AI Terapan untuk Enterprise',
    'workshop-cloud-computing-ai-terapan',
    'Mendalami arsitektur modern Cloud Native, integrasi Microservices, serta deployment Large Language Models (LLM) pada skala enterprise bersama praktisi industri.',
    'Ir. Rian Hidayat, M.Kom, Cloud Architect Lead',
    'Head of Cloud Solutions Google Cloud Indonesia',
    'Google Cloud Indonesia',
    'E-Sertifikat TTE Resmi Rektor, Modul Hands-on, Akses Cloud Lab Credit $100, Lunch & Coffee Break',
    'Artificial Intelligence & Cloud',
    'WORKSHOP',
    ws1Start,
    ws1End,
    '2026-09-01 00:00:00',
    '2026-09-30 23:59:59',
    ws1AttStart,
    ws1AttEnd,
    'Gedung FTI Lt. 2 Ruang Seminar',
    -0.91465,
    100.46072,
    150,
    5,
    0,
    'semua',
    'berlangsung',
    1,
    ws1Secret,
    1
  ).lastInsertRowid;

  // Workshop 2: Seminar Nasional
  const ws2Secret = crypto.randomBytes(16).toString('hex');
  const ws2Id = insertWorkshop.run(
    'Seminar Nasional Cybersecurity: Penetration Testing & Secure Web Architecture',
    'seminar-cybersecurity-pen-testing',
    'Pelatihan intensif keamanan siber, identifikasi kerentanan OWASP Top 10, ethical hacking beretika, dan pertahanan perimeter jaringan kampus.',
    'Derry Pratama, CEH, OSCP, Lead Security Analyst',
    'Senior Cyber Defense Consultant BSSN',
    'Badan Siber dan Sandi Negara (BSSN) & FTI UNAND',
    'E-Sertifikat TTE Resmi, Sertifikasi Kehadiran, Toolkit Pentesting, Merchandise',
    'Cyber Security',
    'SEMINAR',
    '2026-10-05 09:00:00',
    '2026-10-05 16:00:00',
    '2026-09-10 00:00:00',
    '2026-10-04 23:59:59',
    '2026-10-05 08:30:00',
    '2026-10-05 11:00:00',
    'Convention Hall Universitas Andalas',
    -0.91580,
    100.45780,
    100,
    3,
    0,
    'mahasiswa',
    'pendaftaran_dibuka',
    1,
    ws2Secret,
    1
  ).lastInsertRowid;

  // Workshop 3: Kuliah Umum (Completed - Unlimited Quota demo)
  const ws3Secret = crypto.randomBytes(16).toString('hex');
  const ws3Id = insertWorkshop.run(
    'Kuliah Umum Akbar: Next-Gen Web Development dengan Microservices & Docker',
    'kuliah-umum-nextgen-web-dev',
    'Kuliah umum berskala universitas mengenai rekayasa perangkat lunak modern, CI/CD pipeline, containerization Docker, dan clean architecture.',
    'Husnil Kamil, M.T & Tim Ahli Departemen SI',
    'Dosen & Peneliti FTI Universitas Andalas',
    'Departemen Sistem Informasi FTI UNAND',
    'E-Sertifikat TTE Terverifikasi SHA-256, Video Rekaman Kuliah, Repositori Source Code',
    'Software Engineering',
    'KULIAH_UMUM',
    '2026-08-20 09:00:00',
    '2026-08-20 16:30:00',
    '2026-08-01 00:00:00',
    '2026-08-19 23:59:59',
    '2026-08-20 08:30:00',
    '2026-08-20 17:00:00',
    'Auditorium Universitas Andalas',
    -0.91410,
    100.45620,
    200,
    1200,
    1, // Unlimited quota demo
    'semua',
    'selesai',
    1,
    ws3Secret,
    1
  ).lastInsertRowid;

  // 3. Registrations
  const insertReg = db.prepare(`
    INSERT INTO registrations (
      workshop_id, user_id, status, waiting_number, seat_number,
      attendance_status, attended_at, attendance_method, checkin_lat, checkin_lon, distance_meters
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReg.run(ws1Id, 5, 'TERDAFTAR', null, 'SEAT-01', 'HADIR', `${todayStr} 08:45:12`, 'DYNAMIC_QR_GEOFENCE', -0.91468, 100.46074, 8.5);
  insertReg.run(ws1Id, 6, 'TERDAFTAR', null, 'SEAT-02', 'BELUM_HADIR', null, null, null, null, null);
  insertReg.run(ws1Id, 7, 'TERDAFTAR', null, 'SEAT-03', 'BELUM_HADIR', null, null, null, null, null);
  insertReg.run(ws1Id, 8, 'TERDAFTAR', null, 'SEAT-04', 'BELUM_HADIR', null, null, null, null, null);
  insertReg.run(ws1Id, 10, 'TERDAFTAR', null, 'SEAT-05', 'BELUM_HADIR', null, null, null, null, null);
  // Kebijakan Baru: Tidak ada sistem waiting list. Jika kuota penuh, pendaftaran ditutup.
  db.prepare("DELETE FROM registrations WHERE status = 'WAITING_LIST'").run();

  const regWs3 = insertReg.run(
    ws3Id, 5, 'TERDAFTAR', null, 'A-08',
    'HADIR', '2026-08-20 09:15:00', 'DYNAMIC_QR_GEOFENCE', -0.91412, 100.45623, 12.3
  ).lastInsertRowid;

  const certNumber = 'UN16.FTI/WS.CERT/2026/08/0042';
  const certPayload = {
    certificateNumber: certNumber,
    recipientName: 'Ahmad Rasha Radya Aufa Lubis',
    nimOrOrg: '2311522008',
    workshopTitle: 'Kuliah Umum Akbar: Next-Gen Web Development dengan Microservices & Docker',
    issueDate: '2026-08-22',
    signerSekretariat: 'Husnil Kamil, M.T',
    signerRektor: 'Prof. Dr. Efa Yonnedi, S.E., M.P.A'
  };

  const { hash, signature } = signPayload(certPayload);

  db.prepare(`
    INSERT INTO certificates (
      certificate_number, registration_id, workshop_id, user_id,
      recipient_name, recipient_nim, workshop_title, issue_date, payload_hash, digital_signature,
      signer_sekretariat, signer_rektor, signer_mitra, issuer_type, approval_status,
      signed_at_rektor, template_name, status, public_verification_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    certNumber,
    regWs3,
    ws3Id,
    5,
    certPayload.recipientName,
    certPayload.nimOrOrg,
    certPayload.workshopTitle,
    certPayload.issueDate,
    hash,
    signature,
    certPayload.signerSekretariat,
    certPayload.signerRektor,
    'Departemen Sistem Informasi FTI UNAND',
    'UNAND',
    'VALID',
    '2026-08-22 10:00:00',
    'Template Resmi UNAND 2026',
    'VALID',
    `/validator?doc=${encodeURIComponent(certNumber)}`
  );

  db.prepare(`
    INSERT INTO audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    2,
    'sekretariat',
    'ISSUE_CERTIFICATE_TTE',
    'certificates',
    1,
    `Penerbitan E-Sertifikat TTE Kriptografis untuk Ahmad Rasha Radya Aufa Lubis (No: ${certNumber}) dengan SHA-256 Hash: ${hash}`
  );

  seedMasterData();
  console.log('[DB] Seeding completed successfully!');
}

// Run schema, migrations & seed
initCryptoKeys();
initSchema();
applyMigrations();
seedInitialData();

module.exports = {
  db,
  hashPassword
};
