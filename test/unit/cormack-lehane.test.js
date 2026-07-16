// spec-v339: Cormack-Lehane laryngeal-view classification (grades 1-4). Worked-example tests: each
// grade and its glottis/epiglottis description, the difficult-view flag on grades 3-4, numeric /
// string input, the modified 2a/2b/3a/3b aliases mapping to the parent grade, and the invalid-grade
// guard. Definitions transcribed from Cormack & Lehane 1984 (Anaesthesia), cross-verified against
// the modified (Yentis 1998 / Cook 2000) subdivisions (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cormackLehane } from '../../lib/cormack-lehane-v339.js';

test('grade 3: only epiglottis, flagged difficult (the META example)', () => {
  const r = cormackLehane({ grade: '3' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '3');
  assert.equal(r.difficult, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /only the epiglottis is visible/);
  assert.match(r.band, /difficult laryngoscopy view/);
});

test('grades 1-2 are not difficult; grade 4 is', () => {
  assert.equal(cormackLehane({ grade: '1' }).difficult, false);
  assert.match(cormackLehane({ grade: '1' }).band, /most of the glottis/);
  assert.equal(cormackLehane({ grade: '2' }).difficult, false);
  assert.match(cormackLehane({ grade: '2' }).band, /posterior glottis or the arytenoid/);
  const four = cormackLehane({ grade: '4' });
  assert.equal(four.difficult, true);
  assert.match(four.band, /neither the glottis nor the epiglottis/);
});

test('the modified 2a/2b and 3a/3b subtypes map to the parent grade', () => {
  assert.equal(cormackLehane({ grade: '2a' }).grade, '2');
  assert.equal(cormackLehane({ grade: '2B' }).grade, '2');
  assert.equal(cormackLehane({ grade: '3a' }).grade, '3');
  assert.equal(cormackLehane({ grade: '3b' }).difficult, true);
});

test('numeric input is accepted the same as string input', () => {
  assert.equal(cormackLehane({ grade: 1 }).grade, '1');
  assert.equal(cormackLehane({ grade: 4 }).grade, '4');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(cormackLehane({}).valid, false);
  assert.equal(cormackLehane({ grade: '0' }).valid, false);
  assert.equal(cormackLehane({ grade: '5' }).valid, false);
});
