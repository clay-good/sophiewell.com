// spec-v52 §8.4: PA pipeline property tests (wave 52-6f).
//
// These guard the §4.10 determinism guarantees as invariants rather than
// fixed snapshots (the snapshot half lives in scripts/audit-pa.mjs):
//
//   1. Reordering the input file list does not change the report JSON.
//   2. Adding an irrelevant extra file does not change which rules fire
//      on the relevant documents.
//   3. The same packet processed twice produces byte-identical JSON.
//   4. The redact path is idempotent: redacting an already-redacted
//      bundle changes nothing.
//
// No new framework -- hand-rolled inputs over the existing node:test
// runner, per §8.4. Reports are built without `generatedAt` so the JSON
// is byte-stable.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBundle, runEngine } from '../../lib/pa/engine.js';
import { buildJsonReport } from '../../lib/pa/report.js';
import { redactBundle } from '../../lib/pa/redact.js';

const FORM = {
  name: 'pa-form.txt',
  sha256: 'sha-form',
  kind: 'TXT',
  text: [
    'Prior Authorization Request Form',
    'Patient: Jane Q Doe',
    'DOB: 1985-03-12',
    'Member ID: W123456789',
    'Date of service: 2026-04-12',
    'Place of service: 11',
    'Procedure 99213 office visit',
    'Quantity: 1',
    'Dx: I10 essential hypertension',
    'Ordering provider NPI: 1234567893',
    'Servicing facility NPI: 1306849393',
    'TIN: 123456789',
    'Signature: Jane Doe MD, 2026-04-12',
  ].join('\n'),
};

const NOTE = {
  name: 'note.txt',
  sha256: 'sha-note',
  kind: 'TXT',
  text: [
    'Clinical note',
    'Chief complaint: hypertension follow-up',
    'Assessment and plan: continue 99213-level office visit.',
    'Medical necessity: required for blood-pressure control.',
    'Note date: 2026-04-12',
    'Signed: Jane Doe MD, 2026-04-12',
  ].join('\n'),
};

// An irrelevant attachment with no patient identifiers, dates, codes, or
// clinical anchors -- it must not change which rules fire.
const COUPON = {
  name: 'coupon.txt',
  sha256: 'sha-coupon',
  kind: 'TXT',
  text: 'Save fifteen percent on your next pharmacy visit. Offer void where prohibited.',
};

const OPTS = { totalBytes: 12288 };

function reportJson(documents, opts) {
  const bundle = buildBundle(documents, opts || OPTS);
  const findings = runEngine(bundle);
  return buildJsonReport(bundle, findings); // no generatedAt -> byte-stable
}

// ruleId -> status map, independent of document set / report framing.
function firingMap(documents, opts) {
  const bundle = buildBundle(documents, opts || OPTS);
  const findings = runEngine(bundle);
  const map = {};
  for (const f of findings) map[f.ruleId] = f.status;
  return map;
}

test('property 1: reordering the input file list does not change the report JSON', () => {
  // buildBundle canonicalizes document order by content hash, so the entire
  // report -- findings, evidence ledger, extracted-data appendix, and
  // document-hash audit list -- is byte-identical regardless of drop order.
  const a = JSON.stringify(reportJson([FORM, NOTE]));
  const b = JSON.stringify(reportJson([NOTE, FORM]));
  assert.equal(b, a, 'the full report JSON must be invariant under input reordering');
});

test('property 2: adding an irrelevant extra file does not change which rules fire', () => {
  const without = firingMap([FORM, NOTE]);
  const withCoupon = firingMap([FORM, NOTE, COUPON]);
  assert.deepEqual(withCoupon, without, 'an irrelevant attachment must not flip any rule');
});

test('property 3: the same packet processed twice produces byte-identical JSON', () => {
  const first = JSON.stringify(reportJson([FORM, NOTE]));
  const second = JSON.stringify(reportJson([FORM, NOTE]));
  assert.equal(second, first);
});

test('property 4: redacting an already-redacted bundle changes nothing', () => {
  const bundle = buildBundle([FORM, NOTE], OPTS);
  const once = redactBundle(bundle);
  const twice = redactBundle(once);
  assert.equal(JSON.stringify(twice), JSON.stringify(once), 'redaction must be idempotent');
});

test('property 4b: redact idempotence holds on the findings-aware path too', () => {
  const bundle = buildBundle([FORM, NOTE], OPTS);
  const findings = runEngine(bundle);
  const once = redactBundle({ ...bundle, findings }, { redactFindings: true });
  const twice = redactBundle(once, { redactFindings: true });
  assert.equal(JSON.stringify(twice), JSON.stringify(once));
});
