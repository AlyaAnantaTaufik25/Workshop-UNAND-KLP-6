-- ========================================================
-- SKEMA DATABASE: SIM WORKSHOP UNAND
-- Dijalankan oleh `npm run db:migrate` (database/migrate.js).
-- Urutan DROP mengikuti dependensi foreign key.
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `certificate_corrections`;
DROP TABLE IF EXISTS `certificates`;
DROP TABLE IF EXISTS `certificate_submissions`;
DROP TABLE IF EXISTS `certificate_templates`;
DROP TABLE IF EXISTS `attendance_tokens`;
DROP TABLE IF EXISTS `attendances`;
DROP TABLE IF EXISTS `registrations`;
DROP TABLE IF EXISTS `workshops`;
DROP TABLE IF EXISTS `locations`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `partners`;
DROP TABLE IF EXISTS `roles`;
SET FOREIGN_KEY_CHECKS = 1;

-- 5 aktor utama sistem
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Instansi mitra kerja sama
CREATE TABLE `partners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(150) NOT NULL UNIQUE,
  `jenis` ENUM('Internal', 'Eksternal') NOT NULL DEFAULT 'Eksternal',
  `penanggung_jawab` VARCHAR(120) NULL,
  `email` VARCHAR(150) NULL,
  `kontak` VARCHAR(40) NULL,
  `bidang_usaha` VARCHAR(150) NULL,
  `alamat` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT NOT NULL,
  `partner_id` INT NULL,
  `nama` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(100) NOT NULL,
  `telepon` VARCHAR(30) NULL,
  `jenis_peserta` VARCHAR(30) NULL COMMENT 'Mahasiswa / Dosen / Umum / Profesional',
  `nim` VARCHAR(30) NULL,
  `prodi` VARCHAR(100) NULL,
  `nip` VARCHAR(40) NULL,
  `jabatan` VARCHAR(120) NULL,
  `unit_kerja` VARCHAR(150) NULL,
  `pin_hash` VARCHAR(100) NULL COMMENT 'PIN tanda tangan elektronik (rektor & mitra)',
  `status` ENUM('Aktif', 'Nonaktif') NOT NULL DEFAULT 'Aktif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `fk_users_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gedung & ruangan beserta titik geofence presensi
