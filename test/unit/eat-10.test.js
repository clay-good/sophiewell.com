// spec-v178 §2.5: EAT-10, 10 items 0-4, total 0-40, >= 3 abnormal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eat10 } from '../../lib/ltcga-v178.js';

const z = { i1: 0, i2: 0, i3: 0, i4: 0, i5: 0, i6: 0, i7: 0, i8: 0, i9: 0, i10: 0 };

test('EAT-10 0/40 -> normal', () => {
  assert.match(eat10(z).band, /within normal limits/);
});

test('EAT-10 2 -> normal, 3 -> abnormal (the >= 3 cut flip)', () => {
  assert.match(eat10({ ...z, i1: 1, i2: 1 }).band, /within normal limits/);
  assert.match(eat10({ ...z, i1: 1, i2: 1, i3: 1 }).band, /abnormal/);
});

test('EAT-10 ceiling 40', () => {
  assert.equal(eat10({ i1: 4, i2: 4, i3: 4, i4: 4, i5: 4, i6: 4, i7: 4, i8: 4, i9: 4, i10: 4 }).total, 40);
});

test('EAT-10 guards out-of-range and blank', () => {
  assert.equal(eat10({ ...z, i1: 5 }).valid, false);
  assert.equal(eat10({}).valid, false);
});
