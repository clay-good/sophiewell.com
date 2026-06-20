// spec-v130 2.6: Gleason Grade Group (Epstein 2016 / ISUP 2014). GG1 = <=6;
// GG2 = 3+4; GG3 = 4+3; GG4 = 8; GG5 = 9-10. Primary pattern governs 3+4 vs 4+3.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gleasonGradeGroup } from '../../lib/uro-v130.js';

test('the primary pattern governs the 3+4 vs 4+3 split', () => {
  const a = gleasonGradeGroup({ primary: 3, secondary: 4 });
  assert.equal(a.valid, true);
  assert.equal(a.sum, 7);
  assert.equal(a.group, 2); // 3+4
  const b = gleasonGradeGroup({ primary: 4, secondary: 3 });
  assert.equal(b.sum, 7);
  assert.equal(b.group, 3); // 4+3
});

test('grade-group boundaries', () => {
  assert.equal(gleasonGradeGroup({ primary: 3, secondary: 3 }).group, 1); // 6
  assert.equal(gleasonGradeGroup({ primary: 4, secondary: 4 }).group, 4); // 8
  assert.equal(gleasonGradeGroup({ primary: 3, secondary: 5 }).group, 4); // 8
  assert.equal(gleasonGradeGroup({ primary: 4, secondary: 5 }).group, 5); // 9
  assert.equal(gleasonGradeGroup({ primary: 5, secondary: 5 }).group, 5); // 10
});

test('GG4 and GG5 are flagged abnormal (high grade)', () => {
  assert.equal(gleasonGradeGroup({ primary: 4, secondary: 4 }).abnormal, true);
  assert.equal(gleasonGradeGroup({ primary: 3, secondary: 3 }).abnormal, false);
});

test('patterns must be integers 1-5; scalar -> valid:false', () => {
  assert.equal(gleasonGradeGroup({ primary: 6, secondary: 3 }).valid, false);
  assert.equal(gleasonGradeGroup({ primary: 3.5, secondary: 3 }).valid, false);
  assert.equal(gleasonGradeGroup({ primary: 3 }).valid, false);
  assert.equal(gleasonGradeGroup(7).valid, false);
});
