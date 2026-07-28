// spec-v574: COMPERA 2.0.
//
// The load-bearing tests are the unreachable WHO functional class grade 4, the three numeric gaps, and the
// variable denominator.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compera2, WHO_FC_GRADES, SIX_MWD_BANDS, BNP_BANDS, NT_PROBNP_BANDS, STRATA, MAX_WHO_FC_GRADE,
} from '../../lib/compera-2-v574.js';

test('the strata are the four published labels', () => {
  assert.deepEqual(Object.values(STRATA),
    ['Low risk', 'Intermediate-low risk', 'Intermediate-high risk', 'High risk']);
});

// THE unreachable grade.
test('WHO functional class stops at grade 3: no class scores 4', () => {
  assert.deepEqual(WHO_FC_GRADES.map((g) => g.grade), [1, 2, 3]);
  assert.equal(MAX_WHO_FC_GRADE, 3);
  assert.ok(!WHO_FC_GRADES.some((g) => g.grade === 4), 'grade 4 is unreachable on this row');
});

test('class IV alone gives stratum 3, not 4', () => {
  const r = compera2({ whoFc: 'IV' });
  assert.equal(r.stratum, 3);
  assert.equal(r.stratumLabel, 'Intermediate-high risk');
});

test('the result states that no functional class scores 4', () => {
  assert.match(compera2({ whoFc: 'IV' }).bandText, /NO functional class scores 4/);
});

// THE gaps.
test('a walk distance in the printed gap is refused, not rounded', () => {
  const r = compera2({ sixMwd: '319.5' });
  assert.equal(r.valid, false);
  assert.match(r.message, /falls in a GAP in the published table/);
  assert.match(r.message, /440 to 320 m/);
  assert.match(r.message, /319 to 165 m/);
});

test('the NT-proBNP and BNP gaps are refused too', () => {
  assert.equal(compera2({ ntProBnp: '649.5' }).valid, false);
  assert.equal(compera2({ bnp: '199.5' }).valid, false);
});

test('the band edges themselves are accepted', () => {
  assert.equal(compera2({ sixMwd: '320' }).valid, true);
  assert.equal(compera2({ sixMwd: '319' }).valid, true);
  assert.equal(compera2({ ntProBnp: '649' }).valid, true);
  assert.equal(compera2({ ntProBnp: '650' }).valid, true);
});

test('the walk-distance bands grade as published', () => {
  assert.equal(compera2({ sixMwd: '500' }).graded[0].grade, 1);
  assert.equal(compera2({ sixMwd: '400' }).graded[0].grade, 2);
  assert.equal(compera2({ sixMwd: '200' }).graded[0].grade, 3);
  assert.equal(compera2({ sixMwd: '100' }).graded[0].grade, 4);
});

// The variable denominator.
test('the denominator is the number of variables supplied', () => {
  const one = compera2({ whoFc: 'III' });
  assert.equal(one.variablesGraded, 1);
  const two = compera2({ whoFc: 'III', sixMwd: '400' });
  assert.equal(two.variablesGraded, 2);
  const three = compera2({ whoFc: 'III', sixMwd: '400', ntProBnp: '500' });
  assert.equal(three.variablesGraded, 3);
});

test('a missing variable is not treated as zero', () => {
  // Two grade-2 variables give a mean of 2, not 4/3.
  const r = compera2({ whoFc: 'III', sixMwd: '400' });
  assert.equal(r.mean, 2);
  assert.equal(r.stratum, 2);
});

test('at least one variable is required', () => {
  const r = compera2({});
  assert.equal(r.valid, false);
  assert.match(r.message, /number of variables actually available/);
});

// Peptide precedence.
test('NT-proBNP takes precedence when both peptides are supplied', () => {
  const r = compera2({ ntProBnp: '1500', bnp: '10' });
  assert.equal(r.peptideUsed, 'NT-proBNP');
  assert.equal(r.bnpIgnored, true);
  assert.equal(r.variablesGraded, 1, 'the two peptides are one variable, not two');
  assert.equal(r.graded[0].grade, 4);
});

test('BNP is used when NT-proBNP is absent', () => {
  const r = compera2({ bnp: '10' });
  assert.equal(r.peptideUsed, 'BNP');
  assert.equal(r.graded[0].grade, 1);
});

test('the result states the peptide precedence', () => {
  assert.match(compera2({ ntProBnp: '500', bnp: '500' }).bandText, /NT-proBNP is used/);
});

// Rounding.
test('the mean is rounded to the nearest integer', () => {
  // grades 1 and 2 -> mean 1.5 -> rounds to 2
  const r = compera2({ whoFc: 'I-II', sixMwd: '400' });
  assert.equal(r.mean, 1.5);
  assert.equal(r.stratum, 2);
});

test('the result warns that the three-stratum rounding rule is different', () => {
  assert.match(compera2({ whoFc: 'III' }).bandText, /three-stratum predecessor uses banded rounding/);
});

// No mortality figures.
test('no per-stratum mortality percentage is quoted', () => {
  const r = compera2({ whoFc: 'IV', sixMwd: '100', ntProBnp: '2000' });
  assert.match(r.bandText, /publishes no per-stratum mortality percentages/);
  assert.doesNotMatch(r.bandText, /\b(0-3|2-7|9-19|>20)\s*%/);
});

test('the borrowed cut points are acknowledged', () => {
  assert.match(compera2({ whoFc: 'III' }).bandText, /borrowed from REVEAL Lite 2/);
});

test('the scope note refuses to diagnose PAH or select therapy', () => {
  const r = compera2({ whoFc: 'III' });
  assert.match(r.note, /does not diagnose pulmonary arterial hypertension/);
  assert.match(r.note, /right heart catheterization/);
  assert.match(r.note, /not by itself an indication for combination treatment/);
});
