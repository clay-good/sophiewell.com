// spec-v52 §4.7: PHI redaction unit tests.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redactText, redactBundle } from '../../lib/pa/redact.js';

test('redactText masks SSN-shaped strings', () => {
  const s = 'Member SSN 123-45-6789 on file.';
  assert.match(redactText(s), /\[REDACTED\]/);
  assert.equal(/123-45-6789/.test(redactText(s)), false);
});

test('redactText masks email addresses', () => {
  const out = redactText('Contact: jane.doe@example.com for follow-up.');
  assert.match(out, /Contact: \[REDACTED\] for follow-up\./);
});

test('redactText masks US phone numbers', () => {
  const out = redactText('Phone: 415-555-0123 (work).');
  assert.match(out, /Phone: \[REDACTED\]/);
});

test('redactText masks Patient: / Name: lines but keeps the label', () => {
  const out = redactText('Patient: Jane Q Doe');
  assert.match(out, /Patient:\s*\[REDACTED\]/);
});

test('redactText masks DOB / Date of birth values', () => {
  const a = redactText('DOB: 1985-03-12');
  assert.match(a, /DOB:\s*\[REDACTED\]/);
  const b = redactText('Date of birth: 03/12/1985');
  assert.match(b, /Date of birth:\s*\[REDACTED\]/);
});

test('redactText masks Member ID / Subscriber ID / MRN values', () => {
  const a = redactText('Member ID: W123456789');
  assert.match(a, /Member ID:\s*\[REDACTED\]/);
  const b = redactText('Subscriber ID: 0123456789');
  assert.match(b, /Subscriber ID:\s*\[REDACTED\]/);
  const c = redactText('MRN: 12345');
  assert.match(c, /MRN:\s*\[REDACTED\]/);
});

test('redactText is idempotent', () => {
  const once = redactText('Patient: Jane Q Doe\nDOB: 1985-03-12\nSSN 123-45-6789');
  const twice = redactText(once);
  assert.equal(once, twice);
});

test('redactBundle redacts documents text + extract while keeping structure', () => {
  const bundle = {
    documents: [
      { name: 'pa.txt', sha256: 'sha-pa', kind: 'TXT',
        text: 'Patient: Jane Q Doe\nDOB: 1985-03-12\nSSN 123-45-6789',
        role: 'pa-form', payer: 'unknown',
        extract: { patientName: 'Jane Q Doe', dob: '1985-03-12', ssns: ['123-45-6789'], npis: [], cpts: [], icd10: [], pos: [], dates: [], serviceDates: [], textLength: 60 } },
    ],
    totalBytes: 60,
    payer: 'unknown',
  };
  const out = redactBundle(bundle);
  assert.match(out.documents[0].text, /\[REDACTED\]/);
  assert.equal(out.documents[0].extract.patientName, '[REDACTED]');
  assert.equal(out.documents[0].extract.dob, '[REDACTED]');
  assert.deepEqual(out.documents[0].extract.ssns, ['[REDACTED]']);
  // Structural fields untouched.
  assert.equal(out.documents[0].sha256, 'sha-pa');
  assert.equal(out.documents[0].role, 'pa-form');
});

test('redactBundle with redactFindings:true redacts PHI patterns in evidence + note strings', () => {
  const bundle = { documents: [], totalBytes: 0, payer: 'unknown',
    findings: [
      { ruleId: 'R-PA-041', status: 'flag', severity: 'flag', description: 'SSN absent',
        citation: 'spec-v52 §4.5.1', evidence: null,
        note: 'Found SSN-shaped string 123-45-6789. Consider redacting before submission.' },
    ] };
  const out = redactBundle(bundle, { redactFindings: true });
  assert.match(out.findings[0].note, /\[REDACTED\]/);
});

test('redactBundle with redactFindings:true scrubs unlabeled literal PHI from evidence', () => {
  // A rule's evidence often quotes the raw extracted value back without a
  // redaction-triggering label; pattern matching alone would miss it.
  const bundle = {
    documents: [
      { name: 'doc.txt', sha256: 'sha-1', kind: 'TXT', text: 'Patient: Jane Q Doe',
        role: 'pa-form', payer: 'unknown',
        extract: { patientName: 'Jane Q Doe', dob: '1985-03-12', memberId: 'W123456789',
          ssns: [], tins: [], npis: [], cpts: [], icd10: [], pos: [], dates: [], serviceDates: [] } },
    ],
    totalBytes: 20,
    payer: 'unknown',
    findings: [
      { ruleId: 'R-PA-001', status: 'pass', severity: 'block', description: 'Patient name present',
        citation: 'spec-v52 §4.5.1', evidence: 'Found "Jane Q Doe" in doc.txt', note: null },
    ],
  };
  const out = redactBundle(bundle, { redactFindings: true });
  assert.equal(/Jane Q Doe/.test(out.findings[0].evidence), false);
  assert.match(out.findings[0].evidence, /\[REDACTED\]/);
});

// spec-v59 §3.2: widened redaction negative cases (R-1 .. R-4). Each previously
// passed through unredacted; the broadened patterns now mask them.
test('R-1: an UNLABELED street address + City, ST ZIP is redacted', () => {
  const s = 'patient lives at 123 Main St, Springfield, IL 62704 today';
  const out = redactText(s);
  assert.equal(/123 Main St/.test(out), false, 'street not redacted');
  assert.equal(/62704/.test(out), false, 'ZIP not redacted');
});
test('R-2: an UNLABELED "born <date>" is redacted', () => {
  const out = redactText('the infant was born 03/12/1985 at term');
  assert.equal(/03\/12\/1985/.test(out), false);
});
test('R-3: an over-long member ID is redacted to the token boundary (no overflow)', () => {
  const out = redactText('Member ID: 1234567890123456789012345 on file');
  assert.equal(/\d{21}/.test(out), false, 'ID overflow leaked');
  assert.match(out, /\[REDACTED\]/);
});
test('R-4: an international phone (+ country code) is redacted', () => {
  const out = redactText('call the office at +44 20 7946 0958 to confirm');
  assert.equal(/7946 0958/.test(out), false);
});
test('redactText remains idempotent after widening', () => {
  const s = 'lives at 45 North Bedford Avenue, Boston, MA 02115; born 1/2/1990';
  assert.equal(redactText(redactText(s)), redactText(s));
});
