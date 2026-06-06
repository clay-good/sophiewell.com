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
