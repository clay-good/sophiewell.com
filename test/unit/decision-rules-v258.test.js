// spec-v258: worked examples for the acute & primary-care decision rules:
// Canadian CT Head Rule, San Francisco Syncope Rule (CHESS), McIsaac score.
// Criteria/weights spec-v97 verified (Stiell 2001; Quinn 2004; McIsaac 1998).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canadianCtHead, sfSyncope, mcisaacScore } from '../../lib/decision-rules-v258.js';

// --- Canadian CT Head Rule ---
test('canadian-ct-head: high-risk criterion only', () => {
  const r = canadianCtHead({ gcs2h: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.startsWith('CT head recommended'));
  assert.ok(r.band.includes('high-risk (neurosurgical): GCS < 15 at 2 h post-injury.'));
});
test('canadian-ct-head: medium-risk criterion only', () => {
  const r = canadianCtHead({ dangerousMechanism: true });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /medium-risk \(clinically important\): dangerous mechanism/);
  assert.doesNotMatch(r.band, /high-risk/);
});
test('canadian-ct-head: all seven absent', () => {
  const r = canadianCtHead({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /CT not required by the rule/);
});
test('canadian-ct-head: high and medium both fire', () => {
  const r = canadianCtHead({ age65: true, retrogradeAmnesia: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /high-risk .*; medium-risk/);
});

// --- San Francisco Syncope Rule (CHESS) ---
test('sf-syncope: crosses the any-positive threshold', () => {
  const r = sfSyncope({ abnormalEcg: true, sbp90: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.startsWith('High risk for a serious 7-day outcome'));
  assert.ok(r.band.includes('CHESS positive: abnormal ECG, systolic BP < 90 mmHg.'));
});
test('sf-syncope: all five negative is low risk', () => {
  const r = sfSyncope({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('all five CHESS criteria negative.'));
});
test('sf-syncope: single CHF item is high risk', () => {
  const r = sfSyncope({ chf: true });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, true);
});

// --- McIsaac score (age adjustment) ---
// Same four clinical features (all present, points = 4) across three ages.
const feats = { fever: true, absentCough: true, adenopathy: true, exudate: true };
test('mcisaac: child (age 8) gets +1 age modifier -> 5', () => {
  const r = mcisaacScore({ age: 8, ...feats });
  assert.equal(r.valid, true);
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('McIsaac 5'));
  assert.ok(r.band.includes('group A strep probability ~51-53%'));
});
test('mcisaac: adult < 45 (age 30) no modifier -> 4', () => {
  const r = mcisaacScore({ age: 30, ...feats });
  assert.equal(r.score, 4);
  assert.ok(r.band.includes('McIsaac 4'));
  assert.ok(r.band.includes('group A strep probability ~51-53%'));
});
test('mcisaac: adult >= 45 (age 50) gets -1 modifier -> 3', () => {
  const r = mcisaacScore({ age: 50, ...feats });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('McIsaac 3'));
  assert.ok(r.band.includes('group A strep probability ~28-35%; rapid antigen test or throat culture, treat if positive.'));
});
test('mcisaac: no age is incomplete', () => {
  const r = mcisaacScore({ fever: true });
  assert.equal(r.valid, false);
});
test('mcisaac: lowest score is bounded at -1', () => {
  const r = mcisaacScore({ age: 70 });
  assert.equal(r.score, -1);
  assert.match(r.band, /probability ~1-2.5%; no testing or antibiotic indicated/);
});
