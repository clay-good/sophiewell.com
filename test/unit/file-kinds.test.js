// spec-v1623 step 1 / spec-v1611 Tests: every fixture is recognized with the
// expected kind, confidence and evidence; the "never guess" cases; a 2 GB
// file recognized from its head in under a second.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, openAsBlob, writeFileSync, truncateSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { recognize, recognizeArchive, KINDS, LIMITS, unknownMessage, decodeHead } from '../../lib/file-kinds.js';
import { CSV_TOOLS } from '../../lib/upload-fields.js';
import { readHead } from '../../lib/file-head.js';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'file-kinds');
const rec = (name, opts = { csvTools: CSV_TOOLS }) => recognize(readFileSync(join(DIR, name)).subarray(0, LIMITS.headBytes), { name }, opts);

// fixture -> [kind, confidence, an evidence fragment]
const EXPECT = {
  'x12-835.835': ['x12-835', 'certain', 'GS08 is 005010X221A1'],
  'x12-837p.837': ['x12-837p', 'certain', 'GS08 is 005010X222A1'],
  'x12-837i.837': ['x12-837i', 'certain', 'GS08 is 005010X223A2'],
  'x12-837d.837': ['x12-837d', 'certain', '005010X224A2'],
  'x12-271.271': ['x12-271', 'certain', 'GS01 is HB'],
  'x12-277.277': ['x12-277', 'certain', 'GS08 is 005010X212'],
  'x12-277ca.277': ['x12-277ca', 'certain', 'GS08 is 005010X214'],
  'x12-278.278': ['x12-278', 'certain', '005010X217'],
  'x12-999.999': ['x12-999', 'certain', 'ST01 is 999'],
  'x12-other.edi': ['x12-other', 'certain', 'Transaction set 834 (enrollment)'],
  'ccd.xml': ['ccda-ccd', 'certain', 'Continuity of Care Document template id'],
  'ccda-discharge.xml': ['ccda-other', 'certain', 'C-CDA Discharge Summary'],
  'apple-export.xml': ['apple-health-xml', 'certain', 'HealthData'],
  'unknown.xml': ['xml-unknown', 'certain', 'root element is gpx'],
  'carin-eob.json': ['fhir-carin-eob', 'certain', 'CARIN Blue Button'],
  'pas-request.json': ['fhir-pas', 'certain', 'Da Vinci PAS'],
  'fhir-clinical.ndjson': ['fhir-clinical', 'certain', 'NDJSON'],
  'fhir-observation.json': ['fhir-resource', 'certain', 'single FHIR Observation'],
  'hpt.json': ['hpt-json', 'certain', 'standard_charge_information'],
  'tic-in-network.json': ['tic-in-network', 'certain', 'in_network'],
  'tic-allowed-amounts.json': ['tic-allowed-amounts', 'certain', 'out_of_network'],
  'tic-toc.json': ['tic-toc', 'certain', 'reporting_structure'],
  'unknown.json': ['json-unknown', 'certain', 'widgets, color, nested'],
  'receipt.json': ['receipt', 'certain', 'Sophie Well receipt'],
  'hpt-tall.csv': ['hpt-csv', 'certain', 'hospital_name, last_updated_on and version'],
  'fill-history.csv': ['csv-mapped', 'likely', 'Adherence: PDC, MPR and Gap Days'],
  'households.csv': ['csv-mapped', 'likely', 'Federal Poverty Level Percent (households file)'],
  'fap-patients.csv': ['csv-mapped', 'likely', 'Its columns fit 2 tools; choose one.'],
  'medicare-people.csv': ['csv-mapped', 'likely', 'Extra Help and Medicare Savings Program Screen (people file)'],
  'refill-fills.csv': ['csv-mapped', 'likely', 'Its columns fit 3 tools; choose one.'],
  'irmaa-people.csv': ['csv-mapped', 'likely', 'Medicare IRMAA (people file)'],
  'ptc-households.csv': ['csv-mapped', 'likely', 'Its columns fit 2 tools; choose one.'],
  'scheduled-services.csv': ['csv-mapped', 'likely', 'Does Original Medicare Require Prior Authorization? (services file)'],
  'timely-claims.csv': ['csv-mapped', 'likely', 'Claim Timely-Filing Deadline (claims file)'],
  'appeal-decisions.csv': ['csv-mapped', 'likely', 'Medicare Appeal-Level Deadline (decisions file)'],
  'overpayments.csv': ['csv-mapped', 'likely', '60-Day Overpayment Report-and-Return Clock (overpayments file)'],
  'pa-requests.csv': ['csv-mapped', 'likely', 'Prior-Authorization Decision-Deadline Clock (requests file)'],
  'unknown.csv': ['csv-unknown', 'none', 'alpha, beta, gamma'],
  'reference-pprrvu.csv': ['reference-mpfs-rvu', 'certain', 'reference table'],
  'reference-addb.csv': ['reference-opps-addb', 'certain', 'Addendum B'],
  'reference-nadac.csv': ['reference-nadac', 'certain', 'NADAC'],
  'reference-mue.csv': ['reference-mue', 'certain', 'MUE Adjudication Indicator'],
  'reference-ptp.txt': ['reference-ncci-ptp', 'certain', 'Column 1, Column 2'],
  'packet.pdf': ['pdf', 'certain', '%PDF-'],
  'scan.png': ['image', 'certain', 'PNG'],
  'claims.xlsx': ['excel', 'certain', 'xlsx'],
  'nested.zip': ['zip', 'certain', 'zip signature'],
  'fhir-clinical.ndjson.gz': ['gzip', 'certain', 'gzip signature'],
  'binary.bin': ['binary-unknown', 'none', 'not text'],
  'unknown.txt': ['unknown', 'none', 'Dear team'],
};

