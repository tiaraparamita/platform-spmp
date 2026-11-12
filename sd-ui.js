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
    add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    'arrow-down': 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z',
    'chevron-right': 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    'expand-more': 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z',
    close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
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
    const { variant = 'ultimate', size = 'md', onclick = '', disabled = false, leadingIcon = '', trailingIcon = '', type = 'button', attrs = '', id = '', className = '', icon = '', fullWidth = false } = o;
    // icon: tombol hanya ikon (label dipakai sebagai aria-label, wajib).
    const cls = `sd-btn sd-btn-${size} sd-btn-${variant}${icon ? ' sd-btn-icon' : ''}${fullWidth ? ' sd-btn-block' : ''}${className ? ' ' + className : ''}`;
    const aria = icon ? ` aria-label="${e(label)}"` : '';
    return `<button type="${type}" class="${cls}"${aria}${id ? ` id="${e(id)}"` : ''}${onclick ? ` onclick="${onclick}"` : ''}${disabled ? ' disabled' : ''}${attrs ? ' ' + attrs : ''}>${icon ? sdIcon(icon) : `${leadingIcon ? sdIcon(leadingIcon) : ''}${e(label)}${trailingIcon ? sdIcon(trailingIcon) : ''}`}</button>`;
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
  function sdSelect({ label, options, value, onchange = '', id = '', hideLabel = false, optional = false }) {
    return `<label class="sd-select"><span class="${hideLabel ? 'sd-sr-only' : 'sd-field-label'}">${e(label)}${optional ? ' (opsional)' : ''}</span><select${id ? ` id="${e(id)}"` : ''}${onchange ? ` onchange="${onchange}"` : ''}>${options
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
      .map((r) => {
        if (!Array.isArray(r) && r.full !== undefined) return `<tr><td class="sd-full" colspan="${cols}">${r.full}</td></tr>`;
        const cells = Array.isArray(r) ? r : r.cells;
        const attrs = Array.isArray(r) ? '' : `${r.selected ? ' class="sd-row-selected"' : ''}${r.attrs ? ' ' + r.attrs : ''}`;
        return `<tr${attrs}>${cells.map((cell, i) => `<td${columns[i]?.align === 'right' ? ' class="sd-right"' : ''}>${cell}</td>`).join('')}</tr>`;
      })
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
  function sdBanner({ tone = 'info', title = '', children = '', onClose = '', className = '' }) {
    const icon = { info: 'info', neutral: 'info', warning: 'warning', success: 'check-circle', critical: 'error' }[tone];
    return `<div class="sd-banner sd-banner-${tone}${className ? ' ' + className : ''}" role="${tone === 'critical' ? 'alert' : 'status'}">${sdIcon(icon)}<div class="sd-banner-body">${title ? `<p class="sd-banner-title">${e(title)}</p>` : ''}${children}</div>${onClose ? sdBtn('Tutup', { variant: 'quiet', size: 'sm', icon: 'close', onclick: onClose }) : ''}</div>`;
  }

  /**
   * Tabs (satu tab aktif, tetap di halaman yang sama). items: [{ value, label, count }]. onselect(value) mengembalikan string JavaScript.
   * Keyboard: panah kiri/kanan berpindah dan mengaktifkan, Home/End; hanya tab aktif yang masuk urutan Tab. Label maksimal 3 kata bila bisa.
   */
  function sdTabs({ label, items, value, onselect, className = '' }) {
    return `<div class="sd-tabs ${className}" role="tablist" aria-label="${e(label)}" onkeydown="sdTabsKey(event)">${items
      .map((it) => {
        const on = String(it.value) === String(value);
        return `<button type="button" role="tab" class="sd-tab" aria-selected="${on}" tabindex="${on ? 0 : -1}" onclick="${onselect(it.value)}">${e(it.label)}${it.count ? `<span class="sd-tab-count" aria-label="${it.count} dipilih">${it.count}</span>` : ''}</button>`;
      })
      .join('')}</div>`;
  }
  function sdTabsKey(ev) {
    const keys = { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' };
    if (!(ev.key in keys)) return;
    const tabs = [...ev.currentTarget.querySelectorAll('[role=tab]')];
    const at = tabs.indexOf(document.activeElement);
    const k = keys[ev.key];
    const to = k === 'first' ? 0 : k === 'last' ? tabs.length - 1 : (at + k + tabs.length) % tabs.length;
    ev.preventDefault();
    tabs[to].click();
    document.querySelector('.sd-tabs [role=tab][aria-selected=true]')?.focus();
  }

  /**
   * Checkbox. Wajib punya label terlihat atau ariaLabel. onchange: string JavaScript, boleh memakai this.checked.
   */
  function sdCheckbox({ label = '', ariaLabel = '', checked = false, onchange = '', id = '', disabled = false, value = '' }) {
    const aria = ariaLabel ? ` aria-label="${e(ariaLabel)}"` : '';
    return `<label class="sd-check"><input type="checkbox"${id ? ` id="${e(id)}"` : ''}${value !== '' ? ` value="${e(value)}"` : ''}${aria}${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}${onchange ? ` onchange="${onchange}"` : ''}><span class="sd-check-box" aria-hidden="true"><svg viewBox="0 0 18 18"><path d="M4.5 9.5l3 3 6-6.5"/></svg></span>${label ? `<span class="sd-check-label">${e(label)}</span>` : ''}</label>`;
  }

  /**
   * Kolom isian teks. Label selalu terlihat di atas kolom (atau hideLabel untuk pembaca layar saja), teks bantu helper 12/16, galat error menggantikan helper.
   * trailing: HTML tombol di sisi kanan kolom (mis. sdBtn). oninput/onchange: string JavaScript.
   */
  function sdTextField({ label, id, value = '', placeholder = '', helper = '', error = '', type = 'text', oninput = '', onchange = '', hideLabel = false, trailing = '', attrs = '', optional = false }) {
    const desc = helper || error ? ` aria-describedby="${e(id)}-hint"` : '';
    return `<div class="sd-field"><label class="sd-field-label${hideLabel ? ' sd-sr-only' : ''}" for="${e(id)}">${e(label)}${optional ? ' (opsional)' : ''}</label><div class="sd-field-row"><input class="sd-input" id="${e(id)}" type="${type}" value="${e(value)}"${placeholder ? ` placeholder="${e(placeholder)}"` : ''}${error ? ' aria-invalid="true"' : ''}${desc}${oninput ? ` oninput="${oninput}"` : ''}${onchange ? ` onchange="${onchange}"` : ''}${attrs ? ' ' + attrs : ''}>${trailing}</div>${helper || error ? `<span class="sd-field-hint${error ? ' sd-field-error' : ''}" id="${e(id)}-hint">${e(error || helper)}</span>` : ''}</div>`;
  }

  /** Area teks. Label di atas, helper 12/16 di bawah label bila ada, tinggi awal sekitar 3 baris, bisa diubah tinggi (vertikal). */
  function sdTextArea({ label, id, value = '', placeholder = '', helper = '', error = '', oninput = '', optional = false, rows = 3 }) {
    const desc = helper || error ? ` aria-describedby="${e(id)}-hint"` : '';
    return `<div class="sd-field"><label class="sd-field-label" for="${e(id)}">${e(label)}${optional ? ' (opsional)' : ''}</label>${helper && !error ? `<span class="sd-field-hint" id="${e(id)}-hint">${e(helper)}</span>` : ''}<textarea class="sd-textarea" id="${e(id)}" rows="${rows}"${placeholder ? ` placeholder="${e(placeholder)}"` : ''}${error ? ' aria-invalid="true"' : ''}${desc}${oninput ? ` oninput="${oninput}"` : ''}>${e(value)}</textarea>${error ? `<span class="sd-field-hint sd-field-error" id="${e(id)}-hint">${e(error)}</span>` : ''}</div>`;
  }

  /**
   * Accordion (satu <details>). title: HTML judul (boleh berisi badge dan ringkasan, tanpa tombol). body: HTML isi.
   * onuser: string JavaScript yang dijalankan saat pengguna mengklik judul (untuk menyimpan pilihan buka/tutup); this = elemen <details>.
   */
  function sdAccordion({ id = '', title, body, open = false, onuser = '', className = '' }) {
    return `<details class="sd-accordion ${className}" data-id="${e(id)}"${open ? ' open' : ''}><summary class="sd-accordion-head"${onuser ? ` onclick="${onuser.replace(/this/g, 'this.parentElement')}"` : ''}><span class="sd-accordion-title">${title}</span>${sdIcon('expand-more')}</summary><div class="sd-accordion-body">${body}</div></details>`;
  }

  /** Bilah kemajuan. value 0 sampai 100; label dibaca pembaca layar (teks yang terlihat sebaiknya ada di dekatnya). inverse untuk latar gelap. */
  function sdProgress({ value, label, inverse = false }) {
    const v = Math.max(0, Math.min(100, Math.round(value)));
    return `<div class="sd-progress${inverse ? ' sd-progress-inverse' : ''}${v >= 100 ? ' is-full' : ''}" role="progressbar" aria-label="${e(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}"><span style="width:${v}%"></span></div>`;
  }

  Object.assign(window, { sdIcon, sdBtn, sdRadioGroup, sdSelect, sdTable, sdBadge, sdBanner, sdTabs, sdTabsKey, sdCheckbox, sdTextField, sdTextArea, sdAccordion, sdProgress });
})();
