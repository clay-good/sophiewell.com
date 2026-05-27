// spec-v52 §4.3: PA extractors. One test per extractor exercising
// happy-path + boundary cases. The engine consumes the bundle these
// produce; getting the regex anchors wrong here cascades into false
// findings, so the contract is asserted here rather than via UI
// integration only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  luhnNpi,
  extractNpis,
  extractSsns,
  extractCptHcpcs,
  extractIcd10,
  extractPosCodes,
  extractDates,
  extractPatientName,
  extractDob,
  extractMemberId,
  extractTin,
  extractQuantity,
  extractSignature,
  keywordPresent,
  countReplacementChars,
  extractAll,
} from '../../lib/pa/extract.js';

// CMS publishes a worked example: NPI 1234567893 passes Luhn with
// the 80840 prefix. Anything off by one digit must fail.
test('luhnNpi: 1234567893 passes (CMS published example)', () => {
  assert.equal(luhnNpi('1234567893'), true);
});
test('luhnNpi: 1234567890 fails (wrong check digit)', () => {
  assert.equal(luhnNpi('1234567890'), false);
});
test('luhnNpi: rejects non-10-digit input', () => {
  assert.equal(luhnNpi(''), false);
  assert.equal(luhnNpi('12345'), false);
  assert.equal(luhnNpi('12345678901'), false);
  assert.equal(luhnNpi('123456789a'), false);
  assert.equal(luhnNpi(null), false);
});

test('extractNpis returns Luhn-valid 10-digit candidates only', () => {
  const text = 'Ordering NPI: 1234567893. Bogus 1234567890. Phone 5550001212.';
  assert.deepEqual(extractNpis(text), ['1234567893']);
});
test('extractNpis ignores 11-digit numbers (phone-ish)', () => {
  const text = 'Account 12345678901 should not surface.';
  assert.deepEqual(extractNpis(text), []);
});

test('extractSsns finds XXX-XX-XXXX patterns', () => {
  const text = 'Member SSN 123-45-6789 on file. Repeated 123-45-6789 in attachment.';
  assert.deepEqual(extractSsns(text), ['123-45-6789']);
});

test('extractCptHcpcs returns both shapes', () => {
  const text = 'Procedure 99213 with J0696 supply. Adjacent W1234 has out-of-range prefix.';
  const out = extractCptHcpcs(text);
  assert.ok(out.includes('99213'));
  assert.ok(out.includes('J0696'));
  // HCPCS Level II prefixes run A-V per CMS; W and beyond should be skipped.
  assert.ok(!out.includes('W1234'));
});

test('extractIcd10 catches common shapes and rejects placeholders', () => {
  const text = 'Dx: M54.5 chronic low back pain. Comorbid I10. Misc U07.1.';
  const out = extractIcd10(text);
  assert.ok(out.includes('M54.5'));
  assert.ok(out.includes('I10'));
});

test('extractPosCodes only takes labeled forms', () => {
  const text = 'Place of service: 11. POS 22 also referenced. Random 99 ignored.';
  const out = extractPosCodes(text);
  assert.deepEqual(out.sort(), ['11', '22']);
});

test('extractDates returns both ISO and US forms in order', () => {
  const text = 'DOS 2026-04-12. Signed 4/15/2026.';
  assert.deepEqual(extractDates(text), ['2026-04-12', '4/15/2026']);
});

test('extractPatientName picks up "Patient:" line', () => {
  assert.equal(extractPatientName('Patient: Jane Q Doe\nDOB: 1985-03-12'), 'Jane Q Doe');
  assert.equal(extractPatientName('Name: John A. Smith-Jones\n'), 'John A. Smith-Jones');
  assert.equal(extractPatientName('no patient block here'), null);
});

test('extractAll bundles every field with safe defaults', () => {
  const bundle = extractAll('Patient: Jane Doe\nProc 99213\nDx I10\nPOS: 11\nDOS 2026-04-12\nNPI 1234567893');
  assert.equal(bundle.patientName, 'Jane Doe');
  assert.deepEqual(bundle.cpts, ['99213']);
  assert.deepEqual(bundle.icd10, ['I10']);
  assert.deepEqual(bundle.pos, ['11']);
  assert.deepEqual(bundle.npis, ['1234567893']);
  assert.deepEqual(bundle.dates, ['2026-04-12']);
  assert.deepEqual(bundle.ssns, []);
  assert.equal(bundle.textLength > 0, true);
});

// ---- wave 52-1f extractor coverage ----

test('extractDob accepts ISO, US numeric, and long-form labels', () => {
  assert.equal(extractDob('DOB: 1985-03-12\n'), '1985-03-12');
  assert.equal(extractDob('Date of birth: 03/12/1985\n'), '03/12/1985');
  assert.equal(extractDob('D.O.B. May 12, 1985\n'), 'May 12, 1985');
  assert.equal(extractDob('No DOB block here.'), null);
});

test('extractMemberId picks up the standard label forms', () => {
  assert.equal(extractMemberId('Member ID: W123456789\n'), 'W123456789');
  assert.equal(extractMemberId('Subscriber Number: 0987654321\n'), '0987654321');
  assert.equal(extractMemberId('MRN: 12345\n'), '12345');
  assert.equal(extractMemberId('Patient ID: short\n'), null);
});

test('extractTin handles both 9-digit and XX-XXXXXXX forms', () => {
  assert.deepEqual(extractTin('TIN: 12-3456789').sort(), ['123456789']);
  assert.deepEqual(extractTin('EIN 987654321\nTax ID: 12-3456789').sort(), ['123456789', '987654321']);
  assert.deepEqual(extractTin('No tax id here.'), []);
});

test('extractQuantity returns the largest reported integer', () => {
  assert.equal(extractQuantity('Quantity: 12\nQty 30\nUnits: 1\n'), 30);
  assert.equal(extractQuantity('Qty 0\n'), 0);
  assert.equal(extractQuantity('no quantity here'), null);
});

test('extractSignature detects presence + datedness', () => {
  const s1 = extractSignature('Signature: Jane Doe MD, 2026-04-12');
  assert.equal(s1.present, true); assert.equal(s1.dated, true);
  const s2 = extractSignature('Electronically signed by Jane Doe');
  assert.equal(s2.present, true); assert.equal(s2.dated, false);
  const s3 = extractSignature('No signature here.');
  assert.equal(s3.present, false); assert.equal(s3.dated, false);
});

test('keywordPresent returns the matched needle or null', () => {
  assert.equal(keywordPresent('Chief complaint: cough', ['chief complaint']), 'chief complaint');
  assert.equal(keywordPresent('progress note', ['chief complaint', 'progress note']), 'progress note');
  assert.equal(keywordPresent('nope', ['x', 'y']), null);
});

test('countReplacementChars counts U+FFFD only', () => {
  assert.equal(countReplacementChars('clean text'), 0);
  assert.equal(countReplacementChars('mo�jibake'), 1);
  assert.equal(countReplacementChars('���'), 3);
});