test('every fixture is recognized with its kind, confidence and evidence', () => {
  for (const [file, [kind, confidence, fragment]] of Object.entries(EXPECT)) {
    const r = rec(file);
    assert.equal(r.kind, kind, file);
    assert.equal(r.confidence, confidence, file);
    assert.ok(r.evidence.join(' ').includes(fragment), `${file}: "${fragment}" not in ${JSON.stringify(r.evidence)}`);
  }
});

test('every registry kind with a sample has that fixture, and every fixture is tested', () => {
  const files = new Set(readdirSync(DIR));
  for (const k of KINDS) if (k.sample) assert.ok(files.has(k.sample), `${k.kind}: sample ${k.sample} missing`);
  const tested = new Set([...Object.keys(EXPECT), 'ambiguous.csv', 'csv-named.835']);
  for (const f of files) assert.ok(tested.has(f), `${f} is a fixture no test recognizes`);
});

test('never guess: a CSV that fits two tools lists both and chooses neither', () => {
  const r = rec('ambiguous.csv');
  assert.equal(r.ambiguous, true);
  assert.deepEqual(r.tools.map((t) => t.id).sort(), ['med-sync-plan', 'mpr-gap-days']);
  assert.match(r.evidence.join(' '), /fit 2 tools; choose one/);
});

test('never guess: the contents decide, and a disagreeing name is noted', () => {
  const r = rec('csv-named.835');
  assert.equal(r.kind, 'csv-mapped');
  assert.match(r.evidence.at(-1), /The name ends in \.835, but the contents are CSV; the contents decide\./);
  // No CSV tools supplied: the same CSV is not guessed into one.
  assert.equal(rec('fill-history.csv', { csvTools: [] }).kind, 'csv-unknown');
});

test('X12: transactions are counted, and a known set in an unread version names nothing', () => {
  const r = rec('x12-835.835');
  assert.deepEqual(r.transactions, { 835: 2 });
  assert.equal(r.transactionText, '2 remittance transactions');
  const text = readFileSync(join(DIR, 'x12-837p.837'), 'utf8').replaceAll('005010X222A1', '004010X098A1');
  const old = recognize(new TextEncoder().encode(text), { name: 'old.837' });
  assert.equal(old.kind, 'x12-other');
  assert.match(old.evidence.at(-1), /claim file in version 004010X098A1, which is not a version these tools read/);
});

