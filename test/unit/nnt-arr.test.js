// spec-v163 2.3: NNT / ARR - ARR, RRR, relative risk, and NNT/NNH. The ARR = 0
// case is surfaced as "no measurable difference" (NNT undefined), and the
// NNH/NNT sign flip is asserted so harm is never reported as benefit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nntArr } from '../../lib/ebm-v163.js';

test('tile example: CER 20%, EER 15% → ARR 5%, NNT 20', () => {
  const r = nntArr({ cer: 20, eer: 15 });
  assert.equal(r.valid, true);
  assert.equal(r.arr, 5);
  assert.equal(r.nnt, 20); // 1/0.05
  assert.equal(r.rr, 0.75); // 15/20
  assert.equal(r.rrr, 25); // 5/20
  assert.equal(r.harm, false);
});

test('EER > CER → number needed to harm, never reported as benefit', () => {
  const r = nntArr({ cer: 15, eer: 20 });
  assert.equal(r.valid, true);
  assert.equal(r.arr, -5);
  assert.equal(r.harm, true);
  assert.equal(r.nnt, 20);
  assert.equal(r.bandLabel, 'Number needed to harm');
  assert.match(r.band, /additional event/);
});

test('CER = EER → no measurable difference, NNT undefined (no divide-by-zero)', () => {
  const r = nntArr({ cer: 10, eer: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.arr, 0);
  assert.equal(r.nnt, null);
  assert.match(r.band, /no measurable difference/i);
});

test('NNT rounds up to whole patients', () => {
  const r = nntArr({ cer: 10, eer: 7 }); // ARR 3% -> 1/0.03 = 33.33 -> 34
  assert.equal(r.nnt, 34);
});

test('guards: blank rates', () => {
  assert.equal(nntArr({ cer: 20 }).valid, false);
  assert.equal(nntArr({}).valid, false);
  assert.equal(nntArr({ cer: 120, eer: 10 }).valid, false); // out of range
});
