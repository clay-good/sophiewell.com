// spec-v206 2.1: Rotterdam CT score worked examples. cisterns 0/1/2 + shift +
// epidural(inverted) + IVH/SAH + 1; total 1-6; mortality 5/7/16/26/53/61%.
// Weights + mortality + epidural inversion spec-v97 cross-verified (Maas 2005).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rotterdamCt as rott } from '../../lib/tbi-stroke-v206.js';

test('maximum score 6 -> 61% mortality (worked example)', () => {
  const r = rott({ cisterns: 'absent', shiftOver5: true, epiduralPresent: false, ivhOrSah: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 6); // 2 + 1 + 1(no EDH) + 1 + 1
  assert.equal(r.mortality, 61);
  assert.equal(r.abnormal, true);
});

test('minimum score 1 -> 5% mortality', () => {
  const r = rott({ cisterns: 'normal', shiftOver5: false, epiduralPresent: true, ivhOrSah: false });
  assert.equal(r.score, 1); // 0 + 0 + 0(EDH present) + 0 + 1
  assert.equal(r.mortality, 5);
  assert.equal(r.abnormal, false);
});

test('epidural mass lesion is inverted (absent adds a point)', () => {
  const present = rott({ cisterns: 'normal', shiftOver5: false, epiduralPresent: true, ivhOrSah: false });
  const absent = rott({ cisterns: 'normal', shiftOver5: false, epiduralPresent: false, ivhOrSah: false });
  assert.equal(present.score, 1);
  assert.equal(absent.score, 2); // absent EDH -> +1
});

test('mid score maps to published mortality', () => {
  const r = rott({ cisterns: 'compressed', shiftOver5: false, epiduralPresent: true, ivhOrSah: true });
  assert.equal(r.score, 3); // 1 + 0 + 0 + 1 + 1
  assert.equal(r.mortality, 16);
});

test('missing cisterns -> complete-the-fields', () => {
  const r = rott({ shiftOver5: true });
  assert.equal(r.valid, false);
  assert.match(r.message, /basal-cistern/);
});
