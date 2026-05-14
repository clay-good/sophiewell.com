// spec-v7 §3.3: deterministic artifact-detect classifier tests.
//
// Each kind in ARTIFACT_KINDS gets a representative fixture excerpt and
// must classify correctly without the test relying on any network, file
// system, or non-deterministic input. The fixture excerpts below are
// hand-written paraphrases shaped after public sample documents (CMS
// MSN sample, sample 1500 / UB-04 statements, ARUP lab report layout,
// HHS adverse benefit determination boilerplate). No real patient
// data, no copyrighted document text.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ARTIFACT_KINDS,
  detectArtifact,
  detectArtifactKind,
  normalizeText,
} from '../../lib/artifact-detect.js';

const BILL = `
Patient Statement
Statement Date: 04/02/2026
Account: 1234567
CPT 99213 Office visit          $185.00
CPT 85025 CBC w/ diff           $42.00
Amount Due: $227.00
Pay this amount by 05/01/2026.
`;

const EOB = `
EXPLANATION OF BENEFITS - THIS IS NOT A BILL
Claim Number: 2026-AB-9981
Provider: Riverbend Family Medicine
Allowed Amount: $112.00
Patient Responsibility: $25.00
CARC 45: Charge exceeds fee schedule.
`;

const MSN = `
MEDICARE SUMMARY NOTICE - THIS IS NOT A BILL
Your Medicare Number: 1AB2-CD3-EF45
Part B Claims for January-March 2026
Service date 01/14/2026  Office visit  Approved $98.00
`;

const LAB = `
Reference Range
Patient: J Doe   Specimen: Serum   Ordering Provider: Dr. K. Ahmed
Sodium       138  mmol/L   (135-145)
Potassium    4.2  mmol/L   (3.5-5.0)
Creatinine   0.9  mg/dL    (0.6-1.3)
Glucose      92   mg/dL    (70-99)
Hemoglobin   13.4 g/dL     (12.0-16.0)
WBC          6.1  x10^3/uL (4.0-11.0)
`;

const DENIAL = `
Adverse Benefit Determination
Date: 03/15/2026
We have denied your request for prior authorization.
Reason for denial: not medically necessary per plan criteria.
You have the right to appeal this decision within 180 days.
External review is available after internal appeals are exhausted.
`;

const PHARMACY = `
ACME PHARMACY
Rx #4458201
Lisinopril 10 mg tablet
SIG: take 1 tablet by mouth once daily
Refills: 5
Metformin 500 mg tablet
SIG: take 1 tablet by mouth twice daily with meals
Refills: 3
`;

const DISCHARGE = `
DISCHARGE INSTRUCTIONS
Discharge Diagnosis: community-acquired pneumonia
Follow-up: see your primary care provider within 7 days.
Return Precautions: return to the ED for chest pain, fever > 102F,
or shortness of breath at rest.
Medications at discharge: amoxicillin 500 mg three times daily.
`;

const INSURANCE_CARD = `
BLUEPLUS HEALTH PLAN
Member ID: BPH123456789
Group #: 0042
Subscriber: J. Doe
Rx BIN: 610014   Rx PCN: BPHRX
Payer ID: 87726
Copay: $25 PCP / $50 Specialist
`;

const UNKNOWN = `
Hello!
This is just a friendly note to let you know we changed the parking
lot entrance hours starting next Monday.
`;

const FIXTURES = {
  bill: BILL,
  eob: EOB,
  msn: MSN,
  'lab-result': LAB,
  'denial-letter': DENIAL,
  'pharmacy-list': PHARMACY,
  'discharge-summary': DISCHARGE,
  'insurance-card': INSURANCE_CARD,
};

test('ARTIFACT_KINDS covers the spec-v7 §3.3 enum', () => {
  assert.deepEqual(
    [...ARTIFACT_KINDS].sort(),
    ['bill', 'denial-letter', 'discharge-summary', 'eob', 'insurance-card',
      'lab-result', 'msn', 'pharmacy-list'].sort()
  );
});

test('normalizeText lowercases and collapses whitespace', () => {
  assert.equal(normalizeText('  Hello\nWorld  '), 'hello world');
  assert.equal(normalizeText(null), '');
});

for (const kind of ARTIFACT_KINDS) {
  test(`detectArtifact: ${kind} fixture classifies as ${kind}`, () => {
    const result = detectArtifact(FIXTURES[kind]);
    assert.equal(result.kind, kind, `expected ${kind}, got ${result.kind} (score ${result.score})`);
    assert.ok(result.score >= 3, `confidence score too low: ${result.score}`);
    assert.ok(Array.isArray(result.hits) && result.hits.length > 0);
  });
}

test('detectArtifact: empty input → unknown', () => {
  assert.equal(detectArtifact('').kind, 'unknown');
  assert.equal(detectArtifact(null).kind, 'unknown');
});

test('detectArtifact: low-signal text → unknown', () => {
  const r = detectArtifact(UNKNOWN);
  assert.equal(r.kind, 'unknown');
  assert.equal(r.score, 0);
  assert.deepEqual(r.hits, []);
});

test('EOB does not get misrouted to bill even though "balance" tokens appear', () => {
  const eobWithBalance = EOB + '\nPrevious balance on account: $0.00\n';
  assert.equal(detectArtifactKind(eobWithBalance), 'eob');
});

test('A bill with "amount due" + CPT does not get misrouted to lab-result', () => {
  // The bill fixture happens to mention "CBC" via a CPT description.
  assert.equal(detectArtifactKind(BILL), 'bill');
});

test('Lab-result with currency-looking artifacts still classifies correctly when reference range present', () => {
  const lab = LAB + '\nCharge for panel: not applicable\n';
  assert.equal(detectArtifactKind(lab), 'lab-result');
});

test('MSN beats both EOB and bill thanks to the explicit "Medicare Summary Notice" header', () => {
  assert.equal(detectArtifactKind(MSN), 'msn');
});

test('detectArtifactKind matches detectArtifact.kind', () => {
  for (const kind of ARTIFACT_KINDS) {
    assert.equal(detectArtifactKind(FIXTURES[kind]), detectArtifact(FIXTURES[kind]).kind);
  }
});

test('scores object always lists every kind, even unknown returns', () => {
  const r = detectArtifact(UNKNOWN);
  for (const kind of ARTIFACT_KINDS) {
    assert.ok(r.scores[kind], `missing scores entry for ${kind}`);
    assert.equal(typeof r.scores[kind].score, 'number');
    assert.ok(Array.isArray(r.scores[kind].hits));
  }
});

test('determinism: identical input gives identical output across calls', () => {
  const a = detectArtifact(BILL);
  const b = detectArtifact(BILL);
  assert.deepEqual(a, b);
});

test('pharmacy list with discharge token loses to discharge-summary', () => {
  const mixed = PHARMACY + '\nDISCHARGE INSTRUCTIONS\nFollow-up: PCP in 1 week.\nReturn Precautions: see notes.\n';
  assert.equal(detectArtifactKind(mixed), 'discharge-summary');
});