CREATE TABLE `locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `gedung` VARCHAR(120) NOT NULL,
  `ruangan` VARCHAR(120) NOT NULL,
  `lokasi` VARCHAR(255) NULL,
  `latitude` DECIMAL(10, 7) NULL,
  `longitude` DECIMAL(10, 7) NULL,
  `radius` INT NOT NULL DEFAULT 100 COMMENT 'meter',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_locations` (`gedung`, `ruangan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `workshops` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(160) NOT NULL UNIQUE,
  `nama` VARCHAR(200) NOT NULL,
  `jenis` VARCHAR(40) NOT NULL DEFAULT 'Workshop',
  `mode` ENUM('offline', 'online') NOT NULL DEFAULT 'offline',
  `tema` VARCHAR(100) NULL,
  `ringkasan` VARCHAR(300) NULL,
  `deskripsi` TEXT NULL,
  `manfaat` TEXT NULL,
  `target_peserta` VARCHAR(255) NULL,
  `pemateri` VARCHAR(255) NULL,
  `pemateri_peran` VARCHAR(150) NULL,
  `partner_id` INT NULL,
  `penyelenggara` VARCHAR(150) NOT NULL DEFAULT 'Universitas Andalas',
  `sumber` ENUM('UNAND', 'Mitra') NOT NULL DEFAULT 'UNAND',
  `location_id` INT NULL,
  `tempat` VARCHAR(255) NULL COMMENT 'Teks lokasi bebas bila tidak memakai data gedung',
  `meeting_url` VARCHAR(255) NULL,
  `tanggal_mulai` DATE NOT NULL,
  `tanggal_selesai` DATE NOT NULL,
  `waktu_mulai` TIME NULL,
  `waktu_selesai` TIME NULL,
  `pembukaan` DATE NULL COMMENT 'Pembukaan pendaftaran',
  `penutupan` DATE NULL COMMENT 'Penutupan pendaftaran',
  `kuota` INT NULL COMMENT 'NULL = tidak terbatas',
  `waiting_list` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('draft', 'publik', 'berlangsung', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'draft',
  `status_pendaftaran` ENUM('belum-dibuka', 'dibuka', 'segera-ditutup', 'ditutup') NOT NULL DEFAULT 'dibuka',
  `status_presensi` ENUM('belum-dibuka', 'dibuka', 'ditutup') NOT NULL DEFAULT 'belum-dibuka',
  `image_url` VARCHAR(500) NULL,
  `poster` LONGTEXT NULL COMMENT 'Data URL poster unggahan',
  `created_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_workshops_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_workshops_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_workshops_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `workshop_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `status` ENUM('terdaftar', 'waiting', 'dibatalkan', 'selesai') NOT NULL DEFAULT 'terdaftar',
  `queue_no` INT NULL,
  `registered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cancelled_at` DATETIME NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_registration` (`workshop_id`, `user_id`),
  CONSTRAINT `fk_reg_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reg_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Satu baris per peserta per hari kegiatan
CREATE TABLE `attendances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `registration_id` INT NOT NULL,
  `tanggal` DATE NOT NULL,
  `status` ENUM('pending', 'hadir', 'ditolak', 'tidak-hadir') NOT NULL DEFAULT 'pending',
  `method` ENUM('qr-location', 'upload', 'manual') NOT NULL DEFAULT 'qr-location',
  `latitude` DECIMAL(10, 7) NULL,
  `longitude` DECIMAL(10, 7) NULL,
  `file_name` VARCHAR(255) NULL,
  `file_data` LONGTEXT NULL,
  `alasan_tolak` VARCHAR(500) NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `verified_at` DATETIME NULL,
  `verified_by` INT NULL,
  UNIQUE KEY `uq_attendance_day` (`registration_id`, `tanggal`),
  CONSTRAINT `fk_att_registration` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_verifier` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Token QR presensi dinamis
CREATE TABLE `attendance_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `workshop_id` INT NOT NULL,
  `token` VARCHAR(20) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `created_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_token_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `certificate_templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(150) NOT NULL,
  `desain_key` VARCHAR(40) NULL,
  `kategori` VARCHAR(80) NULL,
  `penerbit` VARCHAR(150) NOT NULL DEFAULT 'UNAND',
  `partner_id` INT NULL COMMENT 'Pemilik template bila diunggah mitra',
  `workshop_id` INT NULL COMMENT 'Kegiatan terkait',
  `status` ENUM('dapat-dipakai', 'dipakai', 'diterbitkan') NOT NULL DEFAULT 'dapat-dipakai',
  `orientasi` VARCHAR(40) NULL DEFAULT 'Lanskap (A4)',
  `warna_utama` VARCHAR(10) NULL,
  `deskripsi` VARCHAR(500) NULL,
  `berkas_nama` VARCHAR(255) NULL,
  `berkas_data` LONGTEXT NULL,
  `ukuran` VARCHAR(40) NULL,
  `is_library` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Desain bawaan Humas',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_tpl_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tpl_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengajuan sertifikat per kegiatan (alur TTE: mitra -> rektor -> terbit)
CREATE TABLE `certificate_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `workshop_id` INT NOT NULL UNIQUE,
  `template_id` INT NULL,
  `nomor_sk` VARCHAR(80) NULL,
  `perlu_mitra` TINYINT(1) NOT NULL DEFAULT 1,
  `perlu_rektor` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('menunggu-mitra', 'menunggu-rektor', 'diterbitkan') NOT NULL DEFAULT 'menunggu-mitra',
  `tanggal_pengajuan` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `diajukan_oleh` INT NULL,
  `mitra_signed_at` DATETIME NULL,
  `mitra_signed_by` INT NULL,
  `mitra_signature` LONGTEXT NULL,
  `rektor_signed_at` DATETIME NULL,
  `rektor_signed_by` INT NULL,
  `rektor_signature` LONGTEXT NULL,
  `catatan` VARCHAR(500) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_sub_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_template` FOREIGN KEY (`template_id`) REFERENCES `certificate_templates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sub_submitter` FOREIGN KEY (`diajukan_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sub_mitra_signer` FOREIGN KEY (`mitra_signed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sub_rektor_signer` FOREIGN KEY (`rektor_signed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sertifikat individual peserta
CREATE TABLE `certificates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(40) NOT NULL UNIQUE COMMENT 'ID publik sertifikat',
  `workshop_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `nomor` VARCHAR(80) NOT NULL UNIQUE,
  `nama_penerima` VARCHAR(150) NOT NULL,
  `gelar` VARCHAR(60) NULL,
  `info_tambahan` VARCHAR(500) NULL,
  `jenis` VARCHAR(40) NOT NULL DEFAULT 'Workshop',
  `issued_at` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_cert_owner` (`workshop_id`, `user_id`),
  CONSTRAINT `fk_cert_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cert_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pengajuan perbaikan sertifikat & dokumen pengganti
CREATE TABLE `certificate_corrections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(60) NOT NULL UNIQUE,
  `certificate_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `status` ENUM('menunggu', 'diproses', 'selesai', 'ditolak', 'dibatalkan') NOT NULL DEFAULT 'menunggu',
  `changes` JSON NOT NULL,
  `reason` TEXT NOT NULL,
  `attachment` LONGTEXT NULL COMMENT 'JSON {name,type,size,dataUrl}',
  `issuer_note` VARCHAR(500) NULL,
  `replacement_number` VARCHAR(100) NULL,
  `replacement_issued` DATE NULL,
  `tte_status` ENUM('tidak-perlu', 'sedang-diproses', 'selesai') NOT NULL DEFAULT 'tidak-perlu' COMMENT 'TTE ulang dokumen pengganti oleh rektor',
  `tte_signed_at` DATETIME NULL,
  `tte_signed_by` INT NULL,
  `notification_read` TINYINT(1) NOT NULL DEFAULT 1,
  `events` JSON NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_corr_certificate` FOREIGN KEY (`certificate_id`) REFERENCES `certificates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_corr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_corr_signer` FOREIGN KEY (`tte_signed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifikasi per role (role_code) atau per user
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_code` VARCHAR(30) NULL,
  `user_id` INT NULL,
  `judul` VARCHAR(200) NOT NULL,
  `deskripsi` VARCHAR(500) NULL,
  `link` VARCHAR(255) NULL,
  `read_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
