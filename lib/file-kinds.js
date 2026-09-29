// spec-v1623 step 1 / spec-v1611: what is this file?
//
// recognize(head, meta, options) reads the first bytes of a file (at most
// LIMITS.headBytes) and its name, and says what the file is, how sure it is,
// the facts that decided it, and which tools read it. Pure: the same bytes
// give the same answer in the browser worker, in Node for the MCP server, and
// in tests.
//
// The order of checks (spec-v1611 §1): containers, binary documents by magic
// bytes, text encoding, then X12, XML, JSON/NDJSON and delimited text. The
// first certain match wins. The file name is evidence, never a decider: an
// .835 file holding a CSV is a CSV, and the result says the name disagreed.

import { readEnvelope } from './x12-envelope.js';
import { scanJsonHead } from './json-head.js';
import { matchColumns } from './upload-intake.js';

// One constants block, printed on the inventory page from the same values.
export const LIMITS = {
  maxFiles: 2000,
  maxDepth: 20,
  maxZipTotalBytes: 4 * 1024 ** 3,
  maxZipRatio: 100,
  headBytes: 262144,
};

const live = (id, multi = false) => ({ id, multi, status: 'live' });
const planned = (id, multi = false) => ({ id, multi, status: 'planned' });
// The records panel (spec-v1624) is a route, not a catalog tool.
const recordPanel = { id: 'record-panel', multi: true, status: 'planned', route: true };

