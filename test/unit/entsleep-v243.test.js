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

test('no-apnea: > 3 high risk', () => {
  const r = noApnea({ neck: 41, age: 50 }); // 3 + 2
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
});
test('no-apnea: low risk', () => {
  const r = noApnea({ neck: 36, age: 30 }); // 0 + 0
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('sleep-efficiency: TST/TIB x 100', () => {
  const r = sleepEfficiency({ tst: 420, tib: 480 });
  assert.equal(r.score, 87.5);
  assert.equal(r.abnormal, false);
});
test('sleep-efficiency: cannot exceed time in bed', () => {
  assert.equal(sleepEfficiency({ tst: 500, tib: 480 }).valid, false);
});
