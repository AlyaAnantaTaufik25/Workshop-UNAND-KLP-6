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
