// spec-v303: Ring & Messmer anaphylaxis severity grade. Worked-example tests:
// each grade's life-threatening flag (I-II no, III-IV yes), the case-insensitive
// grade code, the invalid-grade RangeError, and the empty-input guard. Grades
// cross-verified against Ring & Messmer 1977 and perioperative-anaphylaxis
// reviews (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anaphylaxisGrade } from '../../lib/anaphylaxis-v303.js';

test('grades I and II are not life-threatening', () => {
  const g1 = anaphylaxisGrade({ grade: 'I' });
  assert.equal(g1.grade, 'I');
  assert.equal(g1.lifeThreatening, false);
  assert.equal(g1.abnormal, false);
  assert.match(g1.features, /Cutaneous-mucous signs only/);

  const g2 = anaphylaxisGrade({ grade: 'II' });
  assert.equal(g2.lifeThreatening, false);
  assert.match(g2.features, /not immediately life-threatening/);
});

test('grades III and IV are life-threatening', () => {
  const g3 = anaphylaxisGrade({ grade: 'III' });
  assert.equal(g3.lifeThreatening, true);
  assert.equal(g3.abnormal, true);
  assert.match(g3.band, /manage as anaphylaxis/i);

  const g4 = anaphylaxisGrade({ grade: 'IV' });
  assert.equal(g4.lifeThreatening, true);
  assert.match(g4.features, /Cardiac and\/or respiratory arrest/);
});

test('grade rank is ordered I<II<III<IV', () => {
  assert.equal(anaphylaxisGrade({ grade: 'I' }).rank, 1);
  assert.equal(anaphylaxisGrade({ grade: 'IV' }).rank, 4);
});

test('grade code is case-insensitive and trimmed', () => {
  assert.equal(anaphylaxisGrade({ grade: ' iii ' }).grade, 'III');
  assert.equal(anaphylaxisGrade({ grade: 'iv' }).grade, 'IV');
});

test('an invalid grade throws RangeError; empty input is a guarded message', () => {
  assert.throws(() => anaphylaxisGrade({ grade: 'V' }), RangeError);
  assert.throws(() => anaphylaxisGrade({ grade: '3' }), RangeError);
  assert.equal(anaphylaxisGrade({ grade: '' }).valid, false);
  assert.equal(anaphylaxisGrade({}).valid, false);
});

test('the worked example (grade III) matches the documented META expected output', () => {
  const r = anaphylaxisGrade({ grade: 'III' });
  assert.equal(r.grade, 'III');
  assert.equal(r.lifeThreatening, true);
  assert.match(r.band, /Ring & Messmer grade III/);
});
