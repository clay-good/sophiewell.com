// spec-v360: Keith-Wagener-Barker hypertensive retinopathy classification (grades 1-4). Worked-example
// tests: each grade and its fundoscopic description, the severe flag on grades 3-4, roman + numeric +
// case-insensitive input, and the invalid-grade guard. Definitions transcribed from Keith, Wagener &
// Barker 1939, cross-verified against ophthalmology/internal-medicine references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kwbRetinopathy } from '../../lib/kwb-retinopathy-v360.js';

test('grade 3: hemorrhages / cotton-wool spots / exudates, flagged (the META example)', () => {
  const r = kwbRetinopathy({ grade: '3' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '3');
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /hemorrhages, cotton-wool spots/);
});

test('grades 1-2 are the non-severe (vascular-change) grades', () => {
  assert.match(kwbRetinopathy({ grade: '1' }).band, /mild generalized retinal arteriolar narrowing/);
  assert.match(kwbRetinopathy({ grade: '2' }).band, /arteriovenous \(AV\) nicking/);
  for (const g of ['1', '2']) {
    assert.equal(kwbRetinopathy({ grade: g }).severe, false, g);
  }
});

test('grade 4 is papilledema (malignant hypertension) and flagged', () => {
  const r = kwbRetinopathy({ grade: '4' });
  assert.equal(r.severe, true);
  assert.equal(r.grade, '4');
  assert.match(r.band, /papilledema/);
  assert.match(r.band, /malignant hypertension/);
});

test('roman and case-insensitive input map to the grades', () => {
  assert.equal(kwbRetinopathy({ grade: 'III' }).grade, '3');
  assert.equal(kwbRetinopathy({ grade: 'iv' }).grade, '4');
  assert.equal(kwbRetinopathy({ grade: 2 }).grade, '2');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(kwbRetinopathy({}).valid, false);
  assert.equal(kwbRetinopathy({ grade: '5' }).valid, false);
  assert.equal(kwbRetinopathy({ grade: '0' }).valid, false);
});
