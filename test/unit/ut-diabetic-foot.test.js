// spec-v612: the University of Texas diabetic foot wound classification.
//
// The load-bearing tests are that the answer is always a two-part cell (never one axis), that all 16 cells
// are reachable and distinct, and that no outcome percentage is ever emitted.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  utDiabeticFoot, findGrade, findStage, GRADES, STAGES,
} from '../../lib/ut-diabetic-foot-v612.js';

test('the classification is four grades by four stages', () => {
  assert.equal(GRADES.length, 4);
  assert.equal(STAGES.length, 4);
  assert.deepEqual(GRADES.map((g) => g.value), ['0', 'I', 'II', 'III']);
  assert.deepEqual(STAGES.map((s) => s.value), ['A', 'B', 'C', 'D']);
});

// THE matrix.
test('all sixteen cells are reachable and every cell label is distinct', () => {
  const cells = new Set();
  for (const g of GRADES) {
    for (const s of STAGES) {
      const r = utDiabeticFoot({ grade: g.value, stage: s.value });
      assert.equal(r.valid, true, `${g.value}${s.value}`);
      cells.add(r.cell);
    }
  }
  assert.equal(cells.size, 16);
});

test('the result always carries both axes, never one alone', () => {
  const r = utDiabeticFoot({ grade: 'II', stage: 'B' });
  assert.equal(r.cell, 'IIB');
  assert.equal(r.grade, 'II');
  assert.equal(r.stage, 'B');
  assert.ok(r.gradeText.length > 0);
  assert.ok(r.stageText.length > 0);
  assert.match(r.bandText, /TWO-DIMENSIONAL MATRIX/);
  assert.match(r.bandText, /Wagner classification it extends is ONE-dimensional/);
});

// THE stage axis semantics.
test('the stage axis decodes infection and ischemia independently', () => {
  const expected = {
    A: { infection: false, ischemia: false },
    B: { infection: true, ischemia: false },
    C: { infection: false, ischemia: true },
    D: { infection: true, ischemia: true },
  };
  for (const [stage, want] of Object.entries(expected)) {
    const r = utDiabeticFoot({ grade: 'I', stage });
    assert.equal(r.infection, want.infection, `${stage} infection`);
    assert.equal(r.ischemia, want.ischemia, `${stage} ischemia`);
  }
});

test('stage D is the only cell carrying both complications', () => {
  const both = STAGES.filter((s) => {
    const r = utDiabeticFoot({ grade: 'I', stage: s.value });
    return r.infection && r.ischemia;
  });
  assert.deepEqual(both.map((s) => s.value), ['D']);
});

// THE grade-0 trap.
test('grade 0 is a real classification and still carries a stage', () => {
  const healed = utDiabeticFoot({ grade: '0', stage: 'C' });
  assert.equal(healed.cell, '0C');
  assert.equal(healed.ischemia, true);
  assert.match(healed.bandText, /GRADE 0 DOES NOT MEAN "NO PROBLEM"/);
  assert.match(healed.bandText, /0C, not "resolved"/);
});

test('the grade-0 warning appears only at grade 0', () => {
  for (const g of ['I', 'II', 'III']) {
    assert.doesNotMatch(utDiabeticFoot({ grade: g, stage: 'A' }).bandText, /DOES NOT MEAN "NO PROBLEM"/);
  }
});

// THE non-overlapping depth ladder.
test('the grade ladder does not let two rungs both reach bone', () => {
  const gradeII = GRADES.find((g) => g.value === 'II').text;
  const gradeIII = GRADES.find((g) => g.value === 'III').text;
  assert.match(gradeII, /without palpable bone/);
  assert.match(gradeIII, /probing to bone/);
  assert.doesNotMatch(gradeII, /probing to bone/);
  assert.match(utDiabeticFoot({ grade: 'II', stage: 'A' }).bandText, /overlaps III and cannot be right/);
});

// THE withheld material.
test('no outcome percentage is ever emitted', () => {
  for (const g of GRADES) {
    for (const s of STAGES) {
      const r = utDiabeticFoot({ grade: g.value, stage: s.value });
      assert.doesNotMatch(r.bandText, /\d+(\.\d+)?%/, `${r.cell}`);
    }
  }
  assert.match(utDiabeticFoot({ grade: 'I', stage: 'A' }).bandText, /NO OUTCOME PERCENTAGES ARE REPORTED/);
});

test('the Wagner grade table is named but not reproduced', () => {
  const t = utDiabeticFoot({ grade: 'I', stage: 'A' }).bandText;
  assert.match(t, /Wagner grade table is deliberately NOT reproduced/);
  assert.match(t, /conflict on whether its grade 2 involves bone/);
  assert.doesNotMatch(t, /grade 4/i);
  assert.doesNotMatch(t, /gangrene/i);
});

// Input handling.
test('grade and stage lookups are case-insensitive and reject unknown values', () => {
  assert.equal(findGrade('iii').value, 'III');
  assert.equal(findStage('b').value, 'B');
  assert.equal(findGrade('IV'), null);
  assert.equal(findStage('E'), null);
  assert.equal(findGrade(undefined), null);
});

test('the inputs are validated', () => {
  assert.equal(utDiabeticFoot({}).valid, false);
  assert.match(utDiabeticFoot({}).message, /Choose a grade .* and a stage/);
  assert.match(utDiabeticFoot({ grade: 'I' }).message, /Choose a stage/);
  assert.match(utDiabeticFoot({ stage: 'A' }).message, /Choose a grade/);
});

test('the scope note keeps the classification off diagnosis and off treatment', () => {
  const r = utDiabeticFoot({ grade: 'III', stage: 'D' });
  assert.match(r.note, /does not diagnose infection or ischemia/);
  assert.match(r.note, /does not decide antibiotics, revascularization or amputation/);
  assert.match(r.note, /does not predict an individual patient/);
});
