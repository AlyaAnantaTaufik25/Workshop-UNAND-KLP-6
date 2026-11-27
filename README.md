# Sistem Informasi Manajemen Workshop Universitas Andalas (UNAND)

Repositori ini berisi kode sumber aplikasi **Sistem Informasi Manajemen Workshop UNAND**, sebuah platform fullstack yang dirancang untuk mengelola seluruh siklus kegiatan workshop di lingkungan Universitas Andalas, mulai dari katalog acara, pendaftaran peserta, presensi berbasis QR dinamis & geofencing, hingga alur verifikasi dan tanda tangan elektronik (TTE) sertifikat oleh pimpinan.

Proyek ini menggunakan arsitektur **Monorepo** yang memisahkan folder `backend/` dan `frontend/` secara independen agar masing-masing pengembang dapat bekerja secara paralel dan efisien.

---

## 👥 Aktor Utama Sistem

Sistem mendukung 5 aktor dengan peran dan wewenang yang berbeda:

1. **Peserta**: Mahasiswa, dosen, atau masyarakat umum yang mendaftar, mengikuti kegiatan, melakukan presensi, dan mengunduh sertifikat.
2. **Humas UNAND**: Penyelenggara workshop, administrator kegiatan, verifikator pendaftar, dan pengaju sertifikat.
3. **Sekretariat Rektor**: Verifikator internal yang memeriksa, mengoreksi, dan menyetujui draf sertifikat sebelum diajukan ke pimpinan tertinggi.
4. **Rektor**: Pimpinan universitas yang memberikan persetujuan akhir (*final approval*) dan pembubuhan Tanda Tangan Elektronik (TTE) pada sertifikat.
5. **Mitra**: Pihak eksternal/internal kerja sama yang berkolaborasi dalam pelaksanaan workshop dan dapat memantau data kegiatan terkait.

---

## 📁 Struktur Direktori Repositori

```text
workshop-unand/
├── backend/                             # Ruang kerja Backend Developer (Node.js & Express)
│   ├── database/
│   │   ├── migrations/                  # Berkas skema migrasi database MySQL
│   │   └── seeders/                     # Berkas data awal (seed) pengembangan
│   ├── src/
│   │   ├── config/                      # Konfigurasi aplikasi dan koneksi MySQL (mysql2/promise)
│   │   │   ├── app.config.js
│   │   │   └── database.js
│   │   ├── middlewares/                 # Middleware auth, role, validasi, 404, dan errorHandler
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   ├── notFound.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   ├── modules/                     # Arsitektur modular berbasis fitur
│   │   │   ├── attendance/              # Presensi QR & Geofencing
│   │   │   ├── auth/                    # Autentikasi & JWT
│   │   │   ├── certificates/            # Template, Pengajuan, TTE Sertifikat
│   │   │   ├── locations/               # Gedung & Ruangan
│   │   │   ├── partners/                # Manajemen Mitra
│   │   │   ├── registrations/           # Pendaftaran & Waiting List
│   │   │   ├── reports/                 # Laporan & Dashboard
│   │   │   ├── roles/                   # Role & Hak Akses
│   │   │   ├── users/                   # Manajemen Pengguna
│   │   │   └── workshops/               # Manajemen Kegiatan Workshop
│   │   ├── routes/                      # Aggregator rute API (/api/v1)
│   │   │   └── api.routes.js
│   │   ├── utils/                       # Response formatter & logger
│   │   │   ├── logger.util.js
│   │   │   └── response.util.js
│   │   ├── app.js                       # Konfigurasi Express, CORS, middleware, rute
│   │   └── server.js                    # Entry point listener & graceful shutdown
│   ├── tests/                           # Pengujian otomatis backend
│   │   └── health.test.js               # Smoke test health-check API
│   ├── .env.example                     # Contoh environment variable backend
│   └── package.json                     # Dependency & scripts npm backend
│
├── frontend/                            # Ruang kerja Frontend Developer
│   ├── .env.example                     # Contoh environment variable frontend
│   └── README.md                        # Panduan inisialisasi framework, role, modul & kontrak API
│
├── docs/                                # Dokumentasi Proyek
│   └── api-contract.md                  # Spesifikasi kontrak RESTful API lengkap
│
├── .gitignore                           # Git ignore terpusat untuk backend & frontend
└── README.md                            # Panduan utama proyek & kolaborasi
```

---

## 🛠️ Pembagian Tanggung Jawab Tim

