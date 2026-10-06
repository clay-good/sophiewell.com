// spec-v141 2.2: WHO 2006 weight/length-for-age z-score (WHO MGRS 2006).
// LMS transform; length-for-age uses L = 1 (the L -> 0-distinct linear case).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whoGrowthZscore } from '../../lib/peds-growth-v141.js';

test('6mo boy 5.5 kg -> severely low (z below -3)', () => {
  const r = whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 6, value: 5.5, edema: 'no' });
  assert.equal(r.valid, true);
  // spec-v1548: beyond -3 the z is WHO's restricted one (-3.25); the plain LMS transform gave -3.27.
  assert.equal(r.z, -3.25);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /severely low/);
});

test('median weight gives z ~ 0', () => {
  // WHO boy weight-for-age at 0 mo median M = 3.3464 kg.
  const r = whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 0, value: 3.3464, edema: 'no' });
  assert.equal(r.valid, true);
  assert.ok(Math.abs(r.z) < 0.005, `expected z near 0, got ${r.z}`);
});

test('length-for-age uses L = 1 (linear)', () => {
  const r = whoGrowthZscore({ sex: 'male', measure: 'length', ageMonths: 24, value: 80, position: 'lying' });
  assert.equal(r.valid, true);
  assert.match(r.measure, /length-for-age/);
  assert.match(r.band, /stunted/);
});

test('weight within reference range is flagged normal', () => {
  const r = whoGrowthZscore({ sex: 'female', measure: 'weight', ageMonths: 12, value: 9.5, edema: 'no' });
  assert.equal(r.valid, true);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /within the WHO reference range/);
});

test('domain guards: age > 24, missing measure / value -> valid:false', () => {
  assert.equal(whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 30, value: 12, edema: 'no' }).valid, false);
  assert.equal(whoGrowthZscore({ sex: 'male', ageMonths: 6, value: 7 }).valid, false);
  assert.equal(whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 6, edema: 'no' }).valid, false);
  assert.equal(whoGrowthZscore({ measure: 'weight', ageMonths: 6, value: 7, edema: 'no' }).valid, false);
  assert.equal(whoGrowthZscore(0).valid, false);
});

// spec-v1548 §1: WHO's restricted z beyond +/-3 for weight-for-age. The three rows the research read from
// WHO's daily tables; the plain LMS transform gave -5.05, -5.05 and +4.71.
test('weight-for-age beyond +/-3 is the restricted z WHO Anthro prints', async () => {
  for (const [sex, days, kg, who] of [['male', 365, '5.5', -4.75], ['female', 183, '4.0', -4.69], ['male', 365, '16.0', 4.96]]) {
    assert.equal(whoGrowthZscore({ sex, measure: 'weight', ageMonths: String(days / 30.4375), value: kg, edema: 'no' }).z, who, `${sex} ${days} d ${kg} kg`);
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
  const flagged = whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: '12', value: '3', edema: 'no' });
  assert.equal(flagged.implausible, true);
  assert.ok(flagged.z < -6);
  assert.match(flagged.band, /Check the measurement: WHO flags a weight-for-age z below −6 or above \+5/);
  const fine = whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: '12', value: '5.5', edema: 'no' });
  assert.equal(fine.implausible, false);
  assert.doesNotMatch(fine.band, /Check the measurement/);
});

// spec-v1548 §1 changes 2, 3, 5 and 6: weight-for-length/height, head circumference, the 0.7 cm rule,
// edema, and range refusals. Medians are the CDC-redistributed WHO M values.
const wfl = (o) => whoGrowthZscore({ measure: 'wfl', edema: 'no', ...o });

test('weight-for-length and weight-for-height reproduce the WHO median and stop at 109.3 cm', async () => {
  const { WHO_WFL } = await import('../../lib/growth-lms-data.js');
  // A girl of 12 months at 74 cm lying: the median weight gives z 0.
  const m74 = WHO_WFL.female.M[WHO_WFL.female.age.indexOf(74)];
  assert.ok(Math.abs(wfl({ sex: 'female', ageMonths: 12, lengthCm: 74, value: m74, position: 'lying' }).z) < 0.005);
  // Weight-for-height at 65.0 cm is weight-for-length at 65.7 cm (WHO's boy median there is 7.4327 kg).
  const h65 = wfl({ sex: 'male', ageMonths: 36, lengthCm: 65, value: 7.4327, position: 'standing' });
  assert.equal(h65.measure, 'weight-for-height');
  assert.ok(Math.abs(h65.z) < 0.01, `z ${h65.z}`);
  assert.equal(wfl({ sex: 'male', ageMonths: 36, lengthCm: 109.3, value: 18, position: 'standing' }).valid, true);
  assert.equal(wfl({ sex: 'male', ageMonths: 36, lengthCm: 109.4, value: 18, position: 'standing' }).valid, false);
  assert.equal(wfl({ sex: 'male', ageMonths: 12, lengthCm: 44.9, value: 2, position: 'lying' }).valid, false);
  assert.equal(wfl({ sex: 'male', ageMonths: 61, lengthCm: 100, value: 15, position: 'standing' }).valid, false);
});