// The registry: every kind, its family, the tools that read it (first is
// primary), and its synthetic sample under test/fixtures/file-kinds/.
export const KINDS = [
  { kind: 'x12-835', label: 'Remittance (835) file', family: 'x12', tools: [live('x12-835-reader', true), live('denial-pattern-report', true), live('appeal-worklist', true), live('underpayment-check', true)], sample: 'x12-835.835' },
  { kind: 'x12-837p', label: 'Professional claim (837P) file', family: 'x12', tools: [live('x12-837-check', true)], sample: 'x12-837p.837' },
  { kind: 'x12-837i', label: 'Institutional claim (837I) file', family: 'x12', tools: [live('x12-837-check', true)], sample: 'x12-837i.837' },
  { kind: 'x12-837d', label: 'Dental claim (837D) file', family: 'x12', tools: [], sample: 'x12-837d.837' },
  { kind: 'x12-271', label: 'Eligibility response (271) file', family: 'x12', tools: [live('x12-271-reader')], sample: 'x12-271.271' },
  { kind: 'x12-277', label: 'Claim status (277) file', family: 'x12', tools: [live('x12-277-reader', true)], sample: 'x12-277.277' },
  { kind: 'x12-277ca', label: 'Claim acknowledgment (277CA) file', family: 'x12', tools: [live('x12-277-reader', true)], sample: 'x12-277ca.277' },
  { kind: 'x12-999', label: 'Implementation acknowledgment (999) file', family: 'x12', tools: [], sample: 'x12-999.999' },
  { kind: 'x12-other', label: 'X12 file', family: 'x12', tools: [], sample: 'x12-other.edi' },
  { kind: 'ccda-ccd', label: 'Health record summary (C-CDA CCD)', family: 'xml', tools: [recordPanel], sample: 'ccd.xml' },
  { kind: 'ccda-other', label: 'Health record document (C-CDA)', family: 'xml', tools: [recordPanel], sample: 'ccda-discharge.xml' },
  { kind: 'apple-health-xml', label: 'Apple Health export', family: 'xml', tools: [recordPanel], sample: 'apple-export.xml' },
  { kind: 'xml-unknown', label: 'XML file', family: 'xml', tools: [], sample: 'unknown.xml' },
  { kind: 'fhir-carin-eob', label: 'Insurer claims data (CARIN Blue Button)', family: 'json', tools: [planned('carin-eob-reader', true)], sample: 'carin-eob.json' },
  { kind: 'fhir-pas', label: 'Prior authorization bundle (Da Vinci PAS)', family: 'json', tools: [planned('pas-bundle-check')], sample: 'pas-request.json' },
  { kind: 'fhir-clinical', label: 'Health records (FHIR)', family: 'json', tools: [recordPanel], sample: 'fhir-clinical.ndjson' },
  { kind: 'fhir-resource', label: 'Health record entry (FHIR)', family: 'json', tools: [recordPanel], sample: 'fhir-observation.json' },
  { kind: 'hpt-json', label: 'Hospital price file (JSON)', family: 'json', tools: [live('hpt-file-check'), planned('hpt-price-compare')], sample: 'hpt.json' },
  { kind: 'tic-in-network', label: 'Insurer in-network rates file', family: 'json', tools: [planned('tic-file-check'), planned('tic-rate-lookup')], sample: 'tic-in-network.json' },
  { kind: 'tic-allowed-amounts', label: 'Insurer allowed-amounts file', family: 'json', tools: [planned('tic-file-check')], sample: 'tic-allowed-amounts.json' },
  { kind: 'tic-toc', label: 'Insurer table-of-contents file', family: 'json', tools: [planned('tic-file-check')], sample: 'tic-toc.json' },
  { kind: 'json-unknown', label: 'JSON file', family: 'json', tools: [], sample: 'unknown.json' },
  { kind: 'hpt-csv', label: 'Hospital price file (CSV)', family: 'csv', tools: [live('hpt-file-check'), planned('hpt-price-compare')], sample: 'hpt-tall.csv' },
  { kind: 'csv-mapped', label: 'Spreadsheet (CSV)', family: 'csv', tools: [], sample: 'fill-history.csv' },
  { kind: 'csv-unknown', label: 'Spreadsheet (CSV)', family: 'csv', tools: [], sample: 'unknown.csv' },
  { kind: 'reference-mpfs-rvu', label: 'CMS physician fee schedule relative value file', family: 'reference', tools: [], sample: 'reference-pprrvu.csv' },
  { kind: 'reference-opps-addb', label: 'CMS OPPS Addendum B', family: 'reference', tools: [], sample: 'reference-addb.csv' },
  { kind: 'reference-nadac', label: 'CMS NADAC file', family: 'reference', tools: [], sample: 'reference-nadac.csv' },
  { kind: 'reference-mue', label: 'CMS medically unlikely edits table', family: 'reference', tools: [], sample: 'reference-mue.csv' },
  { kind: 'reference-ncci-ptp', label: 'CMS NCCI procedure-to-procedure edits', family: 'reference', tools: [], sample: 'reference-ptp.txt' },
  { kind: 'pdf', label: 'PDF document', family: 'binary', tools: [live('pa-lint')], sample: 'packet.pdf' },
  { kind: 'docx', label: 'Word document', family: 'binary', tools: [live('pa-lint')], sample: null, noSample: 'A .docx is a zip; recognizeArchive() is tested on member names in zip-reader.test.js.' },
  { kind: 'image', label: 'Image', family: 'binary', tools: [live('pa-lint')], sample: 'scan.png' },
  { kind: 'excel', label: 'Excel workbook', family: 'binary', tools: [], sample: 'claims.xlsx' },
  { kind: 'zip', label: 'Zip archive', family: 'container', tools: [], sample: 'nested.zip' },
  { kind: 'gzip', label: 'Gzip file', family: 'container', tools: [], sample: 'fhir-clinical.ndjson.gz' },
  { kind: 'binary-unknown', label: 'Unreadable file', family: 'binary', tools: [], sample: 'binary.bin' },
  { kind: 'unknown', label: 'Unrecognized file', family: 'text', tools: [], sample: 'unknown.txt' },
];

const BY_KIND = new Map(KINDS.map((k) => [k.kind, k]));
export const kindInfo = (kind) => BY_KIND.get(kind) || null;

