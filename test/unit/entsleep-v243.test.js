// spec-v243: worked examples for the ENT / sleep screening tools. Point systems /
// formulas spec-v97 verified (Stewart 2004; Belafsky 2001; Duarte 2018; sleep
// efficiency).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { noseScale, rfsRefluxFinding, noApnea, sleepEfficiency } from '../../lib/entsleep-v243.js';

test('nose-scale: raw x 5, moderate band', () => {
  const r = noseScale({ congestion: 2, blockage: 2, breathing: 2, sleep: 2, exertion: 2 });
  assert.equal(r.score, 50);
  assert.equal(r.abnormal, true);
});
test('nose-scale: mild band not flagged', () => {
  const r = noseScale({ congestion: 1, blockage: 1 }); // 10
  assert.equal(r.score, 10);
  assert.equal(r.abnormal, false);
});

test('rfs: > 7 LPR likely', () => {
  const r = rfsRefluxFinding({ ventricular: 2, erythema: 2, vocalFoldEdema: 2, diffuseEdema: 2 });
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, true);
});
test('rfs: <= 7 unlikely', () => {
  assert.equal(rfsRefluxFinding({ subglottic: 2, granuloma: 2 }).abnormal, false);
});

test('no-apnea: at or above 3 is high risk', () => {
  const r = noApnea({ neck: 41, age: 50 }); // 3 + 2
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
});
test('no-apnea: low risk', () => {
  const r = noApnea({ neck: 36, age: 30 }); // 0 + 0
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

// spec-v961: the boundary this tile used to get wrong. The derivation says it in one line --
// "We used the cutoff >= 3 to classify patients at high risk of having OSA" (Duarte 2018,
// J Clin Sleep Med 14:1097-1107, PMC6040787) -- and the code read `score > 3`, so a patient
// scoring exactly the paper's threshold was told they were lower risk. Both sides are pinned.
test('no-apnea: a score of exactly 3 is HIGH risk, not lower', () => {
  const r = noApnea({ neck: 40, age: 30 }); // 3 + 0 = 3, the cutoff itself
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true, 'a score of 3 meets the derivation cutoff of >= 3');
  assert.match(r.band, />= 3/);
});
test('no-apnea: 2 is the highest lower-risk score', () => {
  const r = noApnea({ neck: 37, age: 35 }); // 1 + 1 = 2
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /< 3/);
});
test('no-apnea: the note says it is a two-item model', () => {
  // The citation used to call it "a 4-item instrument", which is the GOAL questionnaire from
  // the same group -- and it contradicted this tile's own two inputs.
  const r = noApnea({ neck: 40, age: 30 });
  assert.match(r.note, /TWO-item model/);
  assert.match(r.note, /GOAL questionnaire/);
});

test('sleep-efficiency: TST/TIB x 100', () => {
  const r = sleepEfficiency({ tst: 420, tib: 480 });
  assert.equal(r.score, 87.5);
  assert.equal(r.abnormal, false);
});
test('sleep-efficiency: cannot exceed time in bed', () => {
  assert.equal(sleepEfficiency({ tst: 500, tib: 480 }).valid, false);
});
