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
    const { variant = 'ultimate', size = 'md', onclick = '', disabled = false, leadingIcon = '', trailingIcon = '', type = 'button', attrs = '', id = '' } = o;
    return `<button type="${type}" class="sd-btn sd-btn-${size} sd-btn-${variant}"${id ? ` id="${e(id)}"` : ''}${onclick ? ` onclick="${onclick}"` : ''}${disabled ? ' disabled' : ''}${attrs ? ' ' + attrs : ''}>${leadingIcon ? sdIcon(leadingIcon) : ''}${e(label)}${trailingIcon ? sdIcon(trailingIcon) : ''}</button>`;
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
      .map((c) => `<th scope="col"${c.align === 'right' ? ' class="sd-right"' : ''}>${e(c.label)}</th>`)
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

  Object.assign(window, { sdIcon, sdBtn, sdRadioGroup, sdSelect, sdTable, sdBadge });
})();
