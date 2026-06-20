// spec-v131 2.1: UCSF CAPRA score (Cooperberg 2005, J Urol 173:1938). Age >=50
// = +1; PSA <=6 = 0, >6-10 = +1, >10-20 = +2, >20-30 = +3, >30 = +4; Gleason
// primary 4/5 = +3, else secondary 4/5 = +1; T3a = +1; >=34% cores = +1. Total
// 0-10. Tiers 0-2 low / 3-5 intermediate / 6-10 high.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capraScore } from '../../lib/uro-v131.js';

test('the 2 to 3 low/intermediate boundary flips on the Gleason axis', () => {
  const low = capraScore({ age: 60, psa: 7, gleasonPrimary: 3, gleasonSecondary: 3, stage: 'T1-T2', cores: 20 });
  assert.equal(low.total, 2); // age 1 + psa 1
  assert.equal(low.tier, 'Low');
  const mid = capraScore({ age: 60, psa: 7, gleasonPrimary: 3, gleasonSecondary: 4, stage: 'T1-T2', cores: 20 });
  assert.equal(mid.total, 3); // + secondary pattern 4 = +1
  assert.equal(mid.tier, 'Intermediate');
  assert.equal(mid.abnormal, true);
});

test('PSA bands are inclusive at the top and the Gleason axis jumps 1 to 3', () => {
  assert.equal(capraScore({ age: 40, psa: 6, gleasonPrimary: 3, gleasonSecondary: 3, stage: 'T1-T2', cores: 0 }).total, 0); // PSA 6 -> 0
  assert.equal(capraScore({ age: 40, psa: 6.1, gleasonPrimary: 3, gleasonSecondary: 3, stage: 'T1-T2', cores: 0 }).parts.psa, 1);
  // primary pattern 4 -> +3 (there is no +2 level)
  assert.equal(capraScore({ age: 40, psa: 6, gleasonPrimary: 4, gleasonSecondary: 3, stage: 'T1-T2', cores: 0 }).parts.gleason, 3);
});

test('maximum score is 10 (high) and the parts add up', () => {
  const r = capraScore({ age: 70, psa: 40, gleasonPrimary: 5, gleasonSecondary: 5, stage: 'T3a', cores: 80 });
  assert.equal(r.total, 10); // 1 + 4 + 3 + 1 + 1
  assert.equal(r.tier, 'High');
});

test('blank or out-of-range components surface valid:false, never a partial score', () => {
  assert.equal(capraScore({ age: 60, psa: 7, gleasonPrimary: 0, gleasonSecondary: 4, stage: 'T1-T2', cores: 20 }).valid, false);
  assert.equal(capraScore({ age: 60, psa: 7, gleasonPrimary: 3, gleasonSecondary: 4, stage: '', cores: 20 }).valid, false);
  assert.equal(capraScore({ age: 60, psa: 7, gleasonPrimary: 3, gleasonSecondary: 4, stage: 'T1-T2', cores: 120 }).valid, false);
  assert.equal(capraScore(7).valid, false);
});
