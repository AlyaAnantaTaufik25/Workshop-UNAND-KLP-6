-- ========================================================
-- TEMPLATE MIGRASI DATABASE: SIM WORKSHOP UNAND
-- Catatan: Eksekusi setelah ERD dan dokumen perancangan A3 final
-- ========================================================

CREATE DATABASE IF NOT EXISTS `sim_workshop_unand` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `sim_workshop_unand`;

-- Contoh struktur tabel roles (5 Aktor Utama)
-- CREATE TABLE IF NOT EXISTS `roles` (
--   `id` INT AUTO_INCREMENT PRIMARY KEY,
--   `name` VARCHAR(50) NOT NULL UNIQUE,
--   `description` VARCHAR(255) NULL,
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

