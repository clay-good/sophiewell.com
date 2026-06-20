// spec-v122 2.2: Modified Ashworth Scale (Bohannon & Smith 1987). Ordinal grades
// 0 / 1 / 1+ / 2 / 3 / 4; "1+" is a distinct ordinal step, never summed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { modifiedAshworth } from '../../lib/neuro-v122.js';

test('grade 0 -> no increase, not flagged', () => {
  const r = modifiedAshworth({ grade: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '0');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /no increase in muscle tone/);
});

test('"1+" renders as a distinct ordinal step (not 1.5 or summed)', () => {
  const r = modifiedAshworth({ grade: '1plus' });
  assert.equal(r.grade, '1+');
  assert.match(r.band, /less than half of the range/);
});

test('"1+" vs "2" are distinct adjacent steps', () => {
  const onePlus = modifiedAshworth({ grade: '1plus' });
  const two = modifiedAshworth({ grade: '2' });
  assert.equal(onePlus.grade, '1+');
  assert.equal(two.grade, '2');
  assert.notEqual(onePlus.band, two.band);
});

test('grades 3 and 4 are flagged (severe)', () => {
  assert.equal(modifiedAshworth({ grade: '3' }).abnormal, true);
  assert.equal(modifiedAshworth({ grade: '4' }).abnormal, true);
  assert.equal(modifiedAshworth({ grade: '2' }).abnormal, false);
});

test('unknown / scalar fuzz arg falls back to grade 0, never throws', () => {
  assert.equal(modifiedAshworth(9).grade, '0');
  assert.equal(modifiedAshworth({ grade: 'bogus' }).grade, '0');
  assert.equal(modifiedAshworth({}).valid, true);
});
