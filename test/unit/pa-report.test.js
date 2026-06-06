// spec-v52 §4.6: JSON report builder unit tests.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBundle, runEngine } from '../../lib/pa/engine.js';
import {
  buildJsonReport,
  buildRedactedJsonReport,
  buildDocxReport,
  buildRedactedDocxReport,
} from '../../lib/pa/report.js';

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
  'Servicing facility NPI: 1306849393',
  'TIN: 123456789',
  'Chief complaint: hypertension follow-up',
  'Medical necessity: required for blood-pressure control.',
  'Step therapy: trial of lisinopril completed without adequate response.',
  'Active medications: lisinopril 10 mg daily.',
  'Allergies: NKDA.',
  'Duration: 12 months requested.',
  'Frequency: daily',
  'Signature: Jane Doe MD, 2026-04-12',
].join('\n') + '\n';

function bundleOf(text) {
  return buildBundle([{ name: 'doc.txt', sha256: 'sha-1', kind: 'TXT', text }], { totalBytes: 4096 });
}

test('buildJsonReport emits the six §4.6 top-level sections', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const report = buildJsonReport(bundle, findings);
  for (const key of ['coverPage', 'executiveSummary', 'findings', 'evidenceLedger', 'extractedData', 'auditTrail']) {
    assert.ok(Object.prototype.hasOwnProperty.call(report, key), 'missing top-level section: ' + key);
  }
});

test('coverPage carries the disclaimer + dataset version + detected payer', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const report = buildJsonReport(bundle, findings);
  assert.equal(report.coverPage.datasetVersion, '1.0.0');
  assert.equal(report.coverPage.detectedPayer, bundle.payer);
  assert.match(report.coverPage.disclaimer, /Sophie Prior-Auth Packet Linter is a deterministic checklist\./);
});

test('executiveSummary counts and blockFindings derive from the findings array', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const report = buildJsonReport(bundle, findings);
  assert.equal(report.executiveSummary.totalRulesEvaluated, findings.length);
  // Happy path: no blocks.
  assert.equal(report.executiveSummary.blockFindings.length, 0);
});

test('findings carry remediation hints on block / flag entries only', () => {
  const bundle = bundleOf(HAPPY_TEXT.replace('Patient: Jane Q Doe\n', '')); // R-PA-001 will block
  const findings = runEngine(bundle);
  const report = buildJsonReport(bundle, findings);
  const blocked = report.findings.find((f) => f.ruleId === 'R-PA-001');
  assert.ok(blocked && blocked.remediation, 'block finding should carry a remediation hint');
  const passing = report.findings.find((f) => f.status === 'pass');
  assert.equal(passing.remediation, null, 'pass finding should have no remediation hint');
});

test('evidenceLedger includes per-document extracted values', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const report = buildJsonReport(bundle, findings);
  const entry = report.evidenceLedger[0];
  assert.equal(entry.document, 'doc.txt');
  assert.equal(entry.sha256, 'sha-1');
  assert.equal(entry.ledger.patientName, 'Jane Q Doe');
  assert.equal(entry.ledger.dob, '1985-03-12');
  assert.equal(entry.ledger.memberId, 'W123456789');
});

test('auditTrail records every rule id + document hash', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const report = buildJsonReport(bundle, findings);
  assert.equal(report.auditTrail.ruleIds.length, findings.length);
  assert.deepEqual(report.auditTrail.documentHashes, [{ document: 'doc.txt', sha256: 'sha-1' }]);
});

// spec-v52 §8.3 follow-up: per-source dataset staleness in the audit trail.

test('auditTrail.datasetStaleness lists the bundled ledger sources', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const report = buildJsonReport(bundle, findings);
  const ds = report.auditTrail.datasetStaleness;
  assert.ok(ds, 'audit trail should carry a datasetStaleness block');
  assert.ok(Array.isArray(ds.sources) && ds.sources.length > 0, 'staleness sources should be populated');
  assert.equal(ds.rulesetVersion, '1.0.0');
  // Each source carries the static, byte-stable facts.
  for (const s of ds.sources) {
    assert.ok(s.id && s.label && s.url, 'source must carry id/label/url');
    assert.ok(typeof s.lastVerified === 'string', 'source must carry lastVerified');
  }
});

test('datasetStaleness omits time-relative state without a timestamp (byte-stable)', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const ds = buildJsonReport(bundle, findings).auditTrail.datasetStaleness;
  assert.equal(ds.evaluated, null);
  for (const s of ds.sources) {
    assert.equal(s.state, undefined, 'no state without a generatedAt timestamp');
    assert.equal(s.ageDays, undefined, 'no ageDays without a generatedAt timestamp');
  }
});

