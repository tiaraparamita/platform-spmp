/* Fungsi bantu komponen Seragam untuk prototipe tanpa build (dipasangkan dengan sd-ui.css).
   Aturan: tombol, pilihan radio, select, dan tabel BARU dibuat lewat fungsi ini, bukan menulis HTML dan kelas sendiri.
   Semua fungsi mengembalikan string HTML. Teks yang dikirim ke fungsi ini sudah harus aman (pakai esc() untuk data pengguna).
   Atribut seperti onclick diterima sebagai string, sama seperti pola di app.js. */
(function () {
  const e = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ICONS = {
    'arrow-left': 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    'arrow-right': 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
    check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    'arrow-drop-down': 'M7 10l5 5 5-5z',
    info: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
    warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
    'check-circle': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    error: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  };

  /** Ikon Seragam (Material, 24px) sebagai SVG dekoratif. */
  function sdIcon(name) {
    return `<svg class="sd-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="${ICONS[name]}"/></svg>`;
  }

  /**
   * Button. variant: ultimate (aksi utama) | primary | secondary | quiet | destructive. size: lg | md | sm.
   * Teks: kata kerja, sentence case, maksimal 3 kata, tanpa panah di teks; pakai leadingIcon/trailingIcon.
   * onclick: string JavaScript (pola app.js). attrs: atribut tambahan sudah dalam bentuk string, mis. 'id="x"'.
   */
  function sdBtn(label, o = {}) {
    const { variant = 'ultimate', size = 'md', onclick = '', disabled = false, leadingIcon = '', trailingIcon = '', type = 'button', attrs = '', id = '', className = '' } = o;
    return `<button type="${type}" class="sd-btn sd-btn-${size} sd-btn-${variant}${className ? ' ' + className : ''}"${id ? ` id="${e(id)}"` : ''}${onclick ? ` onclick="${onclick}"` : ''}${disabled ? ' disabled' : ''}${attrs ? ' ' + attrs : ''}>${leadingIcon ? sdIcon(leadingIcon) : ''}${e(label)}${trailingIcon ? sdIcon(trailingIcon) : ''}</button>`;
  }

  /**
   * Radio dalam FieldGroup (fieldset + legend). Untuk pilihan tunggal dengan kurang dari lima opsi.
   * options: [{ value, label, help }]. onchange: string, boleh memakai this.value. value: nilai terpilih (string atau angka).
   */
  function sdRadioGroup({ legend, name, options, value, onchange = '', disabled = false }) {
    return `<fieldset class="sd-fieldgroup"><legend>${e(legend)}</legend><div class="sd-radio-list">${options
      .map(
        (o) =>
          `<label class="sd-radio"><input type="radio" name="${e(name)}" value="${e(o.value)}"${String(o.value) === String(value) ? ' checked' : ''}${disabled ? ' disabled' : ''}${onchange ? ` onchange="${onchange}"` : ''}><span class="sd-radio-mark" aria-hidden="true"></span><span class="sd-radio-label">${e(o.label)}</span>${o.help ? `<span class="sd-radio-help">${e(o.help)}</span>` : ''}</label>`,
      )
      .join('')}</div></fieldset>`;
  }

  /**
   * Select bawaan peramban dengan gaya Seragam. Label selalu ada; bila kolom tabel sudah menjelaskan, pakai hideLabel (label tetap terbaca pembaca layar).
   * options: [{ value, label }]. onchange: string.
   */
  function sdSelect({ label, options, value, onchange = '', id = '', hideLabel = false }) {
    return `<label class="sd-select"><span class="${hideLabel ? 'sd-sr-only' : ''}">${e(label)}</span><select${id ? ` id="${e(id)}"` : ''}${onchange ? ` onchange="${onchange}"` : ''}>${options
      .map((o) => `<option value="${e(o.value)}"${String(o.value) === String(value) ? ' selected' : ''}>${e(o.label)}</option>`)
      .join('')}</select>${sdIcon('arrow-drop-down')}</label>`;
  }

  /**
   * Table. caption wajib (judul untuk pembaca layar). columns: [{ label, align: 'right' }].
   * rows: array sel (string HTML) untuk baris biasa, atau { full: 'html' } untuk satu sel selebar tabel (mis. isian di bawah baris).
   */
  function sdTable({ caption, columns, rows, className = '' }) {
    const cols = columns.length;
    return `<div class="sd-table-wrap" role="region" aria-label="${e(caption)}" tabindex="0"><table class="sd-table ${className}"><caption class="sd-sr-only">${e(caption)}</caption><thead><tr>${columns
      .map((c) => `<th scope="col"${c.align === 'right' ? ' class="sd-right"' : ''}>${c.srOnly ? `<span class="sd-sr-only">${e(c.label)}</span>` : e(c.label)}</th>`)
      .join('')}</tr></thead><tbody>${rows
      .map((r) =>
        Array.isArray(r)
          ? `<tr>${r.map((cell, i) => `<td${columns[i]?.align === 'right' ? ' class="sd-right"' : ''}>${cell}</td>`).join('')}</tr>`
          : `<tr><td class="sd-full" colspan="${cols}">${r.full}</td></tr>`,
      )
      .join('')}</tbody></table></div>`;
  }

  /**
   * Badge pill: satu badge satu status, teks 1–2 kata. tone: green (selesai, berhasil) | amber (perlu perhatian) | red (galat, gagal) | blue (informasi) | gray (netral: draf, belum dimulai).
   * Warna tidak boleh jadi satu-satunya penanda; teksnya harus menyatakan status.
   */
  function sdBadge(label, tone = 'gray', className = '') {
    return `<span class="sd-badge sd-badge-${tone}${className ? ' ' + className : ''}">${e(label)}</span>`;
  }

  /**
   * Banner statis (bukan entry). tone: info (bawaan) | warning | success | critical | neutral. Pesan penting saja, maksimal 3 baris.
   * critical memakai role="alert"; lainnya role="status". Isi children berupa teks sudah aman (HTML hasil esc()).
   */
  function sdBanner({ tone = 'info', title = '', children = '' }) {
    const icon = { info: 'info', neutral: 'info', warning: 'warning', success: 'check-circle', critical: 'error' }[tone];
    return `<div class="sd-banner sd-banner-${tone}" role="${tone === 'critical' ? 'alert' : 'status'}">${sdIcon(icon)}<div>${title ? `<p class="sd-banner-title">${e(title)}</p>` : ''}${children}</div></div>`;
  }

  Object.assign(window, { sdIcon, sdBtn, sdRadioGroup, sdSelect, sdTable, sdBadge, sdBanner });
})();
