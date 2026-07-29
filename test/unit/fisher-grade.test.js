// spec-v600: the original Fisher grade.
//
// The load-bearing tests are that grade 4 is assigned by COMPARTMENT regardless of the subarachnoid
// description, and that grade 3 -- not grade 4 -- carries the highest vasospasm risk.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fisherGrade, GRADES, THICKNESS_THRESHOLD_MM, HIGHEST_VASOSPASM_RISK_GRADE,
} from '../../lib/fisher-grade-v600.js';

const at = (intracerebralOrIntraventricular, subarachnoidBlood) =>
  fisherGrade({ intracerebralOrIntraventricular, subarachnoidBlood });

test('there are four grades', () => {
  assert.deepEqual(GRADES.map((g) => g.grade), [1, 2, 3, 4]);
  assert.equal(THICKNESS_THRESHOLD_MM, 1);
});

test('the subarachnoid ladder grades 1 to 3', () => {
  assert.equal(at('no', 'none').grade, 1);
  assert.equal(at('no', 'thin').grade, 2);
  assert.equal(at('no', 'thick-or-localized-clot').grade, 3);
});

// THE compartment rule.
test('grade 4 is assigned by compartment regardless of the subarachnoid description', () => {
  for (const sah of ['none', 'thin', 'thick-or-localized-clot']) {
    const r = at('yes', sah);
    assert.equal(r.grade, 4, `intraventricular blood with sah=${sah}`);
    assert.equal(r.gradedByCompartment, true);
  }
});

test('a speck of intraventricular blood with NO subarachnoid blood outranks thick cisternal clot', () => {
  const speck = at('yes', 'none');
  const thickClot = at('no', 'thick-or-localized-clot');
  assert.equal(speck.grade, 4);
  assert.equal(thickClot.grade, 3);
  assert.ok(speck.grade > thickClot.grade, 'the NUMBER is higher');
  assert.equal(thickClot.carriesHighestVasospasmRisk, true, 'but the RISK is not');
  assert.equal(speck.carriesHighestVasospasmRisk, false);
});

test('the compartment reasoning is explained on every grade 4', () => {
  const r = at('yes', 'none');
  assert.match(r.bandText, /because of WHERE the blood is, not how much/);
  assert.match(r.bandText, /DIFFERENT blood in a DIFFERENT COMPARTMENT/);
  assert.match(r.bandText, /speck of intraventricular blood and a ventricle full of clot/);
});

// THE non-ordinality.
test('grade 3 carries the highest vasospasm risk, not grade 4', () => {
  assert.equal(HIGHEST_VASOSPASM_RISK_GRADE, 3);
  assert.equal(at('no', 'thick-or-localized-clot').carriesHighestVasospasmRisk, true);
  assert.equal(at('yes', 'none').outrankedByGradeThree, true);
  assert.match(at('yes', 'none').bandText, /GRADE 4 IS NOT THE HIGHEST VASOSPASM RISK/);
});

test('the non-ordinality is stated on every result', () => {
  for (const [ivh, sah] of [['no', 'none'], ['no', 'thin'], ['no', 'thick-or-localized-clot'], ['yes', 'none']]) {
    assert.match(at(ivh, sah).bandText, /NOT ordinal for the risk they grade/, `${ivh}/${sah}`);
  }
});

test('only grade 3 is marked as carrying the highest risk', () => {
  const marked = [['no', 'none'], ['no', 'thin'], ['no', 'thick-or-localized-clot'], ['yes', 'none'], ['yes', 'thick-or-localized-clot']]
    .filter(([i, s]) => at(i, s).carriesHighestVasospasmRisk)
    .map(([i, s]) => at(i, s).grade);
  assert.deepEqual([...new Set(marked)], [HIGHEST_VASOSPASM_RISK_GRADE]);
});

// The refusal to map across scales.
test('the modified scale is described as a different construction, not a renumbering', () => {
  const r = at('no', 'thin');
  assert.match(r.bandText, /NOT a renumbering/);
  assert.match(r.bandText, /A Fisher 3 is NOT a modified Fisher 3/);
  assert.equal('modifiedFisherEquivalent' in r, false, 'no conversion is offered');
});

// The dated threshold.
test('the CT-era caveat on the millimetre threshold is stated', () => {
  assert.match(at('no', 'thin').bandText, /1980-era computed tomography/);
  assert.match(at('no', 'thin').bandText, /not the same observation/);
});

// Input handling and scope.
test('both inputs are required and the compartment rule is named', () => {
  assert.equal(fisherGrade({}).valid, false);
  assert.match(fisherGrade({}).message, /decided by COMPARTMENT, not by how much blood/);
  assert.match(fisherGrade({ intracerebralOrIntraventricular: 'no', subarachnoidBlood: 'lots' }).message,
    /none, thin, thick-or-localized-clot/);
});

test('the scope note separates the scan grade from clinical severity', () => {
  const r = at('no', 'thin');
  assert.match(r.note, /does not diagnose subarachnoid hemorrhage/);
  assert.match(r.note, /Hunt and Hess and WFNS scales do/);
  assert.match(r.note, /not a reason to relax vasospasm monitoring/);
});