test('the 0.7 cm rule turns at 731 days', () => {
  const at730 = wfl({ sex: 'male', ageMonths: 730 / 30.4375, lengthCm: 80, value: 10, position: 'standing' });
  assert.equal(at730.measure, 'weight-for-length');
  assert.match(at730.band, /80\.7 cm \(plus 0\.7 cm\)/);
  const at731 = wfl({ sex: 'male', ageMonths: 731 / 30.4375, lengthCm: 80, value: 10, position: 'standing' });
  assert.equal(at731.measure, 'weight-for-height');
  assert.doesNotMatch(at731.band, /0\.7 cm/);
  // A lying length from 2 years loses 0.7 cm; read on the weight-for-height table that is the same curve.
  const lying = wfl({ sex: 'male', ageMonths: 731 / 30.4375, lengthCm: 80.7, value: 10, position: 'lying' });
  assert.equal(lying.z, at731.z);
  assert.match(lying.band, /minus 0\.7 cm/);
  // Length-for-age: standing under 2 years adds 0.7 cm; standing under 9 months is flagged.
  const st = whoGrowthZscore({ sex: 'male', measure: 'length', ageMonths: 4, value: 60, position: 'standing' });
  const ly = whoGrowthZscore({ sex: 'male', measure: 'length', ageMonths: 4, value: 60.7, position: 'lying' });
  assert.equal(st.z, ly.z);
  assert.match(st.band, /under 9 months is unusual/);
});

test('position and edema are required where they matter; edema withholds the weight z', () => {
  assert.equal(whoGrowthZscore({ sex: 'male', measure: 'length', ageMonths: 6, value: 65 }).valid, false);
  assert.equal(whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 6, value: 7 }).valid, false);
  assert.equal(whoGrowthZscore({ sex: 'male', measure: 'wfl', ageMonths: 6, value: 7, lengthCm: 65, position: 'lying' }).valid, false);
  assert.equal(wfl({ sex: 'male', ageMonths: 6, value: 7, position: 'lying' }).valid, false);
  for (const measure of ['weight', 'wfl']) {
    const r = whoGrowthZscore({ sex: 'male', measure, ageMonths: 12, value: 6, lengthCm: 70, position: 'lying', edema: 'yes' });
    assert.equal(r.valid, true);
    assert.equal(r.z, null);
    assert.equal(r.abnormal, true);
    assert.match(r.band, /severe acute malnutrition/);
  }
  // Head circumference needs neither.
  assert.equal(whoGrowthZscore({ sex: 'female', measure: 'hc', ageMonths: 6, value: 42 }).valid, true);
});

test('head circumference-for-age: median is z 0, plain formula, 0-24 months only', async () => {
  const { WHO_HC_AGE } = await import('../../lib/growth-lms-data.js');
  const r = whoGrowthZscore({ sex: 'male', measure: 'hc', ageMonths: 0, value: WHO_HC_AGE.male.M[0] });
  assert.ok(Math.abs(r.z) < 0.005);
  // L = 1: z is linear in the measurement, no restriction beyond -3.
  const M6 = WHO_HC_AGE.female.M[6]; const S6 = WHO_HC_AGE.female.S[6];
  assert.equal(whoGrowthZscore({ sex: 'female', measure: 'hc', ageMonths: 6, value: M6 * (1 - 4 * S6) }).z, -4);
  assert.equal(whoGrowthZscore({ sex: 'female', measure: 'hc', ageMonths: 25, value: 45 }).valid, false);
});

test('implausible flags for weight-for-length and head circumference are beyond +/-5', async () => {
  const { WHO_HC_AGE } = await import('../../lib/growth-lms-data.js');
  const M6 = WHO_HC_AGE.female.M[6]; const S6 = WHO_HC_AGE.female.S[6];
  const hc = (k) => whoGrowthZscore({ sex: 'female', measure: 'hc', ageMonths: 6, value: M6 * (1 + k * S6) });
  assert.equal(hc(-4.99).implausible, false);
  assert.equal(hc(-5.01).implausible, true);
  assert.match(hc(5.01).band, /head circumference-for-age z below −5 or above \+5/);
  const thin = wfl({ sex: 'male', ageMonths: 12, lengthCm: 75, value: 4, position: 'lying' });
  assert.ok(thin.z < -5);
  assert.equal(thin.implausible, true);
});
