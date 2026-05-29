// spec-v52 §4.6 / §4.10: deterministic, dependency-free DOCX writer.
//
// Wave 52-6b ships the human-facing .docx flavor of the §4.6 report. The
// spec's wave plan named a vendored docx.js for this; this module is a
// deliberate refinement of that letter (see the wave 52-6b changelog):
//
//   1. The §8.1 unit suite (`test/unit/pa-report.test.js`) runs under
//      `node --test` and must assert "DOCX assembles without throwing".
//      The vendored mammoth.js / pdf.js bundles are browser-only and are
//      never imported by the node test runner, so a vendored browser
//      docx.js could not be exercised the same way. A first-party module
//      that runs identically in node and the browser can.
//   2. §4.10 demands byte-for-byte determinism. docx.js packs via jszip,
//      which stamps each zip entry with the wall-clock time -- not
//      reproducible. This writer zeroes the DOS date/time on every entry
//      so the same report produces byte-identical .docx bytes.
//   3. spec-v10 §6 (dependency budget) and §4.9 (perf): a ~140 KB
//      vendored dependency plus a lazy-load path is avoided entirely; the
//      writer is a few hundred bytes of first-party code with no runtime
//      cost until the user clicks Download.
//
// The output is a minimal but valid Office Open XML (.docx) package:
//   [Content_Types].xml  +  _rels/.rels  +  word/document.xml
// stored (no compression) so the document text stays inspectable in the
// zip bytes -- which lets the redaction unit test assert PHI absence
// directly. Word, LibreOffice, and Google Docs all open store-method
// .docx packages.
//
// Determinism (§4.10): no `Date.now()`, no `Math.random()`, no `fetch`.
// The only time-varying value is `report.coverPage.generatedAt`, which is
// caller-supplied (null by default) exactly as the JSON report builder
// passes it.

// ---- CRC-32 (IEEE 802.3, polynomial 0xEDB88320) ----------------------

function makeCrcTable() {
  const table = new Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
}
const CRC_TABLE = makeCrcTable();

function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i += 1) {
    c = (CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8)) >>> 0;
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// ---- byte helpers ----------------------------------------------------

const ENCODER = new TextEncoder();
function utf8(s) { return ENCODER.encode(String(s == null ? '' : s)); }

function pushU16(out, v) {
  out.push(v & 0xFF, (v >>> 8) & 0xFF);
}
function pushU32(out, v) {
  out.push(v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF);
}
function pushBytes(out, bytes) {
  for (let i = 0; i < bytes.length; i += 1) out.push(bytes[i]);
}

// Fixed DOS date 1980-01-01 00:00:00 so the archive is byte-stable.
const DOS_DATE = 0x0021;
const DOS_TIME = 0x0000;

// Build a store-method (no compression) zip from in-memory entries.
// entries: [{ name: string, data: Uint8Array }]. Returns Uint8Array.
function zipStore(entries) {
  const local = [];
  const central = [];
  const records = [];
  for (const entry of entries) {
    const nameBytes = utf8(entry.name);
    const data = entry.data;
    const crc = crc32(data);
    const size = data.length;
    const localStart = local.length;
    pushU32(local, 0x04034b50); // local file header signature
    pushU16(local, 20);         // version needed
    pushU16(local, 0);          // flags
    pushU16(local, 0);          // compression: store
    pushU16(local, DOS_TIME);
    pushU16(local, DOS_DATE);
    pushU32(local, crc);
    pushU32(local, size);       // compressed size == size (store)
    pushU32(local, size);       // uncompressed size
    pushU16(local, nameBytes.length);
    pushU16(local, 0);          // extra length
    pushBytes(local, nameBytes);
    pushBytes(local, data);
    records.push({ nameBytes, crc, size, localStart });
  }
  for (const r of records) {
    pushU32(central, 0x02014b50); // central directory header signature
    pushU16(central, 20);         // version made by
    pushU16(central, 20);         // version needed
    pushU16(central, 0);          // flags
    pushU16(central, 0);          // compression: store
    pushU16(central, DOS_TIME);
    pushU16(central, DOS_DATE);
    pushU32(central, r.crc);
    pushU32(central, r.size);
    pushU32(central, r.size);
    pushU16(central, r.nameBytes.length);
    pushU16(central, 0);          // extra length
    pushU16(central, 0);          // comment length
    pushU16(central, 0);          // disk number start
    pushU16(central, 0);          // internal attributes
    pushU32(central, 0);          // external attributes
    pushU32(central, r.localStart);
    pushBytes(central, r.nameBytes);
  }
  const eocd = [];
  pushU32(eocd, 0x06054b50);      // end-of-central-directory signature
  pushU16(eocd, 0);               // this disk number
  pushU16(eocd, 0);               // disk with central directory
  pushU16(eocd, records.length);  // entries on this disk
  pushU16(eocd, records.length);  // total entries
  pushU32(eocd, central.length);  // central directory size
  pushU32(eocd, local.length);    // central directory offset
  pushU16(eocd, 0);               // comment length
  return Uint8Array.from(local.concat(central, eocd));
}