test('a FHIR bundle whose profile the table does not know is likely, not certain', () => {
  const text = readFileSync(join(DIR, 'carin-eob.json'), 'utf8').replace(/http:\/\/hl7\.org\/fhir\/us\/carin-bb\/[^"]+/, 'http://example.org/eob');
  const r = recognize(new TextEncoder().encode(text), { name: 'eob.json' });
  assert.equal(r.kind, 'fhir-carin-eob');
  assert.equal(r.confidence, 'likely');
  assert.match(r.evidence.join(' '), /http:\/\/example\.org\/eob\) is not the CARIN Blue Button profile/);
});

test('archives that are one document: Word, Excel, a CMS relative value download', () => {
  assert.equal(recognizeArchive(['[Content_Types].xml', 'word/document.xml']).kind, 'docx');
  assert.equal(recognizeArchive(['[Content_Types].xml', 'xl/workbook.xml'], { name: 'claims.zip' }).kind, 'excel');
  assert.equal(recognizeArchive(['GPCI2026.csv', 'PPRRVU2026_Oct_nonQPP.csv']).kind, 'reference-mpfs-rvu');
  assert.equal(recognizeArchive(['remits/a.835', 'remits/b.835']), null);
});

test('Excel and unknown files get a message that says what is read', () => {
  assert.match(unknownMessage('claims_sept.xlsx', rec('claims.xlsx')), /^claims_sept\.xlsx is an Excel workbook, which is not read here\. Save it as CSV/);
  assert.match(unknownMessage('note.txt', rec('unknown.txt')), /^We couldn't identify note\.txt\..*We read: remittance \(835\)/);
});

test('encodings: UTF-16 by BOM, Windows-1252 when not UTF-8, binary refused', () => {
  const u16 = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('ISA', 'utf16le')]);
  assert.equal(decodeHead(u16).encoding, 'UTF-16');
  assert.equal(decodeHead(Buffer.from([0x41, 0xae, 0x42, 0x2c, 0x43])).encoding, 'Windows-1252');
  assert.equal(decodeHead(Buffer.from([0x41, 0x00, 0x42])), null);
  // A multi-byte character cut in half by the head's end is still UTF-8.
  assert.equal(decodeHead(Buffer.from([0x61, 0xc3])).encoding, 'UTF-8');
});

test('head only: a 2 GB insurer rates file is recognized from its first 256 KB in under a second', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'sw-kinds-'));
  const path = join(dir, 'in-network.json');
  // 300 KB of real rates JSON, then a sparse tail to 2 GB that costs no disk.
  const rate = JSON.stringify({ negotiation_arrangement: 'ffs', billing_code: '99213', billing_code_type: 'CPT', negotiated_rates: [{ negotiated_prices: [{ negotiated_rate: 88.5 }] }] });
  writeFileSync(path, `{"reporting_entity_name":"Example Health Plan","in_network":[${Array(Math.ceil(300000 / rate.length)).fill(rate).join(',')}`);
  truncateSync(path, 2 * 1024 ** 3);
  const t = Date.now();
  const blob = await openAsBlob(path);
  const head = await readHead(blob);
  const r = recognize(head, { name: 'in-network.json', size: blob.size });
  assert.equal(r.kind, 'tic-in-network');
  assert.ok(Date.now() - t < 1000, `took ${Date.now() - t} ms`);
  assert.equal(head.length, LIMITS.headBytes);
});

test('the home page sample file is the 835 fixture, byte for byte', () => {
  const root = join(DIR, '..', '..', '..');
  assert.deepEqual(readFileSync(join(root, 'samples', 'x12-835.835')), readFileSync(join(DIR, 'x12-835.835')));
});

test('a households file with a benchmark column offers the credit estimate first, and still the poverty-level screen', () => {
  const r = rec('ptc-households.csv');
  assert.deepEqual(r.candidates.map((c) => c.id), ['premium-tax-credit', 'fpl-percent']);
  assert.deepEqual(rec('households.csv').tools.map((t) => t.id), ['fpl-percent']);
});

test('spec-v1511: a fills file with a threshold column offers the refill batch first; a plain fill history is not made ambiguous', () => {
  assert.equal(rec('refill-fills.csv').candidates[0].id, 'refill-eligible-date');
  assert.deepEqual(rec('fill-history.csv').tools.map((t) => t.id), ['mpr-gap-days']);
});

test('spec-v1501 §3: a claims list with a payer column goes to the timely-filing batch; a file of dates alone does not', () => {
  assert.deepEqual(rec('timely-claims.csv').tools.map((t) => t.id), ['timely-filing']);
  assert.ok(!rec('scheduled-services.csv').candidates?.some((c) => c.id === 'timely-filing') && rec('scheduled-services.csv').tools.every((t) => t.id !== 'timely-filing'));
});
