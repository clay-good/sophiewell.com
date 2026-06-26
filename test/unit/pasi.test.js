// spec-v151 2.1: PASI (Fredriksson 1978). PASI = Σ (E+I+D) × areaGrade × weight
// (head 0.1, upper 0.2, trunk 0.3, lower 0.4), range 0-72; mild <10, moderate
// 10-20, severe >20. Area grade from %: 0->0, 1-9->1, 10-29->2, 30-49->3, 50-69->4,
// 70-89->5, 90-100->6.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pasi } from '../../lib/derm-v151.js';

test('tile example: region-weight worked total -> 16.2 moderate', () => {
  // head (2+2+2)=6 ×2 ×0.1 = 1.2; upper (1+1+1)=3 ×1 ×0.2 = 0.6;
  // lower (3+3+3)=9 ×4 ×0.4 = 14.4; total 16.2.
  const r = pasi({ headE: 2, headI: 2, headD: 2, headArea: 25, upperE: 1, upperI: 1, upperD: 1, upperArea: 5, lowerE: 3, lowerI: 3, lowerD: 3, lowerArea: 60 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 16.2);
  assert.equal(r.bandLabel, 'Moderate');
});

test('all blank -> PASI 0, mild', () => {
  const r = pasi({});
  assert.equal(r.score, 0);
  assert.equal(r.bandLabel, 'Mild');
  assert.equal(r.abnormal, false);
});

test('area-grade %-mapping boundaries (lower region only, weight 0.4, EID sum 3)', () => {
  // EID each 1 -> sum 3; lower weight 0.4. score = 3 × grade × 0.4 = 1.2 × grade.
  const sub = (areaPct) => pasi({ lowerE: 1, lowerI: 1, lowerD: 1, lowerArea: areaPct }).score;
  assert.equal(sub(0), 0); // grade 0
  assert.equal(sub(5), 1.2); // grade 1
  assert.equal(sub(10), 2.4); // grade 2 boundary
  assert.equal(sub(30), 3.6); // grade 3 boundary
  assert.equal(sub(90), 7.2); // grade 6 boundary
});

test('mild/moderate boundary at 10 and moderate/severe at 20', () => {
  // construct exactly 10: lower EID sum 5 (e.g. 4+1+0=5) × grade? 5×grade×0.4.
  // 5×5×0.4 = 10 -> moderate (>=10).  grade 5 needs 70-89%.
  const at10 = pasi({ lowerE: 4, lowerI: 1, lowerD: 0, lowerArea: 75 });
  assert.equal(at10.score, 10);
  assert.equal(at10.bandLabel, 'Moderate');
  // severe > 20: head+lower full
  const severe = pasi({ headE: 4, headI: 4, headD: 4, headArea: 100, lowerE: 4, lowerI: 4, lowerD: 4, lowerArea: 100 });
  assert.ok(severe.score > 20, `got ${severe.score}`);
  assert.equal(severe.bandLabel, 'Severe');
});

test('max all-severe full-area = 72', () => {
  const r = pasi({
    headE: 4, headI: 4, headD: 4, headArea: 100, upperE: 4, upperI: 4, upperD: 4, upperArea: 100,
    trunkE: 4, trunkI: 4, trunkD: 4, trunkArea: 100, lowerE: 4, lowerI: 4, lowerD: 4, lowerArea: 100,
  });
  assert.equal(r.score, 72);
});
