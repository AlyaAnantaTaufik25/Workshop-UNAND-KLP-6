-- ========================================================
-- 002 — Keamanan login & PIN, audit log, antrean email,
--       notifikasi per instansi mitra, pengingat H-1.
-- Migrasi bertahap: TIDAK menghapus data yang sudah ada.
-- ========================================================

-- Penguncian sementara setelah percobaan gagal berulang
ALTER TABLE `users`
  ADD COLUMN `login_failed_count` INT NOT NULL DEFAULT 0 AFTER `pin_hash`,
  ADD COLUMN `login_locked_until` DATETIME NULL AFTER `login_failed_count`,
  ADD COLUMN `pin_failed_count` INT NOT NULL DEFAULT 0 AFTER `login_locked_until`,
  ADD COLUMN `pin_locked_until` DATETIME NULL AFTER `pin_failed_count`,
  ADD COLUMN `last_login_at` DATETIME NULL AFTER `pin_locked_until`;

-- Jejak audit tindakan penting (login, TTE, verifikasi, persetujuan, penerbitan)
CREATE TABLE `audit_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `user_nama` VARCHAR(150) NULL,
  `user_role` VARCHAR(30) NULL,
  `action` VARCHAR(60) NOT NULL,
  `entity` VARCHAR(60) NULL,
  `entity_id` INT NULL,
  `description` VARCHAR(500) NULL,
  `ip` VARCHAR(64) NULL,
  `user_agent` VARCHAR(300) NULL,
  `doc_hash` CHAR(64) NULL COMMENT 'SHA-256 isi dokumen saat ditandatangani',
  `meta` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_entity` (`entity`, `entity_id`),
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Antrean email (dikirim oleh worker; tanpa SMTP dicatat sebagai 'logged')
CREATE TABLE `email_outbox` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `to_email` VARCHAR(150) NOT NULL,
  `to_name` VARCHAR(150) NULL,
  `subject` VARCHAR(200) NOT NULL,
  `body_text` TEXT NOT NULL,
  `body_html` MEDIUMTEXT NULL,
  `status` ENUM('pending', 'sent', 'failed', 'logged') NOT NULL DEFAULT 'pending',
  `attempts` INT NOT NULL DEFAULT 0,
  `last_error` VARCHAR(500) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sent_at` DATETIME NULL,
  INDEX `idx_outbox_status` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifikasi peran Mitra hanya untuk instansi terkait
ALTER TABLE `notifications`
  ADD COLUMN `partner_id` INT NULL AFTER `user_id`,
  ADD INDEX `idx_notif_partner` (`partner_id`);

-- Pengingat H-1 kegiatan (dikirim sekali per pendaftaran)
ALTER TABLE `registrations`
  ADD COLUMN `reminder_sent_at` DATETIME NULL;