| Pengembang | Folder Tanggung Jawab | Deskripsi Tanggung Jawab |
|---|---|---|
| **Backend Developer** | `backend/`, `docs/api-contract.md` | Membangun RESTful API, skema MySQL, enkripsi/TTE, validasi input, middleware, dan mengupdate dokumen kontrak API. |
| **Frontend Developer** | `frontend/` | Menginisialisasi framework UI (React/Vite), membangun komponen antarmuka, manajemen state, integrasi API, dan UX responsif. |

---

## 🚀 Panduan Menjalankan Backend

### Prasyarat
- **Node.js** (versi 18.x atau yang lebih baru)
- **npm** (versi 9.x atau yang lebih baru)
- **MySQL** (melalui XAMPP, MySQL Server, atau Docker)

### Langkah Instalasi & Menjalankan

1. **Buka terminal dan masuk ke folder `backend`:**
   ```bash
   cd backend
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Siapkan Environment Variable:**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   # Di Windows PowerShell:
   Copy-Item .env.example .env

   # Atau di Linux / macOS / Git Bash:
   cp .env.example .env
   ```

4. **Setup Database MySQL Lokal:**
   - Jalankan MySQL (misalnya nyalakan service MySQL di kontrol panel XAMPP / Laragon).
   - Pertama kali (database kosong) — buat skema lalu isi data demo:
     ```bash
     npm run db:fresh     # HAPUS database, buat ulang dari semua migrasi, lalu isi data demo
     ```
   - Setelah `git pull` yang membawa perubahan skema — **data tidak hilang**:
     ```bash
     npm run db:migrate          # hanya menerapkan migrasi baru
     npm run db:migrate:status   # lihat migrasi yang sudah / belum diterapkan
     ```
   - **Migrasi bertahap:** setiap berkas di `database/migrations/` dijalankan sekali dan dicatat di tabel
     `schema_migrations`. Perubahan skema baru = berkas baru (mis. `004_tambah_kolom_x.sql`); jangan mengubah
     berkas migrasi yang sudah di-push. Berkas `.js` dipakai untuk migrasi data (`exports.up = async (conn) => {}`).
   - Akun demo hasil seed (kata sandi semua `password123`, PIN TTE Rektor/Mitra `123456`):
     `peserta@unand.ac.id`, `humas@unand.ac.id`, `sekretariat@unand.ac.id`, `mitra@unand.ac.id`, `rektor@unand.ac.id`
   - Pastikan konfigurasi di `backend/.env` telah sesuai:
     ```env
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=sim_workshop_unand
     ```

5. **Jalankan Backend Server:**
   - Mode Development (dengan hot reload menggunakan nodemon):
     ```bash
     npm run dev
     ```
   - Mode Production:
     ```bash
     npm start
     ```

6. **Output Terminal yang Diharapkan:**
   ```text
   ========================================================
      SISTEM INFORMASI MANAJEMEN WORKSHOP UNIVERSITAS ANDALAS
      Backend REST API Service
   ========================================================
   [Database] Terhubung ke MySQL: 127.0.0.1:3306 (sim_workshop_unand)
   [Server] Berjalan di port : http://localhost:5000
   [Health] Cek kesehatan API : http://localhost:5000/api/v1/health
   [Env]    Environment     : development
   --------------------------------------------------------
   ```

7. **Pengujian backend** (memakai database terpisah `sim_workshop_unand_test` yang dibuat ulang otomatis —
   database pengembangan tidak tersentuh):
   ```bash
   npm test   # login & penguncian, CSRF, audit, presensi QR + geofence, alur TTE, PDF & verifikasi, perbaikan
   ```

### Keamanan & fitur backend

| Fitur | Keterangan |
|---|---|
| Sesi login | Cookie `httpOnly` + `SameSite=Lax` (tidak bisa dibaca JavaScript). Klien API tetap boleh memakai header `Authorization: Bearer`. |
| Penguncian | 5× kata sandi / PIN TTE salah → dikunci 15 menit. Ditambah pembatas laju (rate limit) per IP. |
| CSRF | Permintaan pengubah data dari origin yang tidak terdaftar ditolak (403). |
| Audit log | Login, PIN, verifikasi, TTE (dengan hash SHA-256 dokumen), penerbitan, perbaikan — tabel `audit_logs`, halaman **Log Audit** (Humas, Sekretariat). |
| Berkas | Poster, bukti presensi, tanda tangan, lampiran disimpan di `backend/uploads/` (bukan base64 di database). |
| Sertifikat | PDF resmi dibuat server dengan QR → halaman publik `/verifikasi/<nomor>` + kode keaslian. |
| Notifikasi | Real-time (Server-Sent Events) + email (antrean `email_outbox`; isi `SMTP_*` di `.env` untuk mengirim sungguhan). |
| Pengingat | Peserta terdaftar diingatkan H-1 (lonceng + email); tombol "Tambah ke kalender" (.ics). |

