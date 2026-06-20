// spec-v125 2.4: West Haven (Conn 1977) HE grade 0-4; grades 2+ are overt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { westHavenHe } from '../../lib/hep-v125.js';

test('grade 0 -> minimal, not overt', () => {
  const r = westHavenHe({ grade: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /minimal/);
});

test('grade 1 -> not overt', () => {
  assert.equal(westHavenHe({ grade: 1 }).abnormal, false);
});

test('grade 2 band-flip -> overt encephalopathy', () => {
  const r = westHavenHe({ grade: 2 });
  assert.equal(r.abnormal, true);
  assert.match(r.band, /overt hepatic encephalopathy/);
});

test('grade 4 -> coma', () => {
  assert.match(westHavenHe({ grade: 4 }).band, /coma/);
});

test('out-of-range / scalar clamps to 0-4, never throws', () => {
  assert.equal(westHavenHe({ grade: 9 }).grade, 4);
  assert.equal(westHavenHe(9).grade, 0);
});
