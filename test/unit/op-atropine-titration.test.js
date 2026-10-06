// spec-v1556 tool 7: atropine dose doubling (2, 4, 8, 16), stop doubling on improvement, targets and the
// 10-20% infusion.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { opAtropineTitration as r } from '../../lib/op-atropine-titration-v1556.js';

const base = { adult: 'yes', hr: '55', sbp: '75', chest: 'wet', improving: 'no' };

test('doubling', () => {
  assert.equal(r({ ...base, last: '2', total: '2' }).bandLabel, 'Give 4 mg');
  assert.equal(r({ ...base, last: '4', total: '6' }).bandLabel, 'Give 8 mg');
  assert.equal(r({ ...base, last: '8', total: '14' }).bandLabel, 'Give 16 mg');
  assert.match(r({ ...base, last: '8', total: '14' }).band, /total will be 30 mg/);
  assert.equal(r({ ...base, last: '8', total: '14', improving: 'yes' }).bandLabel, 'Stop doubling');
});

test('targets and infusion', () => {
  const ok = { adult: 'yes', hr: '85', sbp: '95', chest: 'clear', last: '16', total: '30' };
  assert.equal(r(ok).bandLabel, 'Start infusion');
  assert.match(r(ok).band, /3 mg-6 mg an hour/);
  assert.equal(r({ ...ok, hr: '80', improving: 'no' }).bandLabel, 'Give 32 mg', 'heart rate must be over 80');
});

test('refusals', () => {
  assert.equal(r({ ...base, adult: 'no', last: '2', total: '2' }).valid, false);
  assert.equal(r({ ...base, last: '4', total: '2' }).valid, false);
  assert.equal(r({ ...base, improving: '', last: '2', total: '2' }).valid, false);
});
