// spec-v58 §2.12: Braden Q pediatric pressure-injury risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bradenQ } from '../../lib/scoring-v6.js';

const mk = (v) => ({ mobility: v, activity: v, sensory: v, moisture: v, friction: v, nutrition: v, perfusion: v });
test('example: all 2 -> total 14, at risk (<=16)', () => {
  const r = bradenQ(mk(2));
  assert.equal(r.total, 14);
  assert.match(r.band, /At risk/);
});
test('all 4 -> 28 lower risk; boundary 16 is at risk', () => {
  assert.match(bradenQ(mk(4)).band, /Lower risk/);
  assert.match(bradenQ({ ...mk(2), perfusion: 4 }).band, /At risk/); // 14+2=16
});
test('out-of-range subscale throws', () => {
  assert.throws(() => bradenQ(mk(5)));
});

// spec-v1755: an ordinal item or a count has no value between its steps; a half-step is refused.
test('spec-v1755: braden-q refuses a half-step subscale; whole values and the worked example answer', () => {
  const ex = { mobility: 2, activity: 2, sensory: 2, moisture: 2, friction: 2, nutrition: 2, perfusion: 2 };
  assert.throws(() => bradenQ({ ...ex, mobility: 2.5 }), /Mobility must be a whole number/);
  assert.equal(bradenQ({ ...ex, mobility: 3 }).total, 15);
  assert.equal(bradenQ(ex).total, 14);
});
