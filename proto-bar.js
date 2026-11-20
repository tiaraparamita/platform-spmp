/* Kontrol Prototipe bersama.
 * Dipakai oleh semua versi (Rapor, Opsi Awal, Opsi 19 Nov, Opsi 20 Nov) supaya pilihan yang sama
 * tampil di mana pun, dan pengguna bisa berpindah versi untuk membandingkan.
 * Bar dipasang di luar #app, jadi tidak ikut terhapus saat halaman dirender ulang. */
(function () {
  'use strict';

  var path = location.pathname;
  var m = /\/versi\/(awal|19-nov)\//.exec(path);
  var VER = m ? m[1] : /spmp\.html$/.test(path) ? '20-nov' : 'rapor';
  var ROOT = m ? '../../' : '';

  var PAGES = {
    rapor: ROOT + 'index.html',
    awal: ROOT + 'versi/awal/index.html',
    '19-nov': ROOT + 'versi/19-nov/spmp.html',
    '20-nov': ROOT + 'spmp.html'
  };
  var VER_LABEL = { rapor: 'Rapor', awal: 'Opsi Awal', '19-nov': 'Opsi 19 Nov', '20-nov': 'Opsi 20 Nov' };

  var GROUPS = [
    ['Rapor', [['rapor', 'Halaman Rapor']]],
    ['Platform SPMP', [['awal', 'Opsi Awal'], ['19-nov', 'Opsi 19 Nov'], ['20-nov', 'Opsi 20 Nov']]],
    ['Siklus 6M', [1, 2, 3, 4, 5, 6].map(function (n) { return ['step-' + n, 'Step ' + n]; })],
    ['Atur ulang', [['reset', 'Reset seluruh data']]]
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function currentValue() {
    try {
      if (VER !== 'rapor' && typeof page !== 'undefined' && page === 'flow' && typeof stage === 'number') return 'step-' + (stage + 1);
    } catch (e) { /* variabel belum ada */ }
    return VER;
  }

  var CSS = '' +
    '.spmp-ctl{background:var(--sd-gray-100,#1f2123);color:#fff;font-family:Inter,system-ui,sans-serif}' +
    '.spmp-ctl-inner{display:flex;align-items:center;gap:16px;flex-wrap:wrap;width:min(1216px,100% - 32px);margin:0 auto;min-height:60px;padding:8px 0}' +
    '.spmp-ctl b{font-weight:600;font-size:14px}' +
    '.spmp-ctl-note{color:#c4c7ca;font-size:14px}' +
    '.spmp-ctl select{appearance:none;-webkit-appearance:none;width:300px;max-width:100%;height:44px;padding:0 40px 0 16px;border:1px solid #8b9096;border-radius:6px;background:#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23333\'%3E%3Cpath d=\'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z\'/%3E%3C/svg%3E") no-repeat right 12px center/20px;color:#1f2123;font:inherit;font-size:16px;cursor:pointer}' +
    '.spmp-ctl select:focus-visible,.spmp-ctl button:focus-visible{outline:2px solid #6ea8ff;outline-offset:2px}' +
    '.spmp-ctl-ver{margin-left:auto;display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;background:#33373b;color:#fff;font-size:12px;font-weight:600;white-space:nowrap}' +
    '.spmp-ctl button{height:36px;padding:0 16px;border-radius:6px;border:1px solid #8b9096;background:transparent;color:#fff;font:inherit;font-size:14px;font-weight:600;cursor:pointer}' +
    '.spmp-ctl button.spmp-ctl-danger{background:#c9332c;border-color:#c9332c}' +
    '@media(max-width:700px){.spmp-ctl select{width:100%}.spmp-ctl-ver{margin-left:0}}';

  var bar, select, badge;

  function optionsHtml() {
    var n = 0;
    return GROUPS.map(function (g) {
      return '<optgroup label="' + esc(g[0]) + '">' + g[1].map(function (o) {
        n += 1;
        return '<option value="' + o[0] + '">' + n + '. ' + esc(o[1]) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }

  function renderBar() {
    bar.innerHTML =
      '<div class="spmp-ctl-inner"><b>Kontrol Prototipe</b>' +
      '<span class="spmp-ctl-note">Jelajahi tampilan dan skenario. Data contoh, tidak ada yang dikirim.</span>' +
      '<select aria-label="Pilih tampilan atau skenario">' + optionsHtml() + '</select>' +
      '<span class="spmp-ctl-ver" aria-live="polite"></span></div>';
    select = bar.querySelector('select');
    badge = bar.querySelector('.spmp-ctl-ver');
    select.addEventListener('change', onChange);
    sync();
  }

  function sync() {
    if (!select) return;
    select.value = currentValue();
    badge.textContent = 'Versi: ' + VER_LABEL[VER];
  }

  function goStep(n) {
    var target = VER === 'rapor' ? '20-nov' : VER;
    if (target === VER && typeof window.jump === 'function') {
      window.jump(n - 1);
      sync();
      return;
    }
    location.assign(PAGES[target] + '?step=' + n);
  }

  function askReset() {
    bar.innerHTML =
      '<div class="spmp-ctl-inner" role="alertdialog" aria-label="Konfirmasi reset"><b>Reset seluruh data?</b>' +
      '<span class="spmp-ctl-note">Semua isian siklus, riwayat, dan evaluasi diri demo di semua versi akan dihapus dari peramban ini.</span>' +
      '<button type="button" class="spmp-ctl-danger" data-act="ok">Ya, hapus</button>' +
      '<button type="button" data-act="cancel">Batal</button></div>';
    bar.querySelector('[data-act=ok]').focus();
    bar.addEventListener('click', function onClick(e) {
      var act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
      if (!act) return;
      bar.removeEventListener('click', onClick);
      if (act === 'ok') {
        try {
          Object.keys(localStorage).forEach(function (k) { if (k.indexOf('spmp-') === 0) localStorage.removeItem(k); });
          sessionStorage.clear();
        } catch (err) { /* penyimpanan tidak tersedia */ }
        location.href = PAGES[VER];
      } else {
        renderBar();
        select.focus();
      }
    });
  }

  function onChange() {
    var v = select.value;
    if (v === 'reset') { askReset(); return; }
    if (v.indexOf('step-') === 0) { goStep(Number(v.slice(5))); return; }
    var file = PAGES[v] ? PAGES[v].split('/').pop() : '';
    if (v === VER && v !== 'rapor' && path.split('/').pop() === file) { sync(); return; }
    if (PAGES[v]) location.assign(PAGES[v]);
  }

  function mount() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    bar = document.createElement('div');
    bar.className = 'spmp-ctl';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Kontrol Prototipe');
    document.body.insertBefore(bar, document.body.firstChild);
    renderBar();
    var app = document.getElementById('app');
    if (app && window.MutationObserver) new MutationObserver(sync).observe(app, { childList: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
