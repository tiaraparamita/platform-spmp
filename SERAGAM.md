# Seragam di proyek ini

Proyek ini memakai **token** Design System Seragam (versi **0.19.0**, `tokens/seragam.css`). Komponennya ditulis dengan HTML dan CSS sendiri di `style.css` karena proyek ini tanpa React, Tailwind, atau proses build. Sumber: https://github.com/titohnf/seragamds dan https://seragam.belajar.id.

## Yang dipakai

- **Token warna, elevasi, radius** lewat `var(--sd-*)` (mis. `var(--sd-blue-70)`, `var(--sd-gray-60)`).
- **Tipografi semantik** lewat `var(--sd-text-<nama>-size|line|weight)` (mis. `--sd-text-body-size`). Nilainya mengikuti atribut `data-sd-platform` pada `<html>`:
  - `desktop` (dipakai di sini): selalu skala Desktop (body 16/24, bodysmall 14/20, action 16/24, headingmedium 19/24). Sesuai keputusan produk web desktop (DECISIONS Seragam 2026-11-10 dan 2026-11-11).
  - `mobile`: selalu skala Mobile. `auto` (atau tanpa atribut): Mobile di bawah 1024px, Desktop mulai 1024px.
  - Untuk membuat tampilan seluler memakai skala Mobile cukup ganti `desktop` menjadi `auto` di `index.html`; tidak perlu mengubah `style.css`.
- Jangan menulis ukuran huruf angka atau hex baru: pakai token.

## Memperbarui Seragam

