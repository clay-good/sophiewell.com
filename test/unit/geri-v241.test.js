// spec-v241: worked examples for the geriatric assessment tools. Scoring /
// formulas spec-v97 verified (Steverink 2001; Guralnik 1994; Koh 2001; Csuka &
// McCarty 1985).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groningen, sppb, ost, fiveTimesSitToStand } from '../../lib/geri-v241.js';

test('groningen: >= 4 frail', () => {
  const r = groningen({ count: 5 });
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
});
test('groningen: < 4 not frail', () => {
  assert.equal(groningen({ count: 2 }).abnormal, false);
});

test('sppb: 7-9 mild-to-moderate', () => {
  const r = sppb({ balance: 3, gait: 3, chair: 2 });
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, true);
});
test('sppb: 10-12 minimal', () => {
  assert.equal(sppb({ balance: 4, gait: 4, chair: 4 }).abnormal, false);
});

test('ost: (weight - age) x 0.2 truncated', () => {
  const r = ost({ weight: 55, age: 70 }); // -3
  assert.equal(r.score, -3);
  assert.equal(r.abnormal, true);
});
test('ost: low risk when positive', () => {
  const r = ost({ weight: 80, age: 55 }); // 5
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, false);
});

test('five-times-sit-to-stand: >= 12 s increased fall risk', () => {
  const r = fiveTimesSitToStand({ time: 14 });
  assert.equal(r.score, 14);
  assert.equal(r.abnormal, true);
});
test('five-times-sit-to-stand: < 12 s below cutoff', () => {
  assert.equal(fiveTimesSitToStand({ time: 9 }).abnormal, false);
});
