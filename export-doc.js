/* Pembuat berkas .xlsx dan .docx di peramban, tanpa pustaka luar.
 * Dipakai untuk unduhan RKT (Word/Excel) dan RKAS (Excel) di halaman Tinjau rencana.
 * Zip dibuat tanpa kompresi (metode "store"), cukup untuk Excel dan Word. */
(function () {
  'use strict';

  var enc = new TextEncoder();
  var CRC_TABLE = (function () {
    var t = [];
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    var c = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* files: [{ name, data: string }] -> Uint8Array zip */
  function zip(files) {
    var now = new Date();
    var dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    var dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    var parts = [];
    var central = [];
    var offset = 0;

    function u16(v) { return [v & 0xff, (v >>> 8) & 0xff]; }
    function u32(v) { return [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff]; }

    files.forEach(function (f) {
      var name = enc.encode(f.name);
      var data = enc.encode(f.data);
      var crc = crc32(data);
      var local = [].concat(
        u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0)
      );
      parts.push(new Uint8Array(local), name, data);
      central.push({ name: name, crc: crc, size: data.length, offset: offset });
      offset += local.length + name.length + data.length;
    });

    var centralStart = offset;
    central.forEach(function (c) {
      var rec = [].concat(
        u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate),
        u32(c.crc), u32(c.size), u32(c.size), u16(c.name.length), u16(0), u16(0), u16(0), u16(0),
        u32(0), u32(c.offset)
      );
      parts.push(new Uint8Array(rec), c.name);
      offset += rec.length + c.name.length;
    });
    var end = [].concat(
      u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length),
      u32(offset - centralStart), u32(centralStart), u16(0)
    );
    parts.push(new Uint8Array(end));

    var total = parts.reduce(function (s, p) { return s + p.length; }, 0);
    var out = new Uint8Array(total);
    var pos = 0;
    parts.forEach(function (p) { out.set(p, pos); pos += p.length; });
    return out;
  }

  function colName(i) {
    var s = '';
    i += 1;
    while (i > 0) {
      var m = (i - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      i = Math.floor((i - 1) / 26);
    }
    return s;
  }

  /* opts: { sheetName, title, meta: [[label, nilai]], header: [..], rows: [[..]], widths: [..],
   *         numberCols: [indeks kolom angka], footer: [..] (baris jumlah, tebal) } */
  function xlsx(opts) {
    var rowsXml = [];
    var r = 1;
    function textCell(c, v, s) {
      return '<c r="' + colName(c) + r + '" t="inlineStr" s="' + s + '"><is><t xml:space="preserve">' + esc(v) + '</t></is></c>';
    }
    function numCell(c, v, s) {
      return '<c r="' + colName(c) + r + '" s="' + s + '"><v>' + Number(v) + '</v></c>';
    }
    function addRow(cells, height) {
      rowsXml.push('<row r="' + r + '"' + (height ? ' ht="' + height + '" customHeight="1"' : '') + '>' + cells.join('') + '</row>');
      r += 1;
    }
    var ncol = opts.header.length;
    if (opts.title) { addRow([textCell(0, opts.title, 4)]); }
    (opts.meta || []).forEach(function (m) { addRow([textCell(0, m[0] + ': ' + m[1], 5)]); });
    if (opts.title || (opts.meta && opts.meta.length)) addRow([]);
    var headerRow = r;
    addRow(opts.header.map(function (h, c) { return textCell(c, h, 1); }), 32);
    opts.rows.forEach(function (row) {
      addRow(row.map(function (v, c) {
        var isNum = (opts.numberCols || []).indexOf(c) >= 0 && v !== '' && v != null && isFinite(Number(v));
        return isNum ? numCell(c, v, 3) : textCell(c, v, 2);
      }));
    });
    if (opts.footer) {
      addRow(opts.footer.map(function (v, c) {
        var isNum = (opts.numberCols || []).indexOf(c) >= 0 && v !== '' && v != null && isFinite(Number(v));
        return isNum ? numCell(c, v, 6) : textCell(c, v, 5);
      }));
    }
    var cols = (opts.widths || []).map(function (w, i) {
      return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>';
    }).join('');
    var sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<sheetViews><sheetView workbookViewId="0"><pane ySplit="' + headerRow + '" topLeftCell="A' + (headerRow + 1) + '" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
      '<sheetFormatPr defaultRowHeight="18"/>' +
      (cols ? '<cols>' + cols + '</cols>' : '') +
      '<sheetData>' + rowsXml.join('') + '</sheetData>' +
      '<pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>' +
      '</worksheet>';

    var border = '<border><left style="thin"><color rgb="FFBFC3C8"/></left><right style="thin"><color rgb="FFBFC3C8"/></right><top style="thin"><color rgb="FFBFC3C8"/></top><bottom style="thin"><color rgb="FFBFC3C8"/></bottom><diagonal/></border>';
    var styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0"/></numFmts>' +
      '<fonts count="3"><font><sz val="11"/><name val="Inter"/></font><font><b/><sz val="11"/><name val="Inter"/></font><font><b/><sz val="14"/><name val="Inter"/></font></fonts>' +
      '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF0F1F2"/><bgColor indexed="64"/></patternFill></fill></fills>' +
      '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>' + border + '</borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="7">' +
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>' +
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>' +
      '<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>' +
      '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
      '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
      '<xf numFmtId="164" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>' +
      '</cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      '</styleSheet>';

    var name = esc((opts.sheetName || 'Lembar 1').slice(0, 31));
    return zip([
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="' + name + '" sheetId="1" r:id="rId1"/></sheets></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: 'xl/styles.xml', data: styles },
      { name: 'xl/worksheets/sheet1.xml', data: sheet }
    ]);
  }

  /* opts: { title, meta: [[label, nilai]], header: [..], rows: [[..]], widths: [lebar kolom dalam twip], footer } */
  function docx(opts) {
    function p(text, o) {
      o = o || {};
      return '<w:p><w:pPr><w:spacing w:after="' + (o.after == null ? 80 : o.after) + '"/></w:pPr><w:r><w:rPr>' + (o.bold ? '<w:b/>' : '') + '<w:sz w:val="' + (o.size || 20) + '"/></w:rPr><w:t xml:space="preserve">' + esc(text) + '</w:t></w:r></w:p>';
    }
    var widths = opts.widths;
    function cell(text, w, o) {
      o = o || {};
      return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (o.fill ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.fill + '"/>' : '') + '</w:tcPr>' + p(text, { bold: o.bold, size: 18, after: 0 }) + '</w:tc>';
    }
    var tbl = '<w:tbl><w:tblPr><w:tblW w:w="' + widths.reduce(function (a, b) { return a + b; }, 0) + '" w:type="dxa"/><w:tblBorders>' +
      ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(function (b) { return '<w:' + b + ' w:val="single" w:sz="4" w:space="0" w:color="BFC3C8"/>'; }).join('') +
      '</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr>' +
      '<w:tblGrid>' + widths.map(function (w) { return '<w:gridCol w:w="' + w + '"/>'; }).join('') + '</w:tblGrid>' +
      '<w:tr><w:trPr><w:tblHeader/></w:trPr>' + opts.header.map(function (h, i) { return cell(h, widths[i], { bold: true, fill: 'F0F1F2' }); }).join('') + '</w:tr>' +
      opts.rows.map(function (row) { return '<w:tr><w:trPr><w:cantSplit/></w:trPr>' + row.map(function (v, i) { return cell(v, widths[i]); }).join('') + '</w:tr>'; }).join('') +
      (opts.footer ? '<w:tr>' + opts.footer.map(function (v, i) { return cell(v, widths[i], { bold: true }); }).join('') + '</w:tr>' : '') +
      '</w:tbl>';
    var body = p(opts.title, { bold: true, size: 28, after: 120 }) +
      (opts.meta || []).map(function (m) { return p(m[0] + ': ' + m[1], { size: 20, after: 40 }); }).join('') +
      p('', { after: 80 }) + tbl +
      '<w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="1000" w:right="1000" w:bottom="1000" w:left="1000" w:header="500" w:footer="500" w:gutter="0"/></w:sectPr>';
    return zip([
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
      { name: 'word/document.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body + '</w:body></w:document>' }
    ]);
  }

  var MIME = {
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };

  function download(fileName, bytes, kind) {
    var url = URL.createObjectURL(new Blob([bytes], { type: MIME[kind] }));
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  window.spmpExport = { xlsx: xlsx, docx: docx, download: download };
})();
