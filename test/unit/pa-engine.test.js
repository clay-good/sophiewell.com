// spec-v52 §4.5, §4.10: PA rule engine. Each of the 7 starter rules
// gets a fires-when-it-should and doesn't-fire-when-it-shouldn't
// assertion. Plus engine-level invariants: order is deterministic;
// same input -> same output (property test); rule throw is caught.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBundle, runEngine, summarizeFindings } from '../../lib/pa/engine.js';
import { STARTER_RULES } from '../../lib/pa/rules.js';

// Happy-path packet: one clinical-note document with everything the
// starter rules look for, all valid. Should be all-pass.
// Happy-path packet that satisfies every rule in the wave 52-1f
// starter set (25 rules total). Each anchor below is exercised by
// at least one rule's check(); changes here cascade to multiple
// rule assertions, so add to bundleOf({...}) rather than reshape
// this block when extending.
const HAPPY_TEXT = [
  'Cover sheet',
  'Patient: Jane Q Doe',
  'DOB: 1985-03-12',
  'Member ID: W123456789',
  'Date of service: 2026-04-12',
  'Procedure 99213 office visit',
  'Quantity: 1',
  'Dx: I10 essential hypertension',
  'Place of service: 11',
  'Ordering provider NPI: 1234567893',
  'TIN: 123456789',
  'Chief complaint: hypertension follow-up',
  'Medical necessity: required for blood-pressure control.',
  'Step therapy: trial of lisinopril completed without adequate response.',
  'Active medications: lisinopril 10 mg daily.',
  'Allergies: NKDA.',
  'Duration: 12 months requested.',
  'Signature: Jane Doe MD, 2026-04-12',
].join('\n') + '\n';

function bundleOf(textBlocks, opts) {
  const docs = (Array.isArray(textBlocks) ? textBlocks : [textBlocks]).map((t, i) => ({
    name: 'doc-' + (i + 1) + '.txt',
    sha256: 'sha-' + (i + 1),
    kind: 'TXT',
    text: t,
  }));
  return buildBundle(docs, opts || { totalBytes: 4096 });
}

test('runEngine passes every starter rule on a clean happy-path packet', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT));
  const counts = summarizeFindings(findings);
  assert.equal(findings.length, STARTER_RULES.length);
  assert.equal(counts.block, 0);
  assert.equal(counts.flag, 0);
  assert.equal(counts.error, 0);
  // R-PA-053 (no-PA-needed list, info severity) and R-PA-031/032/060
  // (info-severity informational rules) all return pass when the
  // anchors are present, so the happy packet should be all-pass.
  assert.equal(counts.pass, STARTER_RULES.length);
});

test('STARTER_RULES at wave 52-1f close is 25 rules total', () => {
  assert.equal(STARTER_RULES.length, 25);
});

// ---- wave 52-1f new-rule sanity checks ----

test('R-PA-002 fires when no DOB block is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/DOB:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-002');
  assert.equal(f.status, 'block');
});

test('R-PA-003 fires when no member-ID block is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Member ID:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-003');
  assert.equal(f.status, 'block');
});

test('R-PA-006 fires when service date is more than 365 days in the future', () => {
  const future = HAPPY_TEXT.replace('2026-04-12', '2099-01-01');
  const findings = runEngine(bundleOf(future));
  const f = findings.find((x) => x.ruleId === 'R-PA-006');
  assert.equal(f.status, 'block');
});

test('R-PA-015 fires when no quantity field is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Quantity:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-015');
  assert.equal(f.status, 'block');
});

test('R-PA-017 fires when no signature anchor is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Signature:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-017');
  assert.equal(f.status, 'block');
});

test('R-PA-018 fires when signature is present but undated', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace('Signature: Jane Doe MD, 2026-04-12', 'Signature: Jane Doe MD')));
  const f = findings.find((x) => x.ruleId === 'R-PA-018');
  assert.equal(f.status, 'block');
});

