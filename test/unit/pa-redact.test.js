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
