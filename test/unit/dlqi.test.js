// spec-v151 2.4: DLQI (Finlay 1994). Ten questions each 0-3, total 0-30; bands
// 0-1 no effect, 2-5 small, 6-10 moderate, 11-20 very large, 21-30 extremely
// large. A partially-completed form is valid:false (no undercounted total).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dlqi } from '../../lib/derm-v151.js';

const all = (v) => ({ q1: v, q2: v, q3: v, q4: v, q5: v, q6: v, q7: v, q8: v, q9: v, q10: v });

test('tile example: total 6 -> moderate effect', () => {
  const r = dlqi({ q1: 2, q2: 1, q3: 1, q4: 1, q5: 1, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 6);
  assert.equal(r.bandLabel, 'Moderate effect');
});

test('band boundary at 5/6 (small vs moderate)', () => {
  const at5 = dlqi({ q1: 2, q2: 1, q3: 1, q4: 1, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0 });
  assert.equal(at5.score, 5);
  assert.equal(at5.bandLabel, 'Small effect');
  const at6 = dlqi({ q1: 2, q2: 1, q3: 1, q4: 1, q5: 1, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0 });
  assert.equal(at6.score, 6);
  assert.equal(at6.bandLabel, 'Moderate effect');
});

test('band boundary at 10/11 (moderate vs very large)', () => {
  const at10 = dlqi({ q1: 3, q2: 3, q3: 2, q4: 2, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0 });
  assert.equal(at10.score, 10);
  assert.equal(at10.bandLabel, 'Moderate effect');
  const at11 = dlqi({ q1: 3, q2: 3, q3: 3, q4: 2, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0 });
  assert.equal(at11.score, 11);
  assert.equal(at11.bandLabel, 'Very large effect');
});

test('all 3 -> 30 extremely large; all 0 -> 0 no effect', () => {
  assert.equal(dlqi(all(3)).score, 30);
  assert.equal(dlqi(all(3)).bandLabel, 'Extremely large effect');
  assert.equal(dlqi(all(0)).score, 0);
  assert.equal(dlqi(all(0)).bandLabel, 'No effect');
});

test('partial / blank answers -> valid:false complete-the-fields', () => {
  assert.equal(dlqi({ q1: 2 }).valid, false);
  assert.equal(dlqi({ ...all(1), q7: '' }).valid, false);
  assert.match(dlqi({ q1: 1 }).message, /Answer all 10/);
});
