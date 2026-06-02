// spec-v52 §4.3: PA document classifier + payer-detect.
//
// One assertion per role / payer bucket exercising the keyword
// anchors. Failures here cascade into wrong rule scoping
// (especially R-PA-005, which is scoped to clinical-note documents),
// so the contract is asserted here rather than via UI integration.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyDocument } from '../../lib/pa/classify.js';
import { detectPayer, detectPacketPayer } from '../../lib/pa/payer.js';
import { buildBundle, runEngine } from '../../lib/pa/engine.js';

// ---- classifier ----

test('classifyDocument: clinical-note via HPI / A&P anchors', () => {
  assert.equal(classifyDocument('Chief complaint: cough\nHistory of present illness: ...'), 'clinical-note');
  assert.equal(classifyDocument('Assessment and plan: continue lisinopril.'), 'clinical-note');
  assert.equal(classifyDocument('SOAP note: S O A P sections follow.'), 'clinical-note');
});

test('classifyDocument: pa-form via authorization-request anchors', () => {
  assert.equal(classifyDocument('Prior Authorization Request Form\nMember:...'), 'pa-form');
  assert.equal(classifyDocument('Request for Prior Authorization'), 'pa-form');
});

test('classifyDocument: medical-necessity-letter', () => {
  assert.equal(classifyDocument('Letter of Medical Necessity\nTo whom it may concern,'), 'medical-necessity-letter');
});

test('classifyDocument: lab-result via reference range', () => {
  assert.equal(classifyDocument('Laboratory report\nReference range: 3.5-5.0'), 'lab-result');
});

test('classifyDocument: imaging-report via MRI + findings', () => {
  assert.equal(classifyDocument('MRI of the lumbar spine.\nFindings: ...\nImpression: ...'), 'imaging-report');
});

test('classifyDocument: prior-auth-denial', () => {
  assert.equal(classifyDocument('NOTICE OF DENIAL\nDenial reason: not medically necessary.'), 'prior-auth-denial');
});

test('classifyDocument: empty / unrecognized text falls back to "other"', () => {
  assert.equal(classifyDocument(''), 'other');
  assert.equal(classifyDocument('random text with no anchors'), 'other');
});

// ---- payer-detect ----

test('detectPayer: Medicare Advantage beats Medicare even when both phrases present', () => {
  assert.equal(detectPayer('Aetna Medicare Advantage plan'), 'cms-medicare-advantage');
  assert.equal(detectPayer('Humana Gold Plus MA plan'), 'cms-medicare-advantage');
});

test('detectPayer: Medicaid', () => {
  assert.equal(detectPayer('California Medi-Cal program'), 'medicaid');
  assert.equal(detectPayer('Member is enrolled in state Medicaid managed care'), 'medicaid');
});

test('detectPayer: Medicare FFS', () => {
  assert.equal(detectPayer('Medicare Part B covered service'), 'cms-medicare-ffs');
  assert.equal(detectPayer('MAC jurisdiction Noridian Medicare'), 'cms-medicare-ffs');
});

test('detectPayer: commercial fallthrough', () => {
  // Generic Blues (not Anthem/Elevance) and other commercial plans fall through.
  assert.equal(detectPayer('Florida Blue BlueCross PPO plan'), 'commercial');
  assert.equal(detectPayer('Humana ChoiceCare PPO'), 'commercial');
});

test('detectPayer: Aetna commercial routes to its own bucket (wave 52-7)', () => {
  // Plain Aetna commercial -> the named 'aetna' overlay bucket.
  assert.equal(detectPayer('Aetna Choice POS II member'), 'aetna');
  // ...but Aetna Medicare Advantage still routes to the MA bucket (checked first).
  assert.equal(detectPayer('Aetna Medicare Advantage HMO'), 'cms-medicare-advantage');
});

test('detectPayer: UnitedHealthcare commercial routes to its own bucket (wave 52-8)', () => {
  // Plain UHC commercial -> the named 'uhc' overlay bucket.
  assert.equal(detectPayer('UnitedHealthcare Choice Plus'), 'uhc');
  assert.equal(detectPayer('United Healthcare PPO member'), 'uhc');
  // ...but UHC Medicare Advantage still routes to the MA bucket (checked first).
  assert.equal(detectPayer('UnitedHealthcare Medicare Advantage HMO'), 'cms-medicare-advantage');
});

test('detectPayer: Anthem / Elevance commercial routes to its own bucket (wave 52-9)', () => {
  // Anthem (and the Elevance Health parent) -> the named 'anthem' overlay bucket.
  assert.equal(detectPayer('Anthem Blue Cross PPO plan'), 'anthem');
  assert.equal(detectPayer('Elevance Health member'), 'anthem');
  // ...but an explicit Anthem Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Anthem Medicare Advantage HMO'), 'cms-medicare-advantage');
  // Generic Blues without the Anthem/Elevance name stay in the commercial bucket.
  assert.equal(detectPayer('Blue Shield of California PPO'), 'commercial');
});

test('detectPayer: Cigna commercial routes to its own bucket (wave 52-10)', () => {
  // Plain Cigna commercial (and the Evernorth health-services brand) -> the
  // named 'cigna' overlay bucket.
  assert.equal(detectPayer('Cigna Open Access Plus'), 'cigna');
  assert.equal(detectPayer('Evernorth Behavioral Health member'), 'cigna');
  // ...but an explicit Cigna Medicare Advantage string still routes to the MA bucket.
  assert.equal(detectPayer('Cigna Medicare Advantage HMO'), 'cms-medicare-advantage');
});

test('detectPayer: unknown for empty / non-payer text', () => {
  assert.equal(detectPayer(''), 'unknown');
  assert.equal(detectPayer('this packet has no payer letterhead'), 'unknown');
});

test('detectPacketPayer: majority across documents, unknowns excluded', () => {
  const docs = [
    { text: 'Aetna Medicare Advantage' },
    { text: 'Aetna Medicare Advantage' },
    { text: 'this packet has no payer letterhead' },
  ];
  assert.equal(detectPacketPayer(docs), 'cms-medicare-advantage');
});

// ---- R-PA-005 refactor: clinical-note scoping ----

test('R-PA-005 only counts dates from clinical-note documents when one is present', () => {
  // DOB 1985-03-12 lives in a non-clinical doc; the only clinical-note
  // date is the recent service date. R-PA-005 must pass.
  const docs = [
    { name: 'id-page.txt', sha256: 'x', kind: 'TXT',
      text: 'DOB: 1985-03-12\nMember ID: W123456789\n' },
    { name: 'note.txt', sha256: 'y', kind: 'TXT',
      text: 'Chief complaint: hypertension\nDate of service: 2026-04-12\nAssessment and plan: continue lisinopril.\n' },
  ];
  const bundle = buildBundle(docs, { totalBytes: 4096 });
  const findings = runEngine(bundle);
  const f = findings.find((x) => x.ruleId === 'R-PA-005');
  assert.equal(f.status, 'pass');
});
