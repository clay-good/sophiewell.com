// spec-v477: SFU hydronephrosis grading (grades 0-4).
// Worked-example tests: each grade and its dilatation description, and the invalid-grade guard.
// Grades transcribed from Fernbach, Maizels & Conway 1993 (Pediatr Radiol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sfuHydronephrosis } from '../../lib/sfu-hydronephrosis-v477.js';

test('grade 2: pelvis and a few calyces (the META example)', () => {
  const r = sfuHydronephrosis({ grade: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '2');
  assert.match(r.band, /dilatation of the renal pelvis and a few calyces/);
});

test('grade 0: intact central renal complex', () => {
  assert.match(sfuHydronephrosis({ grade: 0 }).band, /no hydronephrosis; intact central renal complex/);
});

test('grade 3: all calyces, normal parenchyma', () => {
  assert.match(sfuHydronephrosis({ grade: 3 }).band, /all calyces, which are uniformly dilated; normal renal parenchyma/);
});

test('grade 4: parenchymal thinning', () => {
  const r = sfuHydronephrosis({ grade: 4 });
  assert.equal(r.grade, '4');
  assert.match(r.band, /thinning of the renal parenchyma/);
});

test('numeric and string input both work', () => {
  assert.equal(sfuHydronephrosis({ grade: 1 }).grade, '1');
  assert.equal(sfuHydronephrosis({ grade: '4' }).grade, '4');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(sfuHydronephrosis({}).valid, false);
  assert.equal(sfuHydronephrosis({ grade: 5 }).valid, false);
  assert.equal(sfuHydronephrosis({ grade: 'I' }).valid, false);
});
