# Struktur Frontend

Halaman dan kode khusus role dikerjakan di folder role masing-masing:

```text
src/
  App.jsx
  main.jsx
  index.css
  components/
    BackButton.jsx
    Layout.jsx
    LayoutHumas.jsx
    LayoutRektor.jsx
  data/
    mockData.js
  pages/
    Login.jsx
    login.css
    peserta/
      LayoutPeserta.jsx
      components.jsx
      data.js
      peserta.css
    humas/
      LayoutHumas.jsx
      components/TambahKegiatanModal.jsx
      data.js
      humas.css
    sekretariat/
      LayoutSekretariat.jsx
      utils/exportHelper.js
      data.js
      sekretariat.css
    rektor/
      LayoutRektor.jsx
      data.js
      rektor.css
```

File halaman tetap berada di folder role masing-masing. Daftar di atas hanya
merangkum file pendukungnya.

- `App.jsx` tetap mengatur routing seluruh role.
- Tiga file `components/Layout*.jsx` hanya meneruskan export ke layout role,
  sehingga lokasi import di `App.jsx` tetap kompatibel. Edit layout di folder role.
- `data/mockData.js` menyimpan data kegiatan, presensi, sertifikat, dan dokumen
  bersama. Data profil dan data tampilan khusus role berada di `pages/<role>/data.js`.
- `index.css` menyimpan reset, warna dasar, dan gaya komponen bersama.
- CSS khusus humas, sekretariat, dan rektor diimpor oleh layout role. Gunakan
  awalan `:where(.role-humas)`, `:where(.role-sekretariat)`, atau
  `:where(.role-rektor)` untuk membatasi gaya ke role tersebut.
- CSS peserta tetap menggunakan awalan `.peserta-`. Login dan `BackButton`
  tetap dipakai bersama.
- Portal mitra belum memiliki implementasi frontend tersendiri.

## Kondisi pendaftaran dan presensi peserta

Menu **Pratinjau Kondisi** (`/peserta/pratinjau-kondisi`) menampilkan 11 kondisi
pendaftaran dan 14 kondisi presensi. Pilih kondisi, metode offline/online, dan
hasil simulasi berhasil/gagal untuk mencoba formulir, konfirmasi, pengiriman,
serta pembatalan. Simulasi ini terpisah dari data Workshop Saya.

`pages/peserta/workshopStates.js` menyimpan pesan dan aturan status bersama.
`WorkshopStatePanels.jsx` dipakai oleh pratinjau, detail workshop, dan presensi
di Workshop Saya. `workshopStates.css` menyimpan gaya tambahannya.

- Pendaftaran: belum dibuka, dibuka, segera tutup, penuh, waiting list tersedia,
  ditutup, terdaftar, dalam antrean, pendaftaran dibatalkan, workshop dibatalkan,
  dan selesai.
- Presensi: belum terdaftar, waiting list, belum dibuka, dibuka, ditutup,
  menunggu verifikasi, hadir valid, ditolak, tidak hadir, dibatalkan, izin lokasi
  ditolak, di luar radius, kode tidak valid, dan gagal menyimpan.
- Form offline menerima kode sesi dari QR panitia dan koordinat browser.
  Form online memvalidasi pilihan bukti JPG/PNG/PDF, maksimal 2 MB.

Fitur ini masih prototipe frontend. Status pendaftaran dan metadata presensi
disimpan di localStorage; berkas belum diunggah ke server. Validasi token QR,
radius lokasi, verifikasi panitia, dan alokasi kursi lintas peserta memerlukan
integrasi endpoint backend yang masih berstatus PLANNED. Jadwal dan kondisi
contoh pada `data.js` bersifat statis untuk demonstrasi tampilan.

Jalankan pengujian aturan status dan akses pertemuan dari folder `frontend`:

```sh
node --test src/pages/peserta/__tests__/*.test.js
```
