#!/usr/bin/env node
// Pemeriksa kepatuhan Seragam untuk prototipe (tanpa dependensi).
// Pakai: node scripts/seragam-lint.mjs            -> laporkan jumlah per aturan, gagal bila ada pelanggaran BARU
//        node scripts/seragam-lint.mjs --detail   -> tampilkan lokasi tiap pelanggaran
//        node scripts/seragam-lint.mjs --update   -> simpan jumlah sekarang sebagai batas (dipakai setelah migrasi satu halaman)
// Batas ada di scripts/seragam-lint-baseline.json. Tujuannya menahan pelanggaran agar tidak bertambah selagi halaman dimigrasi.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = join(root, 'scripts', 'seragam-lint-baseline.json');
const args = new Set(process.argv.slice(2));

const files = {
  css: ['style.css'], // sd-ui.css dan tokens/ adalah sumber token, tidak diperiksa
  js: ['app.js'], // sd-ui.js adalah lapisan komponen
};

// Tiap aturan: nama, berkas, pola, penjelasan.
const rules = [
  { id: 'css-font-size-px', kind: 'css', re: /font-size:\s*\d+(\.\d+)?px/g, why: 'Ukuran huruf angka. Pakai var(--sd-text-<peran>-size).' },
  { id: 'css-font-weight-700', kind: 'css', re: /font-weight:\s*(700|800|900|bold)\b/g, why: 'Hanya berat 400 dan 600.' },
  { id: 'css-hex', kind: 'css', re: /[:\s,(]#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?=[\s;,)])/g, strip: 'css-vars', why: 'Warna hex langsung. Pakai token var(--sd-*).' },
  { id: 'css-rgb', kind: 'css', re: /rgba?\(\s*\d/g, why: 'Warna rgb langsung. Pakai token var(--sd-*).' },
  { id: 'js-arrow-in-ui-text', kind: 'js', re: />[^<>`]*[→←][^<>`]*</g, why: 'Tanda panah di teks UI. Pakai ikon (sdBtn leadingIcon/trailingIcon).' },
  { id: 'js-raw-select', kind: 'js', re: /<select\b/g, why: 'Select mentah. Pakai sdSelect().' },
  { id: 'js-raw-table', kind: 'js', re: /<table\b/g, why: 'Tabel mentah. Pakai sdTable().' },
  { id: 'js-raw-button', kind: 'js', re: /<button\b/g, why: 'Tombol mentah. Pakai sdBtn().' },
];

const read = (f) => readFileSync(join(root, f), 'utf8');
const lineOf = (text, idx) => text.slice(0, idx).split('\n').length;

const result = {};
const details = [];
for (const rule of rules) {
  let count = 0;
  for (const f of files[rule.kind]) {
    let text = read(f);
    if (rule.strip === 'css-vars') text = text.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
    for (const m of text.matchAll(rule.re)) {
      count++;
      if (args.has('--detail')) details.push(`${rule.id}  ${f}:${lineOf(text, m.index)}  ${m[0].trim().slice(0, 60)}`);
    }
  }
  result[rule.id] = count;
}

if (args.has('--update')) {
  writeFileSync(baselinePath, JSON.stringify(result, null, 2) + '\n');
  console.log('Batas diperbarui:', result);
  process.exit(0);
}

const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : null;
let worse = 0;
for (const rule of rules) {
  const now = result[rule.id];
  const base = baseline?.[rule.id];
  const flag = base === undefined ? '' : now > base ? `  NAIK dari ${base}` : now < base ? `  turun dari ${base}` : '';
  if (base !== undefined && now > base) worse++;
  console.log(`${String(now).padStart(5)}  ${rule.id.padEnd(22)} ${rule.why}${flag}`);
}
if (args.has('--detail')) console.log('\n' + details.join('\n'));
if (!baseline) console.log('\nBelum ada batas. Jalankan dengan --update untuk menyimpannya.');
if (worse) {
  console.error(`\nGAGAL: ${worse} aturan bertambah pelanggarannya. Perbaiki, atau pakai fungsi bantu di sd-ui.js.`);
  process.exit(1);
}