---

## 🐳 Menjalankan dengan Docker (satu perintah)

Tidak perlu memasang MySQL/Node manual. Di folder root:

```bash
cp .env.docker.example .env      # ganti JWT_SECRET & sandi database untuk server sungguhan
docker compose up -d --build
```

Buka **http://localhost:8080**. Database terisi data demo otomatis saat pertama kali dijalankan; migrasi baru
diterapkan otomatis setiap container backend start. Data MySQL & berkas unggahan disimpan di volume Docker.

## ✅ CI (GitHub Actions)

Setiap push / pull request ke `main` menjalankan `.github/workflows/ci.yml`: lint + unit test + build frontend,
test backend dengan MySQL, lalu smoke test E2E di Chrome (semua halaman 5 portal + cek aksesibilitas WCAG 2.1 AA).
Bila ada yang merah, perubahan tersebut merusak sesuatu — periksa log job yang gagal.

---

## 🔍 Cara Menguji Endpoint Health

1. **Melalui Browser:**
   Buka URL berikut:
   ```text
   http://localhost:5000/api/v1/health
   ```

2. **Melalui cURL / Terminal:**
   ```bash
   curl -X GET http://localhost:5000/api/v1/health
   ```

3. **Melalui Pengujian Otomatis Bawaan:**
   Di terminal folder `backend`:
   ```bash
   npm test
   ```

---

## 🎨 Panduan Memulai untuk Frontend Developer

Frontend memakai **React 19 + Vite + React Router**.

1. Pasang dependensi dan jalankan server pengembangan (backend harus sudah berjalan):
   ```bash
   cd frontend
   npm install
   npm run dev          # http://localhost:5173
   ```
2. Salin `.env.example` menjadi `.env` bila alamat API berbeda:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```
3. Akun demo (setelah `npm run db:seed` di backend): `peserta|humas|sekretariat|mitra|rektor@unand.ac.id`, kata sandi `password123`, PIN TTE `123456`.

### Pemeriksaan kualitas

```bash
npm run lint         # oxlint (harus 0 error)
npm test             # unit test portal peserta
npm run build        # build produksi
npm run test:e2e     # smoke test E2E: login, semua halaman 5 portal, tampilan HP, alur tanda tangan
```

`test:e2e` memakai Chrome/Edge yang sudah terpasang (tanpa unduh browser). Backend & frontend harus berjalan
dan database sudah di-seed. Lokasi browser bisa diatur dengan `CHROME_PATH`, alamat dengan `BASE_URL` / `API_URL`.

### Komponen bersama

- `components/PageHeader`, `BackButton`, `Sidebar`, `Select`, `Dialog` (konfirmasi & toast), `PosterDropzone`
- `components/design-language.css` — bahasa desain seragam untuk semua portal
- `hooks/useApi`, `useUrlState` (filter tersimpan di URL), `useAutoRefresh`, `useUnsavedChanges`
- `utils/excel.js` (ekspor .xlsx), `utils/periode.js` (filter periode)

---

## 🌿 Aturan Branch & Kolaborasi Git

Untuk menjaga kebersihan riwayat Git dan mencegah konflik kode:

### 1. Struktur Branch
- `main`: Branch produksi yang stabil dan hanya berisi kode yang sudah diuji & ditinjau.
- `develop`: Branch integrasi utama seluruh fitur baru.
- `feature/be-<nama-fitur>`: Branch untuk pengembangan fitur backend (misal: `feature/be-auth`, `feature/be-workshops`).
- `feature/fe-<nama-fitur>`: Branch untuk pengembangan fitur frontend (misal: `feature/fe-login-ui`, `feature/fe-catalog`).
- `bugfix/<nama-bug>`: Branch untuk perbaikan kendala tertentu.

### 2. Standar Commit Message
Gunakan konvensi *Conventional Commits*:
- `feat: tambah modul registrasi peserta`
- `fix: perbaiki validasi token jwt pada middleware`
- `docs: perbarui spesifikasi endpoint di api-contract`
- `chore: update dependencies backend`

### 3. Alur Kerja Pull Request (PR)
1. Selalu buat branch baru dari `develop`.
2. Lakukan commit teratur dan jelas.
3. Push branch ke GitHub dan ajukan Pull Request ke branch `develop`.
4. Review oleh rekan tim sebelum di-merge.