// ---- OOXML rendering -------------------------------------------------

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function run(text, opts) {
  const o = opts || {};
  let rPr = '';
  if (o.bold || o.size) {
    rPr = '<w:rPr>'
      + (o.bold ? '<w:b/>' : '')
      + (o.size ? '<w:sz w:val="' + o.size + '"/>' : '')
      + '</w:rPr>';
  }
  return '<w:r>' + rPr + '<w:t xml:space="preserve">' + esc(text) + '</w:t></w:r>';
}

function para(text, opts) {
  return '<w:p>' + run(text == null ? '' : text, opts) + '</w:p>';
}

// w:sz is in half-points: 36 -> 18pt, 28 -> 14pt, 24 -> 12pt.
function heading(text, level) {
  const size = level === 1 ? 36 : (level === 2 ? 28 : 24);
  return para(text, { bold: true, size });
}

function formatValue(v) {
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) return v.map((x) => formatValue(x)).join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function pushJsonParas(body, value) {
  const json = JSON.stringify(value === undefined ? null : value, null, 2);
  for (const line of json.split('\n')) {
    body.push(para(line.length ? line : ' '));
  }
}

const CONTENT_TYPES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
  + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
  + '<Default Extension="xml" ContentType="application/xml"/>'
  + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
  + '</Types>';

const RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
  + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
  + '</Relationships>';

const DOCUMENT_OPEN = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>';
const DOCUMENT_CLOSE = '<w:sectPr/></w:body></w:document>';