test('R-PA-021 fires when no clinical-note anchor is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace('Chief complaint: hypertension follow-up', '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-021');
  assert.equal(f.status, 'block');
});

test('R-PA-045 flags when totalBytes exceeds the default 50 MB ceiling', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT, { totalBytes: 60 * 1024 * 1024 }));
  const f = findings.find((x) => x.ruleId === 'R-PA-045');
  assert.equal(f.status, 'flag');
});

test('R-PA-046 flags when extracted text contains U+FFFD characters', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT + 'mo�jibake here\n'));
  const f = findings.find((x) => x.ruleId === 'R-PA-046');
  assert.equal(f.status, 'flag');
});

test('R-PA-001 fires when no patient-name line is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Patient:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-001');
  assert.equal(f.status, 'block');
});

test('R-PA-004 fires when no date is in the packet', () => {
  const findings = runEngine(bundleOf('Patient: Jane Doe\nProc 99213\nDx I10\nPOS: 11\nNPI 1234567893\n'));
  const f = findings.find((x) => x.ruleId === 'R-PA-004');
  assert.equal(f.status, 'block');
});

test('R-PA-007 fires when no CPT/HCPCS code is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Procedure 99213.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-007');
  assert.equal(f.status, 'block');
});

test('R-PA-010 fires when no ICD-10 code is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Dx:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-010');
  assert.equal(f.status, 'block');
});

test('R-PA-013 fires when no POS line is present', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace(/Place of service:.*\n/, '')));
  const f = findings.find((x) => x.ruleId === 'R-PA-013');
  assert.equal(f.status, 'block');
});

test('R-PA-013 fires when POS code is not on the bundled CMS list', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace('Place of service: 11', 'Place of service: 88')));
  const f = findings.find((x) => x.ruleId === 'R-PA-013');
  assert.equal(f.status, 'block');
  assert.match(f.note, /not on bundled CMS list/);
});

test('R-PA-016 fires when NPI fails Luhn', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT.replace('1234567893', '1234567890')));
  const f = findings.find((x) => x.ruleId === 'R-PA-016');
  assert.equal(f.status, 'block');
});

test('R-PA-041 flags an SSN-shaped string in the packet', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT + 'Member SSN 123-45-6789 on file.\n'));
  const f = findings.find((x) => x.ruleId === 'R-PA-041');
  assert.equal(f.status, 'flag');
});

test('runEngine output order is deterministic across runs', () => {
  const a = runEngine(bundleOf(HAPPY_TEXT));
  const b = runEngine(bundleOf(HAPPY_TEXT));
  assert.deepEqual(a, b);
});

test('runEngine catches throws from rule.check and records an error finding', () => {
  const badRule = {
    id: 'R-PA-XXX',
    description: 'always throws',
    severity: 'flag',
    citation: 'test',
    check() { throw new Error('boom'); },
  };
  const findings = runEngine(bundleOf(HAPPY_TEXT), [badRule]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].status, 'error');
  assert.match(findings[0].note, /boom/);
});

test('runEngine is order-independent in input documents (property)', () => {
  const a = runEngine(buildBundle([
    { name: 'a.txt', sha256: '1', kind: 'TXT', text: HAPPY_TEXT },
    { name: 'b.txt', sha256: '2', kind: 'TXT', text: 'Random unrelated text.' },
  ]));
  const b = runEngine(buildBundle([
    { name: 'b.txt', sha256: '2', kind: 'TXT', text: 'Random unrelated text.' },
    { name: 'a.txt', sha256: '1', kind: 'TXT', text: HAPPY_TEXT },
  ]));
  // Findings depend on aggregate-presence, not on which document carries
  // the evidence, so the two orderings must agree on every rule status.
  for (let i = 0; i < a.length; i += 1) {
    assert.equal(a[i].ruleId, b[i].ruleId);
    assert.equal(a[i].status, b[i].status);
  }
});
