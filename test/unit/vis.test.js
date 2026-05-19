// spec-v13 §3.6.1 wave 13-6: VIS per Gaies MG, et al. Pediatr Crit Care Med.
// 2010;11(2):234-238. Also surfaces the Wernovsky 1995 IS.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vis } from '../../lib/clinical-v4.js';

test('vis zero: no drips -> 0', () => {
  const r = vis({});
  assert.equal(r.vis, 0);
  assert.equal(r.is, 0);
});

test('vis weighted sum: VIS = dopamine + 100*norepi', () => {
  const r = vis({ dopamine: 5, norepinephrine: 0.05 });
  assert.ok(Math.abs(r.vis - 10) < 1e-9);
  assert.equal(r.is, 5);
});

test('vis high: 100*norepi + 100*epi + 10000*vaso', () => {
  const r = vis({ epinephrine: 0.05, norepinephrine: 0.2, vasopressin: 0.0004 });
  // 100*0.05 + 100*0.2 + 10000*0.0004 = 5 + 20 + 4 = 29
  assert.ok(Math.abs(r.vis - 29) < 1e-9);
  assert.match(r.band, /high vasoactive load/);
});

test('vis Wernovsky IS: dopamine + dobutamine + 100*epi', () => {
  const r = vis({ dopamine: 5, dobutamine: 5, epinephrine: 0.05 });
  assert.equal(r.is, 15);
});
