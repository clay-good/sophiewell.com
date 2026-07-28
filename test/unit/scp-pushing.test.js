// spec-v562: the Scale for Contraversive Pushing.
//
// The load-bearing test is that the total is NOT the classifier: a 4-of-6 patient with one empty section
// fails every per-section criterion, while a lower-scoring patient spread across all three meets the
// recommended one.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scpPushing, SCP_SECTIONS, SCP_POSITIONS, SECTION_MAX, SCP_MAX,
} from '../../lib/scp-pushing-v562.js';

// Build an input from per-section [sitting, standing] pairs.
const build = ({ A, B, C }) => ({
  Asitting: String(A[0]), Astanding: String(A[1]),
  Bsitting: String(B[0]), Bstanding: String(B[1]),
  Csitting: String(C[0]), Cstanding: String(C[1]),
});

test('there are three sections, each scored in two positions', () => {
  assert.deepEqual(SCP_SECTIONS.map((s) => s.key), ['A', 'B', 'C']);
  assert.deepEqual(SCP_POSITIONS, ['sitting', 'standing']);
  assert.equal(SECTION_MAX, 2);
  assert.equal(SCP_MAX, 6);
});

// The ladders differ.
test('section A has no 0.5, section B does, and section C is binary', () => {
  const values = (k) => SCP_SECTIONS.find((s) => s.key === k).options.map((o) => o.value);
  assert.deepEqual(values('A'), [1, 0.75, 0.25, 0]);
  assert.deepEqual(values('B'), [1, 0.5, 0]);
  assert.deepEqual(values('C'), [1, 0]);
  assert.ok(!values('A').includes(0.5), 'section A must not offer 0.5');
});

test('a value from another section’s ladder is refused', () => {
  const o = build({ A: [1, 1], B: [1, 1], C: [1, 1] });
  o.Asitting = '0.5';
  const r = scpPushing(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /section A has no 0\.5/);
});

// Section subtotals sum the two positions.
test('each section subtotal is the sum of sitting and standing', () => {
  const r = scpPushing(build({ A: [0.75, 0.25], B: [0.5, 0.5], C: [1, 0] }));
  assert.equal(r.sectionSubtotals.A, 1);
  assert.equal(r.sectionSubtotals.B, 1);
  assert.equal(r.sectionSubtotals.C, 1);
  assert.equal(r.total, 3);
});

test('the maximum is 6', () => {
  assert.equal(scpPushing(build({ A: [1, 1], B: [1, 1], C: [1, 1] })).total, SCP_MAX);
});

// THE central fact.
test('a 4-of-6 patient with one empty section meets no per-section criterion', () => {
  const r = scpPushing(build({ A: [1, 1], B: [1, 1], C: [0, 0] }));
  assert.equal(r.total, 4);
  assert.equal(r.crit1, true, 'the total is above 0');
  assert.equal(r.crit2, false, 'but section C is 0');
  assert.equal(r.crit3, false);
  assert.equal(r.criteriaDisagree, true);
});

test('a low-scoring patient spread across all three sections meets the recommended criterion', () => {
  // Section C is BINARY, so it cannot take a fractional value: the lowest non-zero C subtotal is 1.
  const r = scpPushing(build({ A: [0.25, 0], B: [0.5, 0], C: [1, 0] }));
  assert.equal(r.sectionSubtotals.A, 0.25);
  assert.equal(r.sectionSubtotals.B, 0.5);
  assert.equal(r.sectionSubtotals.C, 1);
  assert.equal(r.total, 1.75);
  assert.equal(r.crit2, true);
  assert.ok(r.total < 4, 'a lower total than the non-pusher above');
});

test('the lower-scoring patient qualifies where the higher-scoring one does not', () => {
  const higher = scpPushing(build({ A: [1, 1], B: [1, 1], C: [0, 0] }));
  const lower = scpPushing(build({ A: [0.25, 0], B: [0.5, 0], C: [1, 0] }));
  assert.ok(higher.total > lower.total);
  assert.equal(higher.crit2, false);
  assert.equal(lower.crit2, true);
});

test('the result says the total is not the classifier', () => {
  assert.match(scpPushing(build({ A: [1, 1], B: [1, 1], C: [0, 0] })).bandText,
    /TOTAL IS NOT THE CLASSIFIER/);
});

// The three criteria.
test('Crit_3 is stricter than Crit_2', () => {
  const r = scpPushing(build({ A: [0.25, 0], B: [0.5, 0], C: [1, 0] }));
  assert.equal(r.crit2, true);
  assert.equal(r.crit3, false, 'sections A and B do not reach 1');
});

test('Crit_3 is met when every section reaches 1', () => {
  const r = scpPushing(build({ A: [0.75, 0.25], B: [0.5, 0.5], C: [1, 0] }));
  assert.equal(r.crit3, true);
  assert.equal(r.crit2, true);
  assert.equal(r.criteriaDisagree, false);
});

test('exactly 1 in a section satisfies Crit_3, per the primary sources', () => {
  const r = scpPushing(build({ A: [0.75, 0.25], B: [0.5, 0.5], C: [1, 0] }));
  assert.equal(r.sectionSubtotals.A, 1);
  assert.equal(r.crit3, true, '1 or more, not strictly above 1');
});

test('the secondary-source warning is carried in the result', () => {
  assert.match(scpPushing(build({ A: [1, 1], B: [1, 1], C: [1, 1] })).bandText, /ABOVE 1; the primary sources say 1 OR MORE/);
});

test('an all-zero patient meets no criterion', () => {
  const r = scpPushing(build({ A: [0, 0], B: [0, 0], C: [0, 0] }));
  assert.equal(r.total, 0);
  assert.equal(r.crit1, false);
  assert.equal(r.crit2, false);
  assert.equal(r.crit3, false);
  assert.equal(r.criteriaDisagree, false);
});

// Input handling.
test('both positions are required, and the refusal says no rule is invented for a patient who cannot stand', () => {
  const o = build({ A: [1, 1], B: [1, 1], C: [1, 1] });
  delete o.Astanding;
  const r = scpPushing(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /cannot stand/);
});

test('the scope note names the confounders it cannot distinguish', () => {
  const r = scpPushing(build({ A: [1, 1], B: [1, 1], C: [1, 1] }));
  assert.match(r.note, /spatial neglect/);
  assert.match(r.note, /does not diagnose stroke/);
});
