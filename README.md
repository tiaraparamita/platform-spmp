# SPMP · Siklus 6M

Prototipe Sistem Penjaminan Mutu Pendidikan dengan Diagnosis, Siklus 6M, dan Evaluasi Diri.

## Menjalankan secara lokal

Jalankan server statis dari direktori proyek, misalnya:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Buka http://127.0.0.1:4173/ di peramban.

## Demo

Gunakan **Menu demo** untuk menjelajahi enam tahap, status persetujuan, dan Evaluasi Diri. Isian disimpan di localStorage peramban. Data isian sesi pengguna tidak disertakan dalam repository.

Persetujuan, periode evaluasi, dan pengiriman ke Dinas atau ARKAS merupakan simulasi. Prototipe tidak mengirim data ke sistem tersebut.

## Struktur

- `index.html`: halaman utama
- `app.js`: tampilan, alur, dan penyimpanan lokal
- `style.css`: gaya dan tata letak responsif
- `referensi-indikator.json`: referensi indikator

Tidak memerlukan instalasi dependensi atau proses build.
