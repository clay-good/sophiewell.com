// spec-v156 2.2: BASFI (Calin 1994). Ten 0-10 items; BASFI = the mean of the 10
// items (0-10). A higher index means poorer function.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { basfi } from '../../lib/rheum-ob-v156.js';

test('tile example: the 10-item mean', () => {
  // 2+3+4+5+6+1+2+3+4+5 = 35; 35 / 10 = 3.5
  const r = basfi({ i1: '2', i2: '3', i3: '4', i4: '5', i5: '6', i6: '1', i7: '2', i8: '3', i9: '4', i10: '5' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 3.5);
  assert.ok(r.band.startsWith('BASFI 3.5 '));
  assert.match(r.band, /mean of 10 items/);
});

test('it is the MEAN of 10, not a sum', () => {
  // All items 6 => mean 6, not 60.
  const r = basfi({ i1: 6, i2: 6, i3: 6, i4: 6, i5: 6, i6: 6, i7: 6, i8: 6, i9: 6, i10: 6 });
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
});

test('bounds: 0 floor and 10 ceiling', () => {
  const lo = basfi({ i1: 0, i2: 0, i3: 0, i4: 0, i5: 0, i6: 0, i7: 0, i8: 0, i9: 0, i10: 0 });
  assert.equal(lo.score, 0);
  assert.equal(lo.abnormal, false);
  const hi = basfi({ i1: 10, i2: 10, i3: 10, i4: 10, i5: 10, i6: 10, i7: 10, i8: 10, i9: 10, i10: 10 });
  assert.equal(hi.score, 10);
});

test('a missing or out-of-range item is valid:false', () => {
  assert.equal(basfi({ i1: 1, i2: 2, i3: 3, i4: 4, i5: 5, i6: 6, i7: 7, i8: 8, i9: 9 }).valid, false);
  assert.equal(basfi({ i1: 1, i2: 2, i3: 3, i4: 4, i5: 5, i6: 6, i7: 7, i8: 8, i9: 9, i10: 11 }).valid, false);
  assert.equal(basfi({}).valid, false);
  assert.match(basfi({}).message, /ten/);
});
