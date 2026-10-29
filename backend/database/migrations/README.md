# Database Migrations - SIM Workshop UNAND

Folder ini diperuntukkan bagi berkas skema migrasi database MySQL.

## Panduan Migrasi

1. **Konfirmasi Desain**: Jangan membuat tabel sebelum ERD dan dokumen perancangan A3 disetujui bersama oleh tim.
2. **Konvensi Penamaan File**:
   - Format: `YYYYMMDD_HHMMSS_<aksi_nama_tabel>.sql`
   - Contoh: `20261029_001_create_roles_table.sql`
   - Contoh: `20261029_002_create_users_table.sql`
3. **Standar MySQL**:
   - Storage Engine: `InnoDB`
   - Character Set: `utf8mb4`
   - Collation: `utf8mb4_unicode_ci`
   - Primary Key: `id` (INT AUTO_INCREMENT atau UUID VARCHAR(36))
   - Timestamps: `created_at` dan `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