1. Lihat perubahan yang memengaruhi pemakai: [panduan migrasi](https://github.com/titohnf/seragamds/blob/main/docs/MIGRASI.md) dan CHANGELOG.
2. Ambil `tokens/seragam.css` dari rilis (ganti `X.Y.Z`):
   ```sh
   curl -sL -o /tmp/seragam.tgz https://github.com/titohnf/seragamds/releases/download/vX.Y.Z/seragam-design-system-X.Y.Z.tgz
   tar -xzf /tmp/seragam.tgz -C /tmp package/tokens/seragam.css
   cp /tmp/package/tokens/seragam.css tokens/seragam.css
   ```
3. Naikkan parameter versi aset di `index.html` (`?v=...`) supaya peramban tidak memakai berkas lama, dan ubah nomor versi di berkas ini.
4. Token Seragam hanya bertambah antar-rilis (sejauh ini tidak ada yang dihapus atau berubah nilainya); periksa CHANGELOG untuk pengecualian.

## Belum selaras dengan Seragam (perlu keputusan desain)

- **Warna kustom**: sudah diganti ke token Seragam (19 warna dari 20; 25 pemakaian). Sisanya hanya `#45B9C2` pada poster mini dekoratif dan 8 `rgba()` untuk bayangan dan latar belakang modal. Pemetaan: aksi `#155EEF` ke `--sd-blue-70`; teks abu kebiruan ke `--sd-gray-60/70/90`; garis ke `--sd-modal-footer-border`; latar biru muda ke `--sd-blue-5/10`; banner pengingat ke `--sd-yellow-0` (latar), `--sd-warning-surface` (tepi dan hover), `--sd-text-warning` (teks); hijau ke `--sd-text-success`. Pergeseran warna terbesar: teks kuning keemasan menjadi cokelat `#8B5104` dan abu kebiruan menjadi abu netral. Kontras semua pengganti sama atau lebih baik dari warna lama.
- **Ukuran huruf di luar skala** (selain poster mini dekoratif): 11, 13, 15, 21, 23, dan 26px di bagian Menetapkan dan ringkasan akar masalah. Skala Desktop Seragam: 12, 14, 16, 17, 19, 22, 24, 28, 32.
- **Komponen buatan sendiri, hasil ukur di 1440px (delapan keadaan halaman):**

  | Komponen | Terukur di proyek | Seragam (Desktop) | Selaras? |
  |---|---|---|---|
  | Badge | 24px, 14/20 semibold, pill | 24px, 14/20 semibold, pill | ya |
  | Header tabel | 14/16 semibold kapital (sebagian 12/18,6) | 14/16 semibold kapital | sebagian |
  | Sel tabel | 16/24 (sebagian 14/21,7) | 16/24 | sebagian |
  | Navbar | tinggi 64px | tinggi 64px | ya |
  | Tombol | tinggi 28, 34, 42, 44, 46, 56px; teks 14/18,2 sampai 16/24; radius 0, 4, dan 8px | lg 48, md 40, sm 28; teks 16/24 (sm 14/20); radius 4 | **tidak seragam**; hanya `sm` 28px dan satu tombol 46px yang dekat |
  | Isian, tab, dialog, rel langkah | tidak terukur dalam audit ini | lihat panduan komponen | belum dicek |

  Tombol adalah yang paling beragam dan paling terlihat; menyeragamkannya (tinggi, ukuran teks, radius) adalah langkah berikutnya yang paling berdampak, tetapi mengubah tampilan sehingga perlu keputusan desain.

## Komponen bersama (`sd-ui.js` dan `sd-ui.css`)

Tombol, pilihan radio, select, dan tabel dibuat lewat fungsi bantu agar selalu sesuai spesifikasi Seragam. Jangan menulis `<button>`, `<select>`, atau `<table>` dengan kelas sendiri untuk kontrol baru.

| Fungsi | Untuk | Catatan |
|---|---|---|
| `sdBtn(label, {variant (termasuk `destructive-secondary`), size, onclick, leadingIcon, trailingIcon, icon, fullWidth, disabled, className})` | Button | `variant`: `ultimate` (aksi utama), `primary`, `secondary`, `quiet`, `destructive`. `size`: `lg`, `md` (bawaan), `sm`. Ikon panah lewat `leadingIcon`/`trailingIcon`, bukan karakter di teks. |
| `sdRadioGroup({legend, name, options, value, onchange})` | Pilihan tunggal, kurang dari 5 opsi | `options`: `[{value, label, help}]`. Berbentuk fieldset dan legend. |
| `sdSelect({label, options, value, onchange, hideLabel})` | Select | Label selalu ada; `hideLabel` bila kolom tabel sudah menjelaskan. |
| `sdTable({caption, columns, rows})` | Tabel | `caption` wajib. Baris berupa larik sel, atau `{full: html}` untuk satu sel selebar tabel. |
| `sdBadge(label, tone)` | Badge status | `tone`: `green` (selesai), `amber` (perlu perhatian), `red` (gagal), `blue` (informasi), `gray` (draf, belum dimulai). Teks 1–2 kata. |
| `sdBanner({tone, title, children, onClose})` | Banner statis | `tone`: `info` (bawaan), `warning`, `success`, `critical`, `neutral`. Bukan untuk banner ajakan (entry). |
| `sdTabs({label, items, value, onselect})` | Tabs (satu aktif, tetap di halaman) | `items`: `[{value, label, count}]`; `onselect(value)` mengembalikan string JavaScript. Keyboard: panah kiri/kanan, Home, End. |
| `sdCheckbox({label, ariaLabel, checked, onchange})` | Checkbox | Wajib label terlihat atau `ariaLabel`. |
| `sdTextField({label, id, value, placeholder, helper, error, trailing, optional})` | Kolom isian teks | `trailing`: tombol di kanan kolom. |
| `sdTextArea({label, id, value, helper, oninput})` | Area teks | Helper tampil di bawah label. |
| `sdIcon(nama)` | Ikon | `arrow-left`, `arrow-right`, `check`, `arrow-drop-down`, `info`, `warning`, `check-circle`, `error`, `close`, `add`. Tambah jalurnya di `sd-ui.js` bila perlu. |

Kelas bantu di `sd-ui.css`: `sd-cell-title` dan `sd-cell-sub` (isi sel tabel), `sd-status` (status kecil dengan ikon), `sd-sr-only`.

### Pemeriksa

`node scripts/seragam-lint.mjs` menghitung pelanggaran umum (ukuran huruf angka, berat 700, hex dan rgb langsung, panah di teks, select/tabel/tombol mentah) dan **gagal bila jumlahnya naik** dibanding `scripts/seragam-lint-baseline.json`. Tambah `--detail` untuk melihat lokasi. Setelah memigrasi satu halaman, jalankan `--update` agar batasnya ikut turun.

Status migrasi: Evaluasi Diri dan beranda Siklus 6M (daftar siklus, banner ajakan, menu ⋮), Menetapkan (tabel indikator, tab dimensi, panel pilihan, banner pengingat; dialog target belum), Memetakan (kartu akar masalah dengan checkbox dan text field), Merencanakan (kegiatan rekomendasi, formulir kegiatan, rincian anggaran, pemilih bulan), serta tombol navigasi, status simpan, dan banner bersama di semua tahap alur sudah memakai semua fungsi bantu. Judul halaman (`page-title-banner`) mengikuti PageHeader `tone="blue"`: judul 24/28 semibold, penjelasan maksimal 68 karakter per baris. Semua badge di seluruh halaman sudah memakai `sdBadge` (fungsi `badge(teks)` di `app.js` hanya pembungkus yang memetakan status ke tone). Tombol, tabel, dan select di halaman lain masih memakai versi lama. Kelas `.badge`, `.green`, `.amber`, `.red` di `style.css` sudah tidak dipakai badge dan boleh dihapus bertahap. Halaman lain masih memakai tombol, tabel, dan select lama.

## Alur 6M: stepper, pratinjau rencana, dan accordion per indikator

Langkah 1 sampai 3 (indikator dan target, akar masalah, kegiatan) saling bergantung. Konteks dibawa oleh stepper (di langkah mana) dan pratinjau rencana (apa yang sedang dibangun).

- **Banner biru seperti semula**: breadcrumb, judul, dan pengantar langkah di banner penuh lebar, dengan stepper putih menimpa bagian bawahnya. Judul dan pengantar memakai gaya asli (judul 28/36 semibold, pengantar satu baris sampai 1000px); tidak ada bilah kemajuan di badan halaman.
- **Stepper horizontal** (`flowStepper()`): enam langkah dengan status (Selesai, Sedang dikerjakan, Belum lengkap, Belum dimulai); langkah sebelumnya bisa diklik untuk kembali. Menjawab "saya di langkah mana".
- **Pratinjau "Rencana Anda" di pop-up** (`flowPreview()`, `flowPlanButton()`, langkah 1 sampai 3): menjawab "apa yang sedang saya bangun" tanpa memakan ruang area kerja. Tombol "Lihat rencana Anda" ada di kanan atas banner dan membuka Popover (Esc atau klik di luar menutup). Isinya kerangka rantai Indikator, Akar masalah, Kegiatan (kotak putus-putus bertanda "langkah 2" dan "langkah 3" untuk yang belum diisi) yang terisi seiring pilihan dan berubah langsung walau pop-up terbuka (`refreshFlow()`); legenda tiga bagian menyorot tingkat yang sedang dikerjakan; klik simpul menutup pop-up dan menggulir ke bagian itu. Langkah 4 sampai 6 tidak punya tombol ini.
- **Accordion per indikator** di langkah 2 dan 3 (`sdAccordion`), dengan judul yang sama: nomor atau tanda lengkap, nama indikator, badge tingkat, dan ringkasan ("1 akar masalah dipilih", "2 akar masalah, 1 kegiatan"). Satu terbuka pada satu waktu; yang pertama belum lengkap terbuka otomatis. Di dasar tiap accordion ada tautan kembali ke langkah sebelumnya dan tombol "Lanjut ke [indikator berikutnya]".
- **Langkah 3 dikelompokkan per akar masalah** (`chainRootGroup()`): kegiatan rekomendasi dan kegiatan sendiri selalu menjawab akar masalah kelompoknya.
- **Baca dulu, baru pilih.** Di semua daftar pilihan langkah 1 sampai 3, isi yang perlu dibaca ada di kiri dan kontrol pilih di ujung kanan baris (kolom "Pilihan" di tabel, sisi kanan kartu kegiatan). Kontrolnya satu: checkbox Seragam berlabel "Pilih" yang menjadi "Dipilih" saat dicentang (langsung, tanpa dialog). Deskripsi kegiatan terlihat dua baris sebelum dipilih, dengan "Selengkapnya" untuk membuka semuanya. Langkah 1: setelah dipilih, kolom target muncul di sisi kanan baris (galat tampil di bawah kolom). Melepas pilihan kegiatan bisa diurungkan lewat toast "Urungkan" (`removeActivity()`, `undoRemoveActivity()`), bukan konfirmasi. Menambah pilihan sendiri satu pola: kolom teks dengan tombol Tambah ("Akar masalah lain dari sekolah", "Kegiatan dari sekolah"); hasilnya muncul sebagai baris "Dipilih" dengan badge "Dari sekolah".
- **Sedikit teks.** Di badan halaman tiap area kerja hanya satu kalimat petunjuk ("Pilih akar masalah di sekolah Anda"); keterangan panjang dilipat ("Tentang indikator").
- **Kaki halaman** (`flowFooter()`) di akhir area kerja: tombol bernama tujuan ("Kembali: Memetakan", "Lanjut: Merencanakan"), "Tersimpan otomatis", dan petunjuk bila belum lengkap.
- **Langkah 1 (Menetapkan)** (`menetapkanStep()`): langsung satu tabel berisi semua indikator, diurutkan dari kategori Kurang dan capaian terendah. Enam kolom: Indikator (nama dengan baris kedua "A.1, Asesmen Nasional 2025" berupa kode dan asal data, satu baris dengan titik tiga dan tooltip bila panjang), Capaian 2025 (nilai), Kategori (badge), Perubahan dari 2024, Jadikan prioritas (checkbox tanpa label; namanya ada di judul kolom dan aria-label), Target. Tipografi tabel hanya dua ukuran: isi utama 16/24 dan keterangan 14/20 (kode dan sumber, petunjuk target); tidak ada ukuran 12. Mutu hanya sebagai filter (bukan kolom), bersama Kategori, di atas tabel (dengan jumlah di tiap pilihan); ringkasan "12 dari 34 indikator, 1 dipilih" memberi tahu bila baris terpilih tersembunyi filter, dan klik simpul di pratinjau mengatur ulang filter supaya baris terlihat. Memilih indikator mengisi usulan target (capaian + 10, maksimum skala) dengan umpan balik "Naik 9,67 poin dari capaian sekarang". Batas 3 indikator memunculkan toast beralasan, bukan menonaktifkan checkbox. Syarat selesai ("Pilih 2–3 indikator", "Isi target semua indikator") bertanda sudah/belum di kaki halaman. Usulan target (+10) adalah asumsi desain yang perlu dikonfirmasi tim produk.
