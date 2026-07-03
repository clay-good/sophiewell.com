// spec-v217: worked examples for the stroke & neuro-vascular risk scores.
// Point systems spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canadianTia, astral, soar, plan, sitsSich, vasograde, ogilvyCarter,
} from '../../lib/stroke-risk-v217.js';

test('canadian-tia: medium band', () => {
  const r = canadianTia({ antiplatelet: true, dbp110: true, afEcg: true }); // 3+3+2=8
  assert.equal(r.score, 8);
  assert.match(r.band, /medium/);
});
test('canadian-tia: vertigo subtracts', () => {
  const r = canadianTia({ vertigo: true, gait: true }); // -3 +1 = -2
  assert.equal(r.score, -2);
  assert.equal(r.abnormal, false);
});
test('canadian-tia: high band', () => {
  const r = canadianTia({ antiplatelet: true, glucose15: true, dbp110: true }); // 3+3+3=9
  assert.equal(r.score, 9);
  assert.match(r.band, /high/);
});

test('astral: age/5 + nihss + flags', () => {
  const r = astral({ age: 75, nihss: 10, onsetOver3h: true }); // 15+10+2
  assert.equal(r.score, 27);
});
test('astral: invalid without age/nihss', () => { assert.equal(astral({ age: 70 }).valid, false); });

test('soar: sums selects', () => {
  const r = soar({ subtype: '1', ocsp: '2', ageBand: '1', rankin: '0' });
  assert.equal(r.score, 4);
  assert.match(r.band, /elevated/);
});
test('soar: low band', () => {
  const r = soar({ subtype: '0', ocsp: '0', ageBand: '1', rankin: '0' });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
});

test('plan: half-points and age/decade', () => {
  const r = plan({ age: 80, reducedLoc: true, armWeakness: true }); // 8+5+2=15
  assert.equal(r.score, 15);
  assert.match(r.band, /high/);
});
test('plan: half-point comorbidities', () => {
  const r = plan({ age: 50, dependence: true, cancer: true }); // 5 + 1.5 + 1.5 = 8
  assert.equal(r.score, 8);
});
test('plan: invalid without age', () => { assert.equal(plan({}).valid, false); });

test('sits-sich: high band', () => {
  // ap 2, nihss15 -> 2, glu200 -> 2, sbp150 -> 1, wt80 -> 0, age75 -> 1, onset 1, htn 1 = 10
  const r = sitsSich({ antiplatelet: '2', nihss: 15, glucose: 200, sbp: 150, weight: 80, age: 75, onset180: true, hypertension: true });
  assert.equal(r.score, 10);
  assert.match(r.band, /high/);
});
test('sits-sich: low band', () => {
  const r = sitsSich({ antiplatelet: '0', nihss: 5, glucose: 100, sbp: 130, weight: 70, age: 60 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('vasograde: green low', () => {
  const r = vasograde({ modifiedFisher: 2, wfns: 2 });
  assert.equal(r.grade, 'Green');
  assert.equal(r.abnormal, false);
});
test('vasograde: red when WFNS >= 4', () => {
  assert.equal(vasograde({ modifiedFisher: 1, wfns: 5 }).grade, 'Red');
});
test('vasograde: yellow when mFisher >= 3', () => {
  assert.equal(vasograde({ modifiedFisher: 3, wfns: 2 }).grade, 'Yellow');
});

test('ogilvy-carter: sum of five', () => {
  const r = ogilvyCarter({ ageOver50: true, huntHess45: true, fisher34: true });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
});
test('ogilvy-carter: zero', () => {
  assert.equal(ogilvyCarter({}).score, 0);
});