// The sentence a reader gets for a planned tool (spec-v1611 §3).
export const PLANNED_TEXT = 'We recognize this file. The tool that reads it is planned and not built yet.';

function result(kind, confidence, evidence, extra = {}) {
  const info = BY_KIND.get(kind);
  return { kind, label: info.label, family: info.family, confidence, evidence, tools: info.tools, ...extra };
}

// --- bytes and text --------------------------------------------------------

const startsWith = (b, sig, at = 0) => sig.every((v, k) => b[at + k] === v);
const ascii = (s) => [...s].map((c) => c.charCodeAt(0));

function magic(b) {
  if (startsWith(b, ascii('PK\x03\x04')) || startsWith(b, ascii('PK\x05\x06'))) return 'zip';
  if (startsWith(b, [0x1f, 0x8b])) return 'gzip';
  if (startsWith(b, ascii('%PDF-'))) return 'pdf';
  if (startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (startsWith(b, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(b, ascii('ftyp'), 4) && /^(heic|heix|mif1|msf1|hevc)$/.test(String.fromCharCode(...b.slice(8, 12)))) return 'heic';
  if (startsWith(b, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return 'ole'; // legacy .xls/.doc
  return null;
}

// decodeHead(bytes) -> { text, encoding } or null for binary. UTF-8 (BOM or
// not) and UTF-16 by BOM. A head that is not valid UTF-8 but has no NUL bytes
// and is almost all printable is read as Windows-1252, which is how CMS ships
// its CSVs; that is stated in the evidence.
export function decodeHead(bytes) {
  if (startsWith(bytes, [0xff, 0xfe])) return { text: new TextDecoder('utf-16le').decode(bytes.subarray(2)), encoding: 'UTF-16' };
  if (startsWith(bytes, [0xfe, 0xff])) return { text: new TextDecoder('utf-16be').decode(bytes.subarray(2)), encoding: 'UTF-16' };
  const bom = startsWith(bytes, [0xef, 0xbb, 0xbf]);
  const body = bom ? bytes.subarray(3) : bytes;
  if (body.includes(0)) return null;
  try {
    // stream: true tolerates a multi-byte character cut off at the head's end.
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(body, { stream: true }), encoding: 'UTF-8' };
  } catch {
    let odd = 0;
    for (const c of body) if (c < 0x09 || (c > 0x0d && c < 0x20) || c === 0x7f) odd += 1;
    if (odd > body.length / 100) return null;
    return { text: new TextDecoder('windows-1252').decode(body), encoding: 'Windows-1252' };
  }
}

// --- X12 -------------------------------------------------------------------

const X12_TABLE = [
  ['835', 'HP', '005010X221A1', 'x12-835'],
  ['837', 'HC', '005010X222A1', 'x12-837p'],
  ['837', 'HC', '005010X223A2', 'x12-837i'],
  ['837', 'HC', '005010X224A2', 'x12-837d'],
  ['271', 'HB', '005010X279A1', 'x12-271'],
  ['277', 'HN', '005010X212', 'x12-277'],
  ['277', 'HN', '005010X214', 'x12-277ca'],
  ['999', 'FA', '005010X231A1', 'x12-999'],
];
const TX_NAME = { 835: 'remittance', 837: 'claim', 271: 'eligibility response', 277: 'claim status', 999: 'acknowledgment', 270: 'eligibility inquiry', 276: 'claim status request', 278: 'prior authorization', 820: 'premium payment', 834: 'enrollment' };

function recognizeX12(text) {
  const env = readEnvelope(text);
  if (!env) return null;
  const first = env.groups.find((g) => g.sets.length) || env.groups[0];
  const evidence = ['Starts with an ISA segment.'];
  if (!first) return result('x12-other', 'certain', [...evidence, 'No transaction set was found in the first part of the file.']);
  const st = first.sets[0];
  evidence.push(`ST01 is ${st}; GS01 is ${first.gs01 || 'missing'}; GS08 is ${first.gs08 || 'missing'}.`);
  const counts = {};
  for (const g of env.groups) for (const s of g.sets) counts[s] = (counts[s] || 0) + 1;
  const countText = Object.entries(counts).map(([k, v]) => `${v}${env.complete ? '' : ' or more'} ${TX_NAME[k] || `${k}`} transaction${v === 1 ? '' : 's'}`).join(', ');
  const extra = { transactions: counts, transactionText: countText };
  const row = X12_TABLE.find(([s, gs, ver]) => s === st && gs === first.gs01 && ver === first.gs08);
  if (row) return result(row[3], 'certain', evidence, extra);
  const sameSet = X12_TABLE.filter(([s]) => s === st);
  if (sameSet.length && first.gs08) {
    // A known transaction in a version we do not read: say so, choose nothing.
    return result('x12-other', 'certain', [...evidence, `This is a ${TX_NAME[st] || st} file in version ${first.gs08}, which is not a version these tools read.`], extra);
  }
  return result('x12-other', 'certain', [...evidence, `Transaction set ${st}${TX_NAME[st] ? ` (${TX_NAME[st]})` : ''} is not one these tools read.`], extra);
}

// --- XML -------------------------------------------------------------------

const CCDA_DOCS = {
  '2.16.840.1.113883.10.20.22.1.2': 'Continuity of Care Document',
  '2.16.840.1.113883.10.20.22.1.3': 'History and Physical',
  '2.16.840.1.113883.10.20.22.1.4': 'Consultation Note',
  '2.16.840.1.113883.10.20.22.1.5': 'Diagnostic Imaging Report',
  '2.16.840.1.113883.10.20.22.1.6': 'Procedure Note',
  '2.16.840.1.113883.10.20.22.1.7': 'Operative Note',
  '2.16.840.1.113883.10.20.22.1.8': 'Discharge Summary',
  '2.16.840.1.113883.10.20.22.1.9': 'Progress Note',
  '2.16.840.1.113883.10.20.22.1.10': 'Unstructured Document',
  '2.16.840.1.113883.10.20.22.1.13': 'Transfer Summary',
  '2.16.840.1.113883.10.20.22.1.14': 'Referral Note',
  '2.16.840.1.113883.10.20.22.1.15': 'Care Plan',
};

// rootElement(text) -> { name, ns, attrs } of the first element, skipping the
// prolog, comments, processing instructions and a DOCTYPE. External entities
// are never fetched: nothing here resolves anything.
export function rootElement(text) {
  let i = 0;
  const n = text.length;
  while (i < n) {
    while (i < n && /\s/.test(text[i])) i += 1;
    if (text.startsWith('<?', i)) { const e = text.indexOf('?>', i); if (e === -1) return null; i = e + 2; continue; }
    if (text.startsWith('<!--', i)) { const e = text.indexOf('-->', i); if (e === -1) return null; i = e + 3; continue; }
    if (text.startsWith('<!', i)) {
      // A DOCTYPE can carry an internal subset in [...] full of '>' (Apple
      // Health exports do); skip to the ']>' that closes it.
      const bracket = text.indexOf('[', i);
      const close = text.indexOf('>', i);
      if (close === -1) return null;
      if (bracket !== -1 && bracket < close) { const e = text.indexOf(']>', bracket); if (e === -1) return null; i = e + 2; } else i = close + 1;
      continue;
    }
    if (text[i] !== '<') return null;
    const end = text.indexOf('>', i);
    if (end === -1) return null;
    const tag = text.slice(i + 1, end);
    const m = /^([A-Za-z_][\w.:-]*)/.exec(tag);
    if (!m) return null;
    const attrs = {};
    for (const a of tag.slice(m[1].length).matchAll(/([\w.:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) attrs[a[1]] = a[3] ?? a[4];
    const [prefix, local] = m[1].includes(':') ? m[1].split(':') : [null, m[1]];
    const ns = attrs[prefix ? `xmlns:${prefix}` : 'xmlns'] || null;
    return { name: local, ns, attrs };
  }
  return null;
}

function recognizeXml(text) {
  if (!/^\s*</.test(text)) return null;
  const root = rootElement(text);
  if (!root) return null;
  if (root.name === 'ClinicalDocument' && root.ns === 'urn:hl7-org:v3') {
    const ids = [...text.matchAll(/<templateId\b[^>]*\broot\s*=\s*["']([\d.]+)["']/g)].map((m) => m[1]);
    const docId = ids.find((id) => CCDA_DOCS[id]);
    if (docId === '2.16.840.1.113883.10.20.22.1.2') {
      return result('ccda-ccd', 'certain', ['The root element is ClinicalDocument in the HL7 v3 namespace.', 'It carries the C-CDA Continuity of Care Document template id.']);
    }
    return result('ccda-other', docId ? 'certain' : 'likely', ['The root element is ClinicalDocument in the HL7 v3 namespace.', docId ? `It is a C-CDA ${CCDA_DOCS[docId]}.` : 'No C-CDA document template id was found in the first part of the file.'], { documentType: docId ? CCDA_DOCS[docId] : null });
  }
  if (root.name === 'HealthData') return result('apple-health-xml', 'certain', ['The root element is HealthData, the root of an Apple Health export.']);
  return result('xml-unknown', 'certain', [`The root element is ${root.name}${root.ns ? ` in ${root.ns}` : ''}, which no tool here reads.`], { root: root.name });
}

// --- JSON ------------------------------------------------------------------

const CARIN = /hl7\.org\/fhir\/us\/carin-bb\//;
const PAS = /hl7\.org\/fhir\/us\/davinci-pas\//;
const CLINICAL_TYPES = ['Observation', 'Patient', 'Condition', 'MedicationRequest', 'MedicationStatement', 'AllergyIntolerance', 'Immunization', 'Procedure', 'DiagnosticReport', 'Encounter'];

function recognizeJson(text) {
  if (!/^\s*[[{]/.test(text)) return null;
  const j = scanJsonHead(text);
  if (!j.kind) return null;
  const keys = new Set(j.topKeys);
  const types = new Set(j.nestedTypes);
  const ev = (s) => [j.kind === 'ndjson' ? 'Each line is a JSON object (NDJSON).' : 'The file is JSON.', ...s];
  if (keys.has('hospital_name') && keys.has('standard_charge_information')) {
    return result('hpt-json', 'certain', ev(['It has hospital_name and standard_charge_information, the CMS hospital price file layout.']));
  }
  if (keys.has('reporting_entity_name')) {
    if (keys.has('in_network')) return result('tic-in-network', 'certain', ev(['It has reporting_entity_name and in_network, a Transparency in Coverage in-network rates file.']));
    if (keys.has('out_of_network')) return result('tic-allowed-amounts', 'certain', ev(['It has reporting_entity_name and out_of_network, a Transparency in Coverage allowed-amounts file.']));
    if (keys.has('reporting_structure')) return result('tic-toc', 'certain', ev(['It has reporting_entity_name and reporting_structure, a Transparency in Coverage table of contents.']));
  }
  const isBundle = j.resourceType === 'Bundle';
  if (isBundle || j.kind === 'ndjson') {
    if (types.has('ExplanationOfBenefit')) {
      const carin = j.profiles.find((p) => CARIN.test(p));
      if (carin) return result('fhir-carin-eob', 'certain', ev(['It is a FHIR Bundle of ExplanationOfBenefit resources.', `Its profile is CARIN Blue Button (${carin}).`]));
      return result('fhir-carin-eob', 'likely', ev(['It is a FHIR Bundle of ExplanationOfBenefit resources.', j.profiles.length ? `Its profile (${j.profiles[0]}) is not the CARIN Blue Button profile.` : 'It names no profile.']));
    }
    if (types.has('Claim') || types.has('ClaimResponse')) {
      const pas = j.profiles.find((p) => PAS.test(p));
      if (pas) return result('fhir-pas', 'certain', ev(['It is a FHIR Bundle with a Claim or ClaimResponse.', `Its profile is Da Vinci PAS (${pas}).`]));
      return result('fhir-pas', 'likely', ev(['It is a FHIR Bundle with a Claim or ClaimResponse.', j.profiles.length ? `Its profile (${j.profiles[0]}) is not a Da Vinci PAS profile.` : 'It names no profile.']));
    }
    const clinical = [...types].filter((t) => CLINICAL_TYPES.includes(t));
    if (clinical.length) return result('fhir-clinical', 'certain', ev([`It holds FHIR ${clinical.join(', ')} resources.`]), { resourceTypes: [...types] });
    if (isBundle) return result('json-unknown', 'certain', ev([`It is a FHIR Bundle${types.size ? ` of ${[...types].join(', ')}` : ''}, which no tool here reads.`]), { topKeys: j.topKeys });
  }
  if (j.resourceType) {
    return result('fhir-resource', 'certain', ev([`It is a single FHIR ${j.resourceType} resource.`]), { resourceTypes: [j.resourceType], clinical: CLINICAL_TYPES.includes(j.resourceType) });
  }
  return result('json-unknown', 'certain', ev([j.topKeys.length ? `Its top-level keys are ${j.topKeys.slice(0, 8).join(', ')}${j.topKeys.length > 8 ? ', ...' : ''}, which no tool here reads.` : 'No top-level keys were found.']), { topKeys: j.topKeys });
}

// --- Delimited text --------------------------------------------------------

// firstRows(text, delimiter, max) -> the first `max` complete records, quoted
// cells (with line breaks) respected. The head may end mid-record; that
// record is dropped.
export function firstRows(text, delimiter, max = 15) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length && rows.length < max; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i += 1; } else quoted = false; } else cell += c;
    } else if (c === '"' && cell === '') quoted = true;
    else if (c === delimiter) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  return rows;
}

const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();

function delimiterOf(text) {
  const line = text.slice(0, text.search(/[\r\n]/) === -1 ? text.length : text.search(/[\r\n]/));
  const tabs = (line.match(/\t/g) || []).length;
  const commas = (line.match(/,/g) || []).length;
  if (!tabs && !commas) {
    // A quoted multi-line first cell (the MUE file's AMA notice) hides the
    // delimiter on the first line; look further.
    const more = text.slice(0, 4096);
    const t = (more.match(/\t/g) || []).length;
    const c = (more.match(/,/g) || []).length;
    if (!t && !c) return null;
    return t > c ? '\t' : ',';
  }
  return tabs > commas ? '\t' : ',';
}

function referenceKind(rows) {
  for (const r of rows) {
    const cells = r.map(norm);
    const has = (...names) => names.every((x) => cells.includes(x));
    if (has('ndc description', 'ndc', 'nadac per unit', 'effective date')) return ['reference-nadac', 'Its header is the CMS NADAC layout (NDC Description, NDC, NADAC Per Unit, Effective Date).'];
    if (cells.includes('hcpcs code') && cells.includes('apc') && (cells.includes('si') || cells.includes('status indicator'))) return ['reference-opps-addb', 'Its header is the CMS OPPS Addendum B layout (HCPCS Code, status indicator, APC).'];
    if (cells.some((c) => /mue values$/.test(c)) && cells.includes('mue adjudication indicator')) return ['reference-mue', 'Its header is the CMS MUE table layout (MUE Values, MUE Adjudication Indicator).'];
    if (has('column 1', 'column 2') && cells.some((c) => c.startsWith('modifier'))) return ['reference-ncci-ptp', 'Its header is the CMS NCCI procedure-to-procedure layout (Column 1, Column 2, Modifier).'];
    if (cells[0] === 'hcpcs' && cells[1] === 'mod' && cells[2] === 'description') return ['reference-mpfs-rvu', 'Its header is the CMS physician fee schedule relative value file layout (HCPCS, MOD, DESCRIPTION, RVUs).'];
  }
  return null;
}

function recognizeDelimited(text, csvTools) {
  const delimiter = delimiterOf(text);
  if (!delimiter) return null;
  const rows = firstRows(text, delimiter);
  if (!rows.length) return null;
  const header = rows[0];
  const what = delimiter === '\t' ? 'tab-separated text' : 'comma-separated text (CSV)';
  const h = new Set(header.map((c) => c.trim()));
  if (h.has('hospital_name') && h.has('last_updated_on') && h.has('version')) {
    return result('hpt-csv', 'certain', [`The file is ${what}.`, 'Row 1 has hospital_name, last_updated_on and version, the CMS hospital price file layout.']);
  }
  const ref = referenceKind(rows);
  if (ref) return result(ref[0], 'certain', [`The file is ${what}.`, ref[1], 'This is a reference table: drop it with the file it should be used for.']);
  // A header names every column. A line of prose with a comma in it ("Dear
  // team,") is not one.
  if (header.length < 2 || header.some((c) => !c.trim())) return null;
  const matches = [];
  for (const t of csvTools) {
    const { mapping, missing } = matchColumns(header, t.fields);
    if (missing.length) continue;
    const matched = Object.values(mapping).filter((v) => v !== null).length;
    matches.push({ id: t.id, label: t.label, matched, required: t.fields.filter((f) => f.required).length });
  }
  matches.sort((a, b) => b.matched - a.matched || a.id.localeCompare(b.id));
  const headers = header.map((c) => c.trim()).filter(Boolean);
  const base = [`The file is ${what}.`];
  if (matches.length === 1) {
    return result('csv-mapped', 'likely', [...base, `Its columns cover every required field of ${matches[0].label || matches[0].id}.`, 'You confirm the column mapping before anything runs.'], { tools: [live(matches[0].id)], candidates: matches, headers });
  }
  if (matches.length > 1) {
    return {
      ...result('csv-mapped', 'likely', [...base, `Its columns fit ${matches.length} tools; choose one.`, 'You confirm the column mapping before anything runs.'], { candidates: matches, headers }),
      ambiguous: true,
      tools: matches.map((m) => live(m.id)),
    };
  }
  return result('csv-unknown', 'none', [...base, `Its columns (${headers.slice(0, 8).join(', ')}${headers.length > 8 ? ', ...' : ''}) do not cover the required fields of any tool that reads a CSV.`], { headers });
}

// --- the name --------------------------------------------------------------

const EXT_FAMILY = { '835': 'x12', '837': 'x12', '271': 'x12', '277': 'x12', '999': 'x12', edi: 'x12', x12: 'x12', xml: 'xml', json: 'json', ndjson: 'json', csv: 'csv', tsv: 'csv', pdf: 'binary', xlsx: 'excel', xls: 'excel' };
const FAMILY_WORD = { x12: 'X12', xml: 'XML', json: 'JSON', csv: 'CSV', binary: 'a document', excel: 'an Excel workbook', reference: 'CSV' };

function nameNote(name, res) {
  const ext = /\.([A-Za-z0-9]+)$/.exec(String(name || ''))?.[1]?.toLowerCase();
  const want = EXT_FAMILY[ext];
  const got = res.family === 'reference' ? 'csv' : res.family;
  if (!want || want === got || got === 'container' || res.kind === 'excel') return res;
  return { ...res, evidence: [...res.evidence, `The name ends in .${ext}, but the contents are ${FAMILY_WORD[got] || res.label}; the contents decide.`] };
}

// --- recognize -------------------------------------------------------------

// recognize(head: Uint8Array, meta: { name?, size? }, { csvTools }) -> result
//   { kind, label, family, confidence: 'certain' | 'likely' | 'none',
//     evidence: [...], tools: [{ id, multi, status }], ambiguous?, candidates? }
// csvTools: [{ id, label, fields }] -- the upload-workbench tools' declared
// fields, so a CSV is matched to the tools that can read it.
export function recognize(head, meta = {}, { csvTools = [] } = {}) {
  const bytes = head instanceof Uint8Array ? head : new Uint8Array(head || []);
  const name = meta.name || '';
  if (!bytes.length) return result('unknown', 'none', ['The file is empty.']);
  const m = magic(bytes);
  if (m === 'zip') {
    if (/\.xlsx$/i.test(name)) return result('excel', 'certain', ['It is a zip-based Office file named .xlsx.']);
    return result('zip', 'certain', ['It starts with the zip signature; its members are read one by one.']);
  }
  if (m === 'gzip') return result('gzip', 'certain', ['It starts with the gzip signature; it is unpacked and read.']);
  if (m === 'pdf') return nameNote(name, result('pdf', 'certain', ['It starts with %PDF-.']));
  if (m === 'png' || m === 'jpeg' || m === 'heic') return nameNote(name, result('image', 'certain', [`It is a ${m.toUpperCase()} image.`]));
  if (m === 'ole') {
    if (/\.xls$/i.test(name)) return result('excel', 'certain', ['It is an older binary Office file named .xls.']);
    return result('binary-unknown', 'none', ['It is an older binary Office file, which is not read here.']);
  }
  const decoded = decodeHead(bytes);
  if (!decoded) return result('binary-unknown', 'none', ['It is not text, and not a format these tools read.']);
  const { text, encoding } = decoded;
  const enc = encoding === 'UTF-8' ? [] : [`It is ${encoding} text.`];
  for (const fn of [recognizeX12, recognizeXml, recognizeJson]) {
    const r = fn(text);
    if (r) return nameNote(name, { ...r, evidence: [...enc, ...r.evidence] });
  }
  const d = recognizeDelimited(text, csvTools);
  if (d) return nameNote(name, { ...d, evidence: [...enc, ...d.evidence] });
  const firstLine = text.split(/\r?\n/, 1)[0].slice(0, 60);
  return nameNote(name, result('unknown', 'none', [`It is text that starts "${firstLine}", which matches no format these tools read.`]));
}

// recognizeArchive(names) -> a result for a zip that is one document rather
// than a folder of files (Word, Excel, a CMS relative value file download),
// else null and each member is recognized on its own.
export function recognizeArchive(names, meta = {}) {
  const has = (re) => names.some((n) => re.test(n));
  if (has(/^word\/document\.xml$/)) return result('docx', 'certain', ['It is a Word document (the zip holds word/document.xml).']);
  if (has(/^xl\/workbook\.xml$/)) return result('excel', 'certain', [`It is an Excel workbook${meta.name ? ` (${meta.name})` : ''}.`]);
  if (has(/(^|\/)PPRRVU\d{4}[^/]*\.csv$/i)) return result('reference-mpfs-rvu', 'certain', ['The zip holds a CMS PPRRVU relative value file.', 'This is a reference table: drop it with the file it should be used for.']);
  return null;
}

// The sentence for a file nothing matched (spec-v1611 §5), with the accepted
// list generated from the registry.
export function unknownMessage(name, res) {
  const accepted = 'remittance (835), claim (837), eligibility (271) and claim-status (277) files; hospital and insurer price files; FHIR and C-CDA health records; CSV files for the tools that take them';
  if (res.kind === 'excel') return `${name} is an Excel workbook, which is not read here. Save it as CSV and drop it again. We read: ${accepted}.`;
  return `We couldn't identify ${name}. ${res.evidence.at(-1)} We read: ${accepted}.`;
}
