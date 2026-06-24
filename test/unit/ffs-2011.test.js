// spec-v148 2.2: FFS-2011 (Guillevin 2011). Four poor-prognosis factors +1 each
// + favorable absence-of-ENT +1. 5-yr mortality 0->9%, 1->21%, >=2->40%.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ffs2011 } from '../../lib/rheum-v148.js';

test('FFS 0 -> ~9%', () => {
  const r = ffs2011({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /9%/);
});

test('FFS 1 -> ~21% (mortality-band change from 0)', () => {
  const r = ffs2011({ age: 1 });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /21%/);
});

test('FFS 2 -> ~40% (1->2 band change)', () => {
  const r = ffs2011({ age: 1, gi: 1 });
  assert.equal(r.score, 2);
  assert.match(r.band, /40%/);
});

test('all five factors -> 5/5, still 40% band', () => {
  const r = ffs2011({ age: 1, cardiac: 1, gi: 1, renal: 1, noEnt: 1 });
  assert.equal(r.score, 5);
  assert.match(r.band, /40%/);
});

test('absence-of-ENT counts as a factor', () => {
  assert.equal(ffs2011({ noEnt: 1 }).score, 1);
});
