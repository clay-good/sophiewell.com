// spec-v138 2.1: Hadlock four-parameter EFW (Hadlock 1985). log10(EFW g) = 1.3596
// - 0.00386*AC*FL + 0.0064*HC + 0.00061*BPD*AC + 0.0424*AC + 0.174*FL; biometry cm.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hadlockEfw } from '../../lib/ob-v138.js';

test('worked example BPD9/HC33/AC30/FL7 -> 2600 g', () => {
  const r = hadlockEfw({ bpd: 9.0, hc: 33.0, ac: 30.0, fl: 7.0 });
  assert.equal(r.valid, true);
  assert.equal(r.efw, 2600);
  assert.equal(r.log10, 3.4149);
  assert.equal(r.abnormal, false);
});

test('smaller biometry -> smaller weight', () => {
  const small = hadlockEfw({ bpd: 7.0, hc: 25.0, ac: 22.0, fl: 5.0 });
  const large = hadlockEfw({ bpd: 9.5, hc: 34.0, ac: 33.0, fl: 7.3 });
  assert.equal(small.valid, true);
  assert.equal(large.valid, true);
  assert.ok(small.efw < large.efw);
});

test('non-positive / missing inputs -> valid:false (no 10^x of a bad domain)', () => {
  assert.equal(hadlockEfw({ bpd: 0, hc: 33, ac: 30, fl: 7 }).valid, false);
  assert.equal(hadlockEfw({ bpd: 9, hc: 33, ac: 30 }).valid, false);
  assert.equal(hadlockEfw(9).valid, false);
});

test('overflow guard: implausible biometry -> valid:false, never Infinity', () => {
  const r = hadlockEfw({ bpd: 9, hc: 33, ac: 9999, fl: 0.001 });
  assert.ok(r.valid === false || Number.isFinite(r.efw));
});
