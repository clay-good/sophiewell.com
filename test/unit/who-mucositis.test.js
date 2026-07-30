// spec-v617: the WHO oral mucositis scale.
//
// The load-bearing tests walk the full 3x3 appearance-by-intake matrix and pin the scale's defining property:
// above grade 2 the mucosal appearance makes no difference at all, and below it the extent of ulceration
// cannot push the grade past 2.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  whoMucositis, gradeText, APPEARANCE, INTAKE, GRADES,
} from '../../lib/who-mucositis-v617.js';

const at = (appearance, intake) => whoMucositis({ appearance, intake });

test('the scale has five grades, 0 through 4', () => {
  assert.deepEqual(GRADES.map((g) => g.grade), [0, 1, 2, 3, 4]);
  assert.equal(APPEARANCE.length, 3);
  assert.equal(INTAKE.length, 3);
});

test('every grade is reachable', () => {
  const grades = new Set();
  for (const a of APPEARANCE) for (const i of INTAKE) grades.add(at(a.value, i.value).grade);
  assert.deepEqual([...grades].sort(), [0, 1, 2, 3, 4]);
});

// THE two axes.
test('grades 0 to 2 are set by appearance while solids are tolerated', () => {
  assert.equal(at('normal', 'solids').grade, 0);
  assert.equal(at('soreness-erythema', 'solids').grade, 1);
  assert.equal(at('ulcers', 'solids').grade, 2);
});

test('grades 3 and 4 are set by intake alone', () => {
  for (const a of APPEARANCE) {
    assert.equal(at(a.value, 'liquids-only').grade, 3, `${a.value} with liquids only`);
    assert.equal(at(a.value, 'none').grade, 4, `${a.value} with no intake`);
  }
});

// THE defining property: appearance stops mattering.
test('above grade 2 the appearance makes no difference at all', () => {
  for (const intake of ['liquids-only', 'none']) {
    const grades = APPEARANCE.map((a) => at(a.value, intake).grade);
    assert.equal(new Set(grades).size, 1, `all appearances give one grade at ${intake}`);
    for (const a of APPEARANCE) assert.equal(at(a.value, intake).appearanceIgnored, true);
  }
});

test('at grades 0 to 2 the appearance is not ignored', () => {
  for (const a of APPEARANCE) assert.equal(at(a.value, 'solids').appearanceIgnored, false);
});

test('the ignored-appearance fact is stated in the result, not just flagged', () => {
  assert.match(at('ulcers', 'liquids-only').bandText, /mucosal appearance did not affect this grade/);
  assert.doesNotMatch(at('ulcers', 'solids').bandText, /did not affect this grade/);
});

// THE extent trap.
test('ulcers with solids tolerated stay at grade 2 and the result says why', () => {
  const r = at('ulcers', 'solids');
  assert.equal(r.grade, 2);
  assert.equal(r.ulcersNotEscalating, true);
  assert.match(r.bandText, /Ulcers are present and the grade is still 2, because solids are tolerated/);
  assert.match(r.bandText, /EXTENT of ulceration is not scored at all/);
});

test('the extent flag fires only for ulcers with solids tolerated', () => {
  assert.equal(at('soreness-erythema', 'solids').ulcersNotEscalating, false);
  assert.equal(at('ulcers', 'liquids-only').ulcersNotEscalating, false);
});

test('ulcers first appear at grade 2, never at grade 1', () => {
  assert.match(gradeText(1), /Soreness or erythema only/);
  assert.doesNotMatch(gradeText(1), /ulcer/i);
  assert.match(gradeText(2), /ulcers/i);
  assert.equal(APPEARANCE.find((a) => a.value === 'soreness-erythema').text.includes('without ulcers'), true);
});

// THE attribution gap.
test('limited intake with normal mucosa is flagged, not silently graded', () => {
  for (const intake of ['liquids-only', 'none']) {
    const r = at('normal', intake);
    assert.equal(r.intakeUnexplainedByMucosa, true, intake);
    assert.match(r.bandText, /mucosa is recorded as normal while oral intake is limited/);
    assert.match(r.bandText, /NOT WHY/);
  }
});

test('the grade the scale specifies is still returned when the mucosa looks normal', () => {
  // The scale is the source: it grades on tolerance, so the grade stands and the caveat rides alongside.
  assert.equal(at('normal', 'none').grade, 4);
  assert.equal(at('normal', 'liquids-only').grade, 3);
});

test('the flag does not fire when the mucosa explains the limitation', () => {
  assert.equal(at('ulcers', 'none').intakeUnexplainedByMucosa, false);
  assert.equal(at('normal', 'solids').intakeUnexplainedByMucosa, false);
});

// Purpose and scope.
test('the reporting purpose is stated', () => {
  assert.match(at('normal', 'solids').bandText, /BUILT FOR REPORTING, NOT FOR BEDSIDE MANAGEMENT/);
  assert.match(at('normal', 'solids').bandText, /1979 WHO handbook/);
});

test('the inputs are validated', () => {
  assert.equal(whoMucositis({}).valid, false);
  assert.match(whoMucositis({}).message, /Choose the mucosal appearance .* and what the patient can tolerate/);
  assert.match(whoMucositis({ appearance: 'ulcers' }).message, /what the patient can tolerate/);
  assert.equal(whoMucositis({ appearance: 'bleeding', intake: 'solids' }).valid, false);
});

test('the scope note keeps the grade off diagnosis, pain and feeding decisions', () => {
  const r = at('ulcers', 'none');
  assert.match(r.note, /does not diagnose mucositis or its cause/);
  assert.match(r.note, /does not measure pain/);
  assert.match(r.note, /feeding-tube placement or parenteral nutrition/);
  assert.match(r.note, /modify or interrupt cancer treatment/);
});
