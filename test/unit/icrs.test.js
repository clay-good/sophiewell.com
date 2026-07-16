// spec-v338: ICRS cartilage lesion classification (grades 0-4). Worked-example tests: each grade and
// its depth-based description, the full-thickness/osteochondral flag on grade 4, numeric / string
// input, the <50% (grade 2) vs >50% (grade 3) depth split, and the invalid-grade guard. Definitions
// transcribed from Brittberg 2003 (JBJS Am), cross-verified against ICRS grading reproductions
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { icrs } from '../../lib/icrs-v338.js';

test('grade 4: osteochondral, flagged full-thickness (the META example)', () => {
  const r = icrs({ grade: '4' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '4');
  assert.equal(r.fullThickness, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /through the subchondral bone plate/);
  assert.match(r.band, /osteochondral/);
});

test('grade 0 is normal; grades 1-3 are not full-thickness', () => {
  assert.equal(icrs({ grade: '0' }).grade, '0');
  assert.match(icrs({ grade: '0' }).band, /normal cartilage/);
  for (const g of ['0', '1', '2', '3']) {
    assert.equal(icrs({ grade: g }).fullThickness, false, g);
  }
});

test('the 2/3 split is by <50% vs >50% cartilage depth', () => {
  assert.match(icrs({ grade: '2' }).band, /less than 50% of the cartilage depth/);
  assert.match(icrs({ grade: '3' }).band, /more than 50% of the cartilage depth/);
  assert.match(icrs({ grade: '3' }).band, /not through the subchondral bone/);
});

test('numeric input is accepted the same as string input', () => {
  assert.equal(icrs({ grade: 4 }).grade, '4');
  assert.equal(icrs({ grade: 1 }).grade, '1');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(icrs({}).valid, false);
  assert.equal(icrs({ grade: '5' }).valid, false);
  assert.equal(icrs({ grade: 'IV' }).valid, false);
});
