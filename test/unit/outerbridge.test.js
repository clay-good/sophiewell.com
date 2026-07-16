// spec-v337: Outerbridge classification of articular cartilage damage (grades 0-IV). Worked-example
// tests: each grade and its description, the full-thickness flag on grade IV, roman + numeric +
// case-insensitive input, and the invalid-grade guard. Definitions transcribed from Outerbridge 1961
// (J Bone Joint Surg Br), cross-verified against the "Classifications in Brief" review (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { outerbridge } from '../../lib/outerbridge-v337.js';

test('grade IV: exposed subchondral bone, flagged full-thickness (the META example)', () => {
  const r = outerbridge({ grade: 'IV' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'IV');
  assert.equal(r.fullThickness, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /exposed subchondral bone/);
  assert.match(r.band, /full-thickness cartilage loss/);
});

test('grade 0 is normal; grades I-III are not full-thickness', () => {
  assert.equal(outerbridge({ grade: '0' }).grade, '0');
  assert.match(outerbridge({ grade: '0' }).band, /normal articular cartilage/);
  for (const g of ['0', 'I', 'II', 'III']) {
    assert.equal(outerbridge({ grade: g }).fullThickness, false, g);
  }
});

test('the II/III split is by 1.5 cm diameter in the original grading', () => {
  assert.match(outerbridge({ grade: 'II' }).band, /do not exceed 1\.5 cm/);
  assert.match(outerbridge({ grade: 'III' }).band, /more than 1\.5 cm/);
});

test('numeric 0-4 and case-insensitive roman input map to the grades', () => {
  assert.equal(outerbridge({ grade: '4' }).grade, 'IV');
  assert.equal(outerbridge({ grade: 1 }).grade, 'I');
  assert.equal(outerbridge({ grade: 'iii' }).grade, 'III');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(outerbridge({}).valid, false);
  assert.equal(outerbridge({ grade: 'V' }).valid, false);
  assert.equal(outerbridge({ grade: '5' }).valid, false);
});
