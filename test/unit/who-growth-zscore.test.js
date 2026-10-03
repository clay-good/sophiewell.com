// spec-v141 2.2: WHO 2006 weight/length-for-age z-score (WHO MGRS 2006).
// LMS transform; length-for-age uses L = 1 (the L -> 0-distinct linear case).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whoGrowthZscore } from '../../lib/peds-growth-v141.js';

test('6mo boy 5.5 kg -> severely low (z below -3)', () => {
  const r = whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 6, value: 5.5 });
  assert.equal(r.valid, true);
  // spec-v1548: beyond -3 the z is WHO's restricted one (-3.25); the plain LMS transform gave -3.27.
  assert.equal(r.z, -3.25);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /severely low/);
});

test('median weight gives z ~ 0', () => {
  // WHO boy weight-for-age at 0 mo median M = 3.3464 kg.
  const r = whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 0, value: 3.3464 });
  assert.equal(r.valid, true);
  assert.ok(Math.abs(r.z) < 0.005, `expected z near 0, got ${r.z}`);
});

test('length-for-age uses L = 1 (linear)', () => {
  const r = whoGrowthZscore({ sex: 'male', measure: 'length', ageMonths: 24, value: 80 });
  assert.equal(r.valid, true);
  assert.match(r.measure, /length-for-age/);
  assert.match(r.band, /stunted/);
});

test('weight within reference range is flagged normal', () => {
  const r = whoGrowthZscore({ sex: 'female', measure: 'weight', ageMonths: 12, value: 9.5 });
  assert.equal(r.valid, true);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /within the WHO reference range/);
});

test('domain guards: age > 24, missing measure / value -> valid:false', () => {
  assert.equal(whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 30, value: 12 }).valid, false);
  assert.equal(whoGrowthZscore({ sex: 'male', ageMonths: 6, value: 7 }).valid, false);
  assert.equal(whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 6 }).valid, false);
  assert.equal(whoGrowthZscore({ measure: 'weight', ageMonths: 6, value: 7 }).valid, false);
  assert.equal(whoGrowthZscore(0).valid, false);
});

// spec-v1548 §1: WHO's restricted z beyond +/-3 for weight-for-age. The three rows the research read from
// WHO's daily tables; the plain LMS transform gave -5.05, -5.05 and +4.71.
test('weight-for-age beyond +/-3 is the restricted z WHO Anthro prints', async () => {
  for (const [sex, days, kg, who] of [['male', 365, '5.5', -4.75], ['female', 183, '4.0', -4.69], ['male', 365, '16.0', 4.96]]) {
    assert.equal(whoGrowthZscore({ sex, measure: 'weight', ageMonths: String(days / 30.4375), value: kg }).z, who, `${sex} ${days} d ${kg} kg`);
  }
  const { restrictedZ } = await import('../../lib/peds-growth-v141.js');
  const { lmsToZ } = await import('../../lib/growth-lms-data.js');
  // Inside +/-3 nothing changes, and at exactly +/-3 the two agree, so no band moves.
  const [L, M, S] = [0.2, 10, 0.12];
  for (const y of [7.5, 10, 13]) assert.equal(restrictedZ(L, M, S, y), lmsToZ(L, M, S, y));
  const at3 = M * Math.pow(1 + L * S * 3, 1 / L);
  assert.ok(Math.abs(restrictedZ(L, M, S, at3) - 3) < 1e-9);
});

test('length-for-age keeps the plain formula; implausible values are flagged and still shown', () => {
  const flagged = whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: '12', value: '3' });
  assert.equal(flagged.implausible, true);
  assert.ok(flagged.z < -6);
  assert.match(flagged.band, /Check the measurement: WHO flags a weight-for-age z below −6 or above \+5/);
  const fine = whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: '12', value: '5.5' });
  assert.equal(fine.implausible, false);
  assert.doesNotMatch(fine.band, /Check the measurement/);
});
