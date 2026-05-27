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
const HAPPY_TEXT =
  'Patient: Jane Q Doe\n'
  + 'DOB: 1985-03-12\n'
  + 'Date of service: 2026-04-12\n'
  + 'Procedure 99213 office visit\n'
  + 'Dx: I10 essential hypertension\n'
  + 'Place of service: 11\n'
  + 'Ordering provider NPI: 1234567893\n';

function bundleOf(...textBlocks) {
  return buildBundle(textBlocks.map((t, i) => ({
    name: 'doc-' + (i + 1) + '.txt',
    sha256: 'sha-' + (i + 1),
    kind: 'TXT',
    text: t,
  })));
}

test('runEngine passes every starter rule on a clean happy-path packet', () => {
  const findings = runEngine(bundleOf(HAPPY_TEXT));
  const counts = summarizeFindings(findings);
  assert.equal(findings.length, STARTER_RULES.length);
  assert.equal(counts.block, 0);
  assert.equal(counts.flag, 0);
  assert.equal(counts.error, 0);
  assert.equal(counts.pass, STARTER_RULES.length);
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
