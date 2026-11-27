# Migrasi Database — SIM Workshop UNAND

Migrasi bersifat **bertahap**: setiap berkas dijalankan **sekali**, berurutan menurut nama, dan dicatat di tabel
`schema_migrations`. Menjalankan `npm run db:migrate` lagi hanya menerapkan berkas baru — data tidak hilang.

| Perintah | Fungsi |
|---|---|
| `npm run db:migrate` | Terapkan migrasi yang belum dijalankan |
| `npm run db:migrate:status` | Daftar migrasi `[x]` sudah / `[ ]` belum |
| `npm run db:fresh` | **Hapus** database, buat ulang dari semua migrasi, isi data demo (khusus pengembangan; diblokir di production) |

## Menambah perubahan skema

1. Buat berkas baru dengan nomor berikutnya, mis. `004_tambah_kolom_telepon_mitra.sql`.
2. Tulis perubahan **bertambah** (`ALTER TABLE ... ADD COLUMN`, `CREATE TABLE`) — jangan `DROP` tabel berisi data.
3. **Jangan mengubah berkas migrasi yang sudah di-push** — anggota tim lain sudah menjalankannya.
4. Perlu memindahkan/mengubah data? Pakai berkas `.js`:
   ```js
   module.exports.up = async (conn) => { await conn.query('UPDATE ...'); };
   ```

## Riwayat

| Berkas | Isi |
|---|---|
| `001_initial_schema.sql` | Skema awal 13 tabel |
| `002_keamanan_audit_email.sql` | Penguncian login/PIN, `audit_logs`, `email_outbox`, notifikasi per instansi mitra, pengingat H-1 |
| `003_pindahkan_berkas_ke_disk.js` | Memindahkan berkas base64 lama dari database ke `uploads/` |

Standar: InnoDB, `utf8mb4` / `utf8mb4_unicode_ci`.