// Render a §4.6 report object (the structure `buildJsonReport` returns)
// to .docx bytes. The same report object always yields the same bytes.
export function renderReportDocx(report) {
  const r = report || {};
  const body = [];

  const cp = r.coverPage || {};
  body.push(heading(cp.title || 'Sophie PA Packet Lint Report', 1));
  body.push(para('Documents in packet: ' + (cp.packetSize == null ? 0 : cp.packetSize)));
  body.push(para('Detected payer: ' + (cp.detectedPayer || 'unknown')));
  body.push(para('Dataset version: ' + (cp.datasetVersion || '')));
  body.push(para('Report format version: ' + (cp.reportFormatVersion || '')));
  body.push(para('Generated at: ' + (cp.generatedAt || '(not recorded)')));
  body.push(para(cp.disclaimer || ''));

  const es = r.executiveSummary || {};
  const counts = es.counts || {};
  body.push(heading('Executive summary', 2));
  body.push(para('Rules evaluated: ' + (es.totalRulesEvaluated == null ? 0 : es.totalRulesEvaluated)));
  body.push(para('Block: ' + (counts.block || 0)
    + ' / Flag: ' + (counts.flag || 0)
    + ' / Info: ' + (counts.info || 0)
    + ' / Pass: ' + (counts.pass || 0)
    + (counts.error ? ' / Error: ' + counts.error : '')
    + (counts.disabled ? ' / Disabled: ' + counts.disabled : '')));
  const blockFindings = es.blockFindings || [];
  if (blockFindings.length) {
    body.push(para('Block findings:', { bold: true }));
    for (const b of blockFindings) body.push(para(b.ruleId + ': ' + b.description));
  }

  body.push(heading('Findings', 2));
  for (const f of r.findings || []) {
    body.push(heading(f.ruleId + ' -- ' + String(f.status || '').toUpperCase(), 3));
    body.push(para(f.description || ''));
    if (f.note) body.push(para('Note: ' + f.note));
    if (f.evidence) body.push(para('Evidence: ' + f.evidence));
    if (f.citation) body.push(para('Citation: ' + f.citation));
    if (f.remediation) body.push(para('Remediation: ' + f.remediation));
  }

  body.push(heading('Evidence ledger', 2));
  for (const e of r.evidenceLedger || []) {
    body.push(heading(e.document || '', 3));
    body.push(para('sha256: ' + (e.sha256 || '')));
    body.push(para('role: ' + (e.role || '') + ' / payer: ' + (e.payer || '')));
    const ledger = e.ledger || {};
    for (const k of Object.keys(ledger)) {
      body.push(para(k + ': ' + formatValue(ledger[k])));
    }
  }

  body.push(heading('Extracted-data appendix', 2));
  for (const d of r.extractedData || []) {
    body.push(heading(d.document || '', 3));
    pushJsonParas(body, d.extract);
  }

  body.push(heading('Audit trail', 2));
  const at = r.auditTrail || {};
  body.push(para('Ruleset version: ' + (at.rulesetVersion || '')));
  body.push(para('Report format version: ' + (at.reportFormatVersion || '')));
  body.push(para('Rules run: ' + (at.ruleIds || []).length));
  body.push(para('Total bytes: ' + (at.totalBytes || 0)));
  body.push(para('Generated at: ' + (at.generatedAt || '(not recorded)')));
  body.push(heading('Document hashes', 3));
  for (const h of at.documentHashes || []) {
    body.push(para((h.document || '') + ': ' + (h.sha256 || '')));
  }

  // spec-v52 §4.5.6: rules skipped because their source was disabled.
  const disabledRules = at.disabledRules || [];
  if (disabledRules.length) {
    body.push(heading('Disabled rules', 3));
    for (const d of disabledRules) {
      body.push(para((d.ruleId || '') + ': ' + (d.reason || '')));
    }
  }

  // spec-v52 §8.3 follow-up: per-source dataset staleness from the bundled
  // ledger. The `state` / `ageDays` fields are present only when the report
  // was generated with a timestamp; otherwise just the lastVerified date.
  const ds = at.datasetStaleness;
  if (ds && Array.isArray(ds.sources) && ds.sources.length) {
    body.push(heading('Dataset source staleness', 3));
    if (ds.evaluated) {
      const s = ds.evaluated.summary || {};
      body.push(para('Evaluated ' + (ds.evaluated.evaluatedAt || '')
        + ': ' + (s.fresh || 0) + ' fresh, ' + (s.warn || 0) + ' warn, '
        + (s.fail || 0) + ' fail, ' + (s.acknowledged || 0) + ' acknowledged, '
        + (s.invalid || 0) + ' invalid.'));
    } else {
      body.push(para('Last-verified dates (run a report with a timestamp for live freshness state):'));
    }
    for (const src of ds.sources) {
      const state = src.state ? ' [' + src.state + ']' : '';
      const age = (src.ageDays != null) ? ' (' + src.ageDays + ' days)' : '';
      body.push(para((src.label || src.id || '') + ': verified ' + (src.lastVerified || '(unknown)') + age + state));
    }
  }

  const documentXml = DOCUMENT_OPEN + body.join('') + DOCUMENT_CLOSE;
  return zipStore([
    { name: '[Content_Types].xml', data: utf8(CONTENT_TYPES) },
    { name: '_rels/.rels', data: utf8(RELS) },
    { name: 'word/document.xml', data: utf8(documentXml) },
  ]);
}

// Exposed for unit tests of the zip/crc primitives.
export const _internals = { crc32, zipStore };
