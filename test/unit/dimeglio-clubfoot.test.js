// spec-v387: Dimeglio clubfoot classification (four 0-4 params + four bonus flags, total 0-20, grades
// I-IV). Worked-example tests: the total/subscores/grade, the grade boundaries, the bonus-point counting,
// and the guards. Items transcribed from Dimeglio 1995 (J Pediatr Orthop B) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dimeglioClubfoot } from '../../lib/dimeglio-clubfoot-v387.js';

test('worked example: 4/3/3/3 + 2 bonus -> total 15, grade III (the META example)', () => {
  const r = dimeglioClubfoot({ equinus: '4', varus: '3', derotation: '3', adduction: '3', posteriorCrease: true, medialCrease: true });
  assert.equal(r.valid, true);
  assert.equal(r.angleScore, 13);
  assert.equal(r.bonusScore, 2);
  assert.equal(r.total, 15);
  assert.equal(r.grade, 'III');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /15 of 20/);
  assert.match(r.band, /grade III \(severe\)/);
});

test('all-zero is a normal foot (grade "normal")', () => {
  const r = dimeglioClubfoot({ equinus: '0', varus: '0', derotation: '0', adduction: '0' });
  assert.equal(r.total, 0);
  assert.equal(r.grade, 'normal');
  assert.equal(r.abnormal, false);
});

test('grade boundaries: 5=I, 6=II, 10=II, 11=III, 16=IV', () => {
  // 5 -> I
  assert.equal(dimeglioClubfoot({ equinus: '4', varus: '1', derotation: '0', adduction: '0' }).grade, 'I');
  // 6 -> II
  assert.equal(dimeglioClubfoot({ equinus: '4', varus: '2', derotation: '0', adduction: '0' }).grade, 'II');
  // 11 -> III
  assert.equal(dimeglioClubfoot({ equinus: '4', varus: '4', derotation: '3', adduction: '0' }).grade, 'III');
  // 16 -> IV (16 angle max + 0 bonus = 16)
  assert.equal(dimeglioClubfoot({ equinus: '4', varus: '4', derotation: '4', adduction: '4' }).grade, 'IV');
});

test('all four bonus points count', () => {
  const r = dimeglioClubfoot({ equinus: '4', varus: '4', derotation: '4', adduction: '4', posteriorCrease: true, medialCrease: true, cavus: true, muscleAbnormality: true });
  assert.equal(r.angleScore, 16);
  assert.equal(r.bonusScore, 4);
  assert.equal(r.total, 20);
  assert.equal(r.grade, 'IV');
});

test('a missing parameter or out-of-range value is invalid', () => {
  assert.equal(dimeglioClubfoot({ equinus: '4', varus: '3', derotation: '3' }).valid, false);
  assert.equal(dimeglioClubfoot({ equinus: '5', varus: '0', derotation: '0', adduction: '0' }).valid, false);
  assert.equal(dimeglioClubfoot({ equinus: '2.5', varus: '0', derotation: '0', adduction: '0' }).valid, false);
});