test('datasetStaleness computes per-source state when generatedAt is supplied', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  // Far-future date forces every source past the 365-day fail window.
  const report = buildJsonReport(bundle, findings, { generatedAt: '2099-01-01T00:00:00.000Z' });
  const ds = report.auditTrail.datasetStaleness;
  assert.ok(ds.evaluated, 'evaluated summary present with a timestamp');
  assert.equal(ds.evaluated.evaluatedAt, '2099-01-01');
  assert.equal(ds.evaluated.ok, false, 'sources are stale in 2099 -> not ok');
  assert.ok(ds.sources.every((s) => s.state === 'fail'), 'every source is fail in 2099');
  assert.ok(ds.sources.every((s) => typeof s.ageDays === 'number' && s.ageDays > 365));
});

test('buildJsonReport is byte-stable for same input (determinism)', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const a = JSON.stringify(buildJsonReport(bundle, findings));
  const b = JSON.stringify(buildJsonReport(bundle, findings));
  assert.equal(a, b);
});

test('buildRedactedJsonReport masks PHI in evidenceLedger + extractedData', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const report = buildRedactedJsonReport(bundle, findings);
  const entry = report.evidenceLedger[0];
  assert.equal(entry.ledger.patientName, '[REDACTED]');
  assert.equal(entry.ledger.dob, '[REDACTED]');
  assert.equal(entry.ledger.memberId, '[REDACTED]');
  // Extracted-data appendix also redacted.
  assert.equal(report.extractedData[0].extract.patientName, '[REDACTED]');
});

test('buildRedactedJsonReport preserves audit-trail structural fields', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const report = buildRedactedJsonReport(bundle, findings);
  // Hashes and rule ids are not PHI -- they must survive redaction.
  assert.deepEqual(report.auditTrail.documentHashes, [{ document: 'doc.txt', sha256: 'sha-1' }]);
  assert.equal(report.auditTrail.ruleIds.length, findings.length);
});

// spec-v52 §4.6 (wave 52-6b): DOCX report builder. -------------------------

test('buildDocxReport assembles a .docx (zip magic) without throwing', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  let bytes;
  assert.doesNotThrow(() => { bytes = buildDocxReport(bundle, findings); });
  assert.ok(bytes instanceof Uint8Array);
  assert.deepEqual(Array.from(bytes.slice(0, 4)), [0x50, 0x4B, 0x03, 0x04]);
});

test('buildDocxReport is byte-for-byte deterministic for the same input', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const a = buildDocxReport(bundle, findings);
  const b = buildDocxReport(bundle, findings);
  assert.deepEqual(Array.from(a), Array.from(b));
});

test('buildDocxReport embeds the full PHI; redacted DOCX masks it', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const full = new TextDecoder('utf-8').decode(buildDocxReport(bundle, findings));
  const redacted = new TextDecoder('utf-8').decode(buildRedactedDocxReport(bundle, findings));
  // Store-method zip keeps document.xml text as plain bytes, so a literal
  // name search is a meaningful PHI-leak assertion.
  assert.ok(full.includes('Jane Q Doe'), 'full DOCX should contain the patient name');
  assert.ok(!redacted.includes('Jane Q Doe'), 'redacted DOCX must not contain the patient name');
  assert.ok(redacted.includes('[REDACTED]'), 'redacted DOCX should carry the redaction marker');
});

// spec-v59 §3.1: the DEFAULT export (the redacted builder, now wired to the
// default download buttons in views/pa-lint.js) must contain NONE of the
// extracted patient-identifier values. The raw extract is reachable only via
// the explicit include-PHI builder (buildJsonReport), tested separately above.
test('the redacted report contains no extracted PHI values (spec-v59 §3.1)', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const json = JSON.stringify(buildRedactedJsonReport(bundle, findings, {}));
  for (const phi of ['Jane Q Doe', 'Jane Doe', '1985-03-12', 'W123456789']) {
    assert.equal(json.includes(phi), false, `redacted report leaked PHI: ${phi}`);
  }
});

test('the full report DOES still carry PHI (so the redaction test is meaningful)', () => {
  const bundle = bundleOf(HAPPY_TEXT);
  const findings = runEngine(bundle);
  const json = JSON.stringify(buildJsonReport(bundle, findings, {}));
  assert.ok(json.includes('Jane Q Doe'), 'control: full report should carry the raw name');
});
