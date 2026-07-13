// spec-v297: Seddon-Sunderland nerve-injury classification. Worked-example tests:
// each grade's Seddon equivalent and disrupted structures, the grade-IV surgical-
// repair threshold (IV-V flag surgery, I-III do not), the case-insensitive grade
// code, the invalid-grade RangeError, and the empty-input guard. Table cross-
// verified against Sunderland 1951 / Seddon 1943 and StatPearls (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nerveInjuryGrade } from '../../lib/nerve-injury-v297.js';

test('grade I is neurapraxia with structures intact and no surgery', () => {
  const r = nerveInjuryGrade({ grade: 'I' });
  assert.equal(r.grade, 'I');
  assert.equal(r.seddon, 'neurapraxia');
  assert.equal(r.surgeryLikely, false);
  assert.equal(r.abnormal, false);
  assert.match(r.structures, /Myelin only/);
});

test('grades II and III are axonotmesis; endoneurium disrupted only at III', () => {
  const s2 = nerveInjuryGrade({ grade: 'II' });
  assert.equal(s2.seddon, 'axonotmesis');
  assert.equal(s2.surgeryLikely, false);
  assert.match(s2.structures, /endoneurium.*intact/i);

  const s3 = nerveInjuryGrade({ grade: 'III' });
  assert.equal(s3.seddon, 'axonotmesis');
  assert.equal(s3.surgeryLikely, false);
  assert.match(s3.structures, /endoneurium disrupted/i);
});

test('grades IV and V flag surgical repair (perineurium/epineurium disrupted)', () => {
  const s4 = nerveInjuryGrade({ grade: 'IV' });
  assert.equal(s4.surgeryLikely, true);
  assert.equal(s4.abnormal, true);
  assert.match(s4.structures, /perineurium disrupted/i);
  assert.match(s4.band, /Surgical repair is typically required/);

  const s5 = nerveInjuryGrade({ grade: 'V' });
  assert.equal(s5.seddon, 'neurotmesis');
  assert.equal(s5.surgeryLikely, true);
  assert.match(s5.structures, /Complete transection/i);
});

test('grade code is case-insensitive and trimmed', () => {
  assert.equal(nerveInjuryGrade({ grade: ' iv ' }).grade, 'IV');
  assert.equal(nerveInjuryGrade({ grade: 'v' }).grade, 'V');
});

test('an invalid grade throws RangeError; empty input is a guarded message', () => {
  assert.throws(() => nerveInjuryGrade({ grade: 'VI' }), RangeError);
  assert.throws(() => nerveInjuryGrade({ grade: '3' }), RangeError);
  assert.equal(nerveInjuryGrade({ grade: '' }).valid, false);
  assert.equal(nerveInjuryGrade({}).valid, false);
});

test('the worked example (grade IV) matches the documented META expected output', () => {
  const r = nerveInjuryGrade({ grade: 'IV' });
  assert.equal(r.grade, 'IV');
  assert.equal(r.surgeryLikely, true);
  assert.match(r.band, /Sunderland grade IV/);
});
