// spec-v533: the Renal Angina Index.
// Worked-example tests: the product (not sum) combination, the twelve reachable totals and the gaps between
// them, the threshold at 8 and which injury level each risk stratum needs to reach it, and the guards.
// Strata, points, and the threshold transcribed from Basu and colleagues 2014 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renalAngina, RAI_RISK, RAI_INJURY, RAI_REACHABLE } from '../../lib/renal-angina-v533.js';

test('three risk strata and four injury strata', () => {
  assert.deepEqual(RAI_RISK.map((r) => r.points), [1, 3, 5]);
  assert.deepEqual(RAI_INJURY.map((i) => i.points), [1, 2, 4, 8]);
});

test('the score is a PRODUCT, not a sum', () => {
  const r = renalAngina({ risk: '5', injury: '8' });
  assert.equal(r.total, 40);          // 5 x 8
  assert.notEqual(r.total, 13);       // 5 + 8, which is what a sum would give
  assert.equal(renalAngina({ risk: '3', injury: '4' }).total, 12);
  assert.equal(renalAngina({ risk: '1', injury: '1' }).total, 1);
});

test('only twelve totals are reachable, and the gaps are real', () => {
  assert.deepEqual(RAI_REACHABLE, [1, 2, 3, 4, 5, 6, 8, 10, 12, 20, 24, 40]);
  for (const gap of [7, 9, 11, 15, 16, 32]) {
    assert.ok(!RAI_REACHABLE.includes(gap), `${gap} must not be reachable`);
  }
  // Every reachable value really is a product of the two tier sets.
  for (const v of RAI_REACHABLE) {
    assert.ok(RAI_RISK.some((r) => RAI_INJURY.some((i) => r.points * i.points === v)));
  }
});

test('the threshold is 8 or more', () => {
  assert.equal(renalAngina({ risk: '1', injury: '4' }).positive, false);  // 4
  assert.equal(renalAngina({ risk: '3', injury: '2' }).positive, false);  // 6
  assert.equal(renalAngina({ risk: '1', injury: '8' }).positive, true);   // 8
  assert.equal(renalAngina({ risk: '3', injury: '4' }).positive, true);   // 12
  assert.equal(renalAngina({ risk: '5', injury: '2' }).positive, true);   // 10
});

test('each risk stratum needs a different injury level to reach the threshold', () => {
  assert.match(renalAngina({ risk: '1', injury: '1' }).band, /risk stratum of 1, an injury stratum of 8 or more/);
  assert.match(renalAngina({ risk: '3', injury: '1' }).band, /risk stratum of 3, an injury stratum of 4 or more/);
  assert.match(renalAngina({ risk: '5', injury: '1' }).band, /risk stratum of 5, an injury stratum of 2 or more/);
});

test('a transplanted child with moderate injury fulfills renal angina (the META example)', () => {
  const r = renalAngina({ risk: '3', injury: '4' });
  assert.equal(r.valid, true);
  assert.equal(r.riskPoints, 3);
  assert.equal(r.injuryPoints, 4);
  assert.equal(r.total, 12);
  assert.equal(r.positive, true);
  assert.match(r.bandLabel, /RAI 12, renal angina fulfilled/);
});

test('the very-high risk tier is stated as AND, not OR', () => {
  const five = RAI_RISK.find((r) => r.points === 5);
  assert.match(five.text, /AND vasoactive/);
  assert.doesNotMatch(five.text, /ventilation or vasoactive/i);
  assert.match(renalAngina({ risk: '5', injury: '1' }).note, /not either/);
});

test('the injury tiers use whichever route is worse', () => {
  assert.match(renalAngina({ risk: '1', injury: '2' }).note, /whichever is worse/);
  for (const i of RAI_INJURY) assert.match(i.text, /eCrCl|creatinine clearance/);
  for (const i of RAI_INJURY) assert.match(i.text, /fluid overload/);
});

test('the copy frames it as a rule-out and refuses the staging reading', () => {
  const n = renalAngina({ risk: '1', injury: '1' }).note;
  assert.match(n, /designed as a rule-out/);
  assert.match(n, /high negative predictive value/);
  assert.match(n, /does not diagnose acute kidney injury and does not stage it/);
  assert.match(n, /RIFLE, AKIN, and KDIGO/);
  assert.match(n, /critically ill children/);
});

test('the band names the reachable set rather than implying a scale out of 40', () => {
  const r = renalAngina({ risk: '3', injury: '4' });
  assert.match(r.band, /Only twelve totals are reachable/);
  assert.match(r.band, /not a continuous scale out of 40/);
});

test('missing or invalid strata are rejected, and the injury message explains the doubling', () => {
  assert.equal(renalAngina({}).valid, false);
  assert.equal(renalAngina({ risk: '1' }).valid, false);
  assert.equal(renalAngina({ risk: '2', injury: '1' }).valid, false);
  const r = renalAngina({ risk: '1', injury: '3' });
  assert.equal(r.valid, false);
  assert.match(r.message, /There is no 3, 5, 6, or 7: the tiers double/);
});
