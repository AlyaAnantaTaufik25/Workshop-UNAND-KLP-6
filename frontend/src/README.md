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

**Workshop Saya** (`/peserta/workshop-saya`) berisi workshop tersimpan dan
pendaftaran peserta dengan beragam kondisi. Coba daftar atau gabung waiting
list dari kartu workshop, batalkan lalu daftar kembali, dan isi presensi
online/offline melalui tombol pada kegiatan yang sesinya sedang dibuka.
Filter status dan mode membantu menemukan kondisi yang ingin dicoba.

Data contoh mencakup presensi belum dibuka, dibuka, ditutup, menunggu
verifikasi, ditolak (dapat diperbaiki), hadir valid, dan tidak hadir, serta
pendaftaran dan kegiatan yang dibatalkan. Data contoh baru ditambahkan ke
sesi browser lama tanpa menimpa perubahan pendaftaran yang telah disimpan.

`pages/peserta/workshopStates.js` menyimpan pesan dan aturan status bersama.
`WorkshopStatePanels.jsx` dipakai oleh detail workshop dan presensi di
Workshop Saya. `WorkshopRegistrationDialog.jsx` menyatukan konfirmasi daftar
dan pembatalan dari kedua halaman. `workshopStates.css` menyimpan gayanya.

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

## Sertifikat peserta

Menu **Sertifikat** mencakup daftar, detail sertifikat, pengajuan perbaikan,
riwayat, detail pengajuan, notifikasi, dan dokumen pengganti. Detail menampilkan
nama peserta, kegiatan, jenis, nomor, tanggal, penerbit, serta pratinjau.
Sertifikat hanya tersedia untuk kegiatan selesai dengan kehadiran tervalidasi.

- `/peserta/sertifikat`: daftar, pencarian, filter penerbit dan status perbaikan.
- `/peserta/sertifikat/:id`: detail, pratinjau, unduh, cetak, dan riwayat versi.
- `/peserta/sertifikat/:id/perbaikan`: formulir dan konfirmasi pengajuan.
- `/peserta/sertifikat/perbaikan`: riwayat dengan filter status dan sertifikat.
- `/peserta/sertifikat/perbaikan/:requestId`: rincian, tanggapan, timeline,
  pembatalan saat menunggu, pengajuan ulang, dan dokumen pengganti.
- `/peserta/sertifikat/notifikasi`: hasil perbaikan dan status dibaca.

Pengajuan dapat mencakup nama, gelar, informasi kegiatan, dan informasi lain.
Sertifikat tidak berubah saat peserta mengajukan. Hanya hasil penerbit dengan
status selesai yang membentuk versi pengganti; versi awal tetap dapat dibuka.
Pengajuan ganda diblokir saat menunggu/diproses. Contoh UNAND dan mitra
mencakup menunggu, diproses, selesai, dan ditolak, dengan dua notifikasi awal.

Pengajuan serta lampiran PDF/JPG/PNG maksimal 2 MB disimpan di localStorage.
Lampiran dapat diunduh lagi setelah reload. Kegagalan penyimpanan tidak
mengubah pengajuan. Data ini belum dikirim ke server atau tersambung ke
portal penerbit; tanggapan penerbit berasal dari contoh yang sudah disiapkan.

Unduhan menggunakan jsPDF yang dimuat saat dibutuhkan. Berkas berisi data
penerima saat sertifikat diterbitkan, nomor, kegiatan, serta tanggal, dan
ditandai sebagai dokumen contoh. Ini belum merupakan sertifikat bertanda
tangan elektronik dari server.

Jalankan pengujian aturan status, sertifikat, dan akses pertemuan dari folder `frontend`:

```sh
node --test src/pages/peserta/__tests__/*.test.js
```
