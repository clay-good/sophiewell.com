// spec-v191 §2: dermatology / urology severity & staging - SCORTEN, AJCC
// melanoma T category, PI-RADS v2.1, Guy's stone score. Criteria / boundaries
// cross-verified (spec-v97).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scorten, melanomaTStage, piRads, guysStoneScore } from '../../lib/dermuro-v191.js';

test('scorten: seven criteria and mortality bands', () => {
  // no criteria -> 0, band 0-1, 3.2%
  const none = scorten({ age: 30, heartRate: 80, bsaDetached: 5, bun: 15, bicarbonate: 24, glucose: 100 });
  assert.equal(none.score, 0);
  assert.equal(none.mortality, '3.2%');
  // age>=40 + HR>120 + BUN>28 = 3 -> 35.3%
  const three = scorten({ age: 55, heartRate: 130, bun: 40, bicarbonate: 24, glucose: 100, bsaDetached: 5 });
  assert.equal(three.score, 3);
  assert.equal(three.mortality, '35.3%');
  // five criteria -> >=5 band, 90%
  const five = scorten({ age: 60, heartRate: 130, malignancy: '1', bsaDetached: 20, bun: 40, bicarbonate: 24, glucose: 100 });
  assert.equal(five.score, 5);
  assert.equal(five.mortality, '90%');
  // an invalid filled lab blocks
  assert.equal(scorten({ age: 60, bun: -3 }).valid, false);
});

test('melanoma-t-stage: 0.8 mm split and ulceration suffix', () => {
  assert.equal(melanomaTStage({ breslow: 0.5 }).tCategory, 'T1a');            // <0.8, no ulcer
  assert.equal(melanomaTStage({ breslow: 0.5, ulceration: '1' }).tCategory, 'T1b'); // <0.8 with ulcer
  assert.equal(melanomaTStage({ breslow: 0.9 }).tCategory, 'T1b');            // 0.8-1.0 no ulcer -> T1b
  assert.equal(melanomaTStage({ breslow: 1.0 }).tCategory, 'T1b');            // exactly 1.0 -> T1
  assert.equal(melanomaTStage({ breslow: 1.5, ulceration: '1' }).tCategory, 'T2b');
  assert.equal(melanomaTStage({ breslow: 3.0 }).tCategory, 'T3a');
  assert.equal(melanomaTStage({ breslow: 5.0, ulceration: '1' }).tCategory, 'T4b');
  assert.equal(melanomaTStage({}).valid, false);
});

test('pi-rads: zone-specific score-3 upgrades', () => {
  // peripheral: DWI 3 stays 3 unless DCE positive
  assert.equal(piRads({ zone: 'peripheral', dwi: 3, dce: 'negative' }).category, 3);
  assert.equal(piRads({ zone: 'peripheral', dwi: 3, dce: 'positive' }).category, 4);
  assert.equal(piRads({ zone: 'peripheral', dwi: 5 }).category, 5);
  // transition: T2W 3 upgrades to 4 only if DWI = 5
  assert.equal(piRads({ zone: 'transition', t2w: 3, dwi: 4 }).category, 3);
  assert.equal(piRads({ zone: 'transition', t2w: 3, dwi: 5 }).category, 4);
  // transition: T2W 2 upgrades to 3 if DWI >= 4
  assert.equal(piRads({ zone: 'transition', t2w: 2, dwi: 4 }).category, 3);
  assert.equal(piRads({ zone: 'transition', t2w: 2, dwi: 3 }).category, 2);
  assert.equal(piRads({ zone: 'peripheral' }).valid, false);
});

test("guys-stone-score: grades I-IV with SFR", () => {
  assert.equal(guysStoneScore({ grade: 1 }).gradeLabel, 'Grade I');
  assert.match(guysStoneScore({ grade: 1 }).sfr, /81/);
  assert.equal(guysStoneScore({ grade: 4 }).gradeLabel, 'Grade IV');
  assert.equal(guysStoneScore({ grade: 4 }).abnormal, true);
  assert.equal(guysStoneScore({ grade: 2 }).abnormal, false);
  assert.equal(guysStoneScore({}).valid, false);
  assert.equal(guysStoneScore({ grade: 5 }).valid, false);
});
