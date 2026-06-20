// spec-v125 2.2: CLIF-C ACLF (Jalan 2014). CLIF-OF 6 organs each 1-3 (6-18), then
// 10*[0.33*CLIF-OF + 0.04*age + 0.63*ln(WBC) - 2].
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clifCAclf } from '../../lib/hep-v125.js';

test('worked example', () => {
  const r = clifCAclf({ liver: 2, kidney: 3, brain: 2, coag: 1, circ: 2, resp: 1, age: 55, wbc: 12 });
  assert.equal(r.valid, true);
  assert.equal(r.clifOF, 11);
  assert.equal(r.score, 54);
});

test('all organs at minimum -> CLIF-OF 6', () => {
  const r = clifCAclf({ liver: 1, kidney: 1, brain: 1, coag: 1, circ: 1, resp: 1, age: 40, wbc: 8 });
  assert.equal(r.clifOF, 6);
});

test('organ sub-scores clamp to 1-3 -> CLIF-OF max 18', () => {
  const r = clifCAclf({ liver: 9, kidney: 9, brain: 9, coag: 9, circ: 9, resp: 9, age: 60, wbc: 10 });
  assert.equal(r.clifOF, 18);
});

test('missing age/WBC -> valid:false (no ln(0))', () => {
  assert.equal(clifCAclf({ liver: 2, kidney: 2, brain: 2, coag: 2, circ: 2, resp: 2, age: 55 }).valid, false);
  assert.equal(clifCAclf(9).valid, false);
});
