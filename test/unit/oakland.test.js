// spec-v12 §3.3.4 wave 12-3: Oakland Score boundary examples per the
// shipping contract in spec-v12 §5. Weights reproduce Oakland 2017
// Table 2; <=8 cutoff is the safe-discharge band endorsed by BSG 2019.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oakland } from '../../lib/scoring-v4.js';

// Low edge: 35yo F, no prior LGIB, no DRE blood, HR 65, SBP 165, Hgb 17.
// age 0 + sex 0 + prior 0 + dre 0 + hr 0 + sbp 0 + hgb 0 (Hgb 170 g/L) = 0.
test('oakland low edge: 35F + all-green vitals + Hgb 17 -> 0, safe discharge', () => {
  const r = oakland({ age: 35, sex: 'F', priorLgibAdmission: false,
    dreBlood: false, hr: 65, sbp: 165, hgbGdl: 17 });
  assert.equal(r.parts.age, 0);
  assert.equal(r.parts.sex, 0);
  assert.equal(r.parts.hr, 0);
  assert.equal(r.parts.sbp, 0);
  assert.equal(r.parts.hgb, 0);
  assert.equal(r.score, 0);
  assert.match(r.band, /safe for outpatient/);
});

// Mid: 75yo M with prior LGIB + DRE blood + HR 105 + SBP 100 + Hgb 11.
// age 2 + sex 1 + prior 1 + dre 1 + hr 2 + sbp 4 + hgb (110 g/L -> 8) = 19.
test('oakland mid: 75M with active bleed signs -> 19, not safe', () => {
  const r = oakland({ age: 75, sex: 'M', priorLgibAdmission: true,
    dreBlood: true, hr: 105, sbp: 100, hgbGdl: 11 });
  assert.equal(r.score, 19);
  assert.match(r.band, /not in the safe-discharge/);
});

// High edge: every parameter at the deep-red band -> 35 (maximum).
test('oakland high edge: every red-band value -> 35 (maximum)', () => {
  const r = oakland({ age: 80, sex: 'M', priorLgibAdmission: true,
    dreBlood: true, hr: 115, sbp: 60, hgbGdl: 6 });
  assert.equal(r.parts.age, 2);
  assert.equal(r.parts.sex, 1);
  assert.equal(r.parts.hr, 3);
  assert.equal(r.parts.sbp, 5);
  assert.equal(r.parts.hgb, 22);
  assert.equal(r.score, 35);
  assert.match(r.band, /not in the safe-discharge/);
});

// Threshold edge: 8 vs 9.
test('oakland threshold: 8 -> safe, 9 -> not safe', () => {
  // 50yo F, no prior LGIB, no DRE blood, HR 78, SBP 130, Hgb 13 -> hgb 4.
  // age 1 + sex 0 + prior 0 + dre 0 + hr 1 + sbp 2 + hgb 4 = 8.
  const safe = oakland({ age: 50, sex: 'F', priorLgibAdmission: false,
    dreBlood: false, hr: 78, sbp: 130, hgbGdl: 13 });
  assert.equal(safe.score, 8);
  assert.match(safe.band, /safe for outpatient/);
  // Add prior LGIB -> 9.
  const notSafe = oakland({ age: 50, sex: 'F', priorLgibAdmission: true,
    dreBlood: false, hr: 78, sbp: 130, hgbGdl: 13 });
  assert.equal(notSafe.score, 9);
  assert.match(notSafe.band, /not in the safe-discharge/);
});
