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

- **Warna kustom** (bukan token): 26 pemakaian, 20 warna unik di `style.css`: biru aksen `#155EEF`, abu kebiruan untuk teks dan garis (`#25334B`, `#50627C`, `#65758B`, `#8291A6`, `#DCE3ED`, `#DCE5F2`), latar biru muda (`#F0F5FF`, `#EEF5FF`, `#EDF3FB`, `#DCE7F6`, `#CEE3FC`), set kuning keemasan (`#FFF8E6`, `#F5EACB`, `#EEE2BD`, `#75633B`, `#88764C`, `#5E4D29`), hijau `#28835C`, dan `#45B9C2`. Padanan token terdekat: aksi `--sd-blue-70`, teks `--sd-gray-90/70/60`, garis `--sd-modal-footer-border`, latar biru muda `--sd-blue-5`, peringatan `--sd-warning-surface/border` dan `--sd-text-warning`, sukses `--sd-text-success`. Mengganti akan menggeser tampilan sedikit.
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
