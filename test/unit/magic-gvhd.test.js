// spec-v577: MAGIC acute GVHD staging and grading.
//
// The load-bearing test is that the grade is NOT a maximum over the organ stages: stage-3 skin alone is
// grade II while stage-2 lower GI alone is grade III.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  magicGvhd, SKIN_STAGES, LIVER_STAGES, UPPER_GI_STAGES, LOWER_GI_STAGES, UPPER_GI_MAX_STAGE,
} from '../../lib/magic-gvhd-v577.js';

const at = ({ skin = 0, liver = 0, upperGi = 0, lowerGi = 0 } = {}) => magicGvhd({
  skin: String(skin), liver: String(liver), upperGi: String(upperGi), lowerGi: String(lowerGi),
});

test('the organ ladders have the published lengths', () => {
  assert.equal(SKIN_STAGES.length, 5);
  assert.equal(LIVER_STAGES.length, 5);
  assert.equal(LOWER_GI_STAGES.length, 5);
  assert.equal(UPPER_GI_STAGES.length, 2, 'upper GI has only two states');
});

// THE upper-GI asymmetry.
test('upper GI has no stage 2, 3 or 4', () => {
  assert.deepEqual(UPPER_GI_STAGES.map((s) => s.stage), [0, 1]);
  assert.equal(UPPER_GI_MAX_STAGE, 1);
  for (const bad of [2, 3, 4]) {
    const r = magicGvhd({ skin: '0', liver: '0', upperGi: String(bad), lowerGi: '0' });
    assert.equal(r.valid, false, `upper GI ${bad} must be refused`);
    assert.match(r.message, /no upper-GI stage 2, 3 or 4/);
  }
});

test('upper GI alone can never drive grade III or IV', () => {
  const r = at({ upperGi: 1 });
  assert.equal(r.grade, 2, 'the most upper GI can contribute is grade II');
  assert.ok(r.grade < 3);
});

// THE central rule.
test('the grade is not a maximum: stage-3 skin alone is grade II', () => {
  const r = at({ skin: 3 });
  assert.equal(r.grade, 2);
  assert.equal(r.maxOrganStage, 3);
  assert.ok(r.grade < r.maxOrganStage, 'the grade is BELOW the worst organ stage');
});

test('the grade is not a maximum: stage-2 lower GI alone is grade III', () => {
  const r = at({ lowerGi: 2 });
  assert.equal(r.grade, 3);
  assert.equal(r.maxOrganStage, 2);
  assert.ok(r.grade > r.maxOrganStage, 'the grade is ABOVE the worst organ stage');
});

test('a lower organ stage can produce a higher overall grade', () => {
  const skin3 = at({ skin: 3 });     // worse organ stage
  const gut2 = at({ lowerGi: 2 });   // lesser organ stage
  assert.ok(skin3.maxOrganStage > gut2.maxOrganStage);
  assert.ok(skin3.grade < gut2.grade, 'exactly the inversion a max() would miss');
});

test('the result states that the grade is not a maximum', () => {
  assert.match(at({ skin: 3 }).bandText, /NOT a maximum over the organ stages/);
});

// The grade ladder.
test('grade 0 requires no organ involvement at all', () => {
  const r = at({});
  assert.equal(r.grade, 0);
  assert.equal(r.gradeLabel, 'Grade 0');
});

test('grade I is skin 1-2 with nothing else', () => {
  assert.equal(at({ skin: 1 }).grade, 1);
  assert.equal(at({ skin: 2 }).grade, 1);
  assert.equal(at({ skin: 2, liver: 1 }).grade, 2, 'any liver involvement lifts it out of grade I');
});

test('grade II is reached by stage 1 of liver, upper GI or lower GI', () => {
  assert.equal(at({ liver: 1 }).grade, 2);
  assert.equal(at({ upperGi: 1 }).grade, 2);
  assert.equal(at({ lowerGi: 1 }).grade, 2);
});

test('grade III is stage 2-3 liver or lower GI', () => {
  assert.equal(at({ liver: 2 }).grade, 3);
  assert.equal(at({ liver: 3 }).grade, 3);
  assert.equal(at({ lowerGi: 3 }).grade, 3);
});

test('grade IV is stage 4 of skin, liver or lower GI', () => {
  assert.equal(at({ skin: 4 }).grade, 4);
  assert.equal(at({ liver: 4 }).grade, 4);
  assert.equal(at({ lowerGi: 4 }).grade, 4);
});

test('stage-4 skin escapes grade III rather than being capped there', () => {
  // Grade III caps skin at 0-3, so stage-4 skin with stage-2 liver must be grade IV.
  const r = at({ skin: 4, liver: 2 });
  assert.equal(r.grade, 4);
});

// The qualitative and conjunctive definitions.
test('lower-GI stage 4 is qualitative and overrides volume', () => {
  const four = LOWER_GI_STAGES.find((s) => s.stage === 4);
  assert.match(four.text, /REGARDLESS OF STOOL VOLUME/);
  assert.match(at({ lowerGi: 4 }).bandText, /explicitly overrides stool volume/);
});

test('skin stage 4 is a conjunction of three findings', () => {
  const four = SKIN_STAGES.find((s) => s.stage === 4);
  assert.match(four.text, /PLUS bullous formation PLUS desquamation/);
  assert.match(four.text, /All three are required/);
});

test('the result discloses the lower-GI denominator ambiguity', () => {
  assert.match(at({ lowerGi: 2 }).bandText, /no tie-break rule/);
  assert.match(at({ lowerGi: 2 }).bandText, /separate adult and pediatric denominators/);
});

// Input handling.
test('every organ stage is required', () => {
  assert.equal(magicGvhd({}).valid, false);
  assert.equal(magicGvhd({ skin: '0' }).valid, false);
  assert.equal(magicGvhd({ skin: '0', liver: '0', upperGi: '0' }).valid, false);
});

test('the scope note names the mimics and refuses to indicate immunosuppression', () => {
  const r = at({ skin: 4 });
  assert.match(r.note, /engraftment syndrome/);
  assert.match(r.note, /opposite of immunosuppression/);
  assert.match(r.note, /does not select or dose immunosuppression/);
});
