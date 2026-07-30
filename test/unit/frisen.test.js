// spec-v616: the Frisen papilledema scale.
//
// The load-bearing tests are that every grade is reachable from findings alone, that grade 4 turns on a
// SPARED vessel while grade 5 turns on none being spared, and that the cumulative rule is enforced rather
// than assumed - contradictory findings return no grade at all.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  frisenGrade, gradeText, HALO_STATES, VESSEL_FINDINGS, GRADES,
} from '../../lib/frisen-v616.js';

const NO_VESSELS = { totalLeavingDisc: 'no', totalOnDisc: 'no', everyVesselObscured: 'no' };
const at = (halo, over = {}) => frisenGrade({ halo, ...NO_VESSELS, ...over });

test('the scale has six grades, 0 through 5', () => {
  assert.deepEqual(GRADES.map((g) => g.grade), [0, 1, 2, 3, 4, 5]);
  assert.equal(HALO_STATES.length, 3);
  assert.equal(VESSEL_FINDINGS.length, 3);
});

// Every grade reachable.
test('every grade is reachable from findings alone', () => {
  assert.equal(at('none').grade, 0);
  assert.equal(at('temporal-gap').grade, 1);
  assert.equal(at('circumferential').grade, 2);
  assert.equal(at('circumferential', { totalLeavingDisc: 'yes' }).grade, 3);
  assert.equal(at('circumferential', { totalLeavingDisc: 'yes', totalOnDisc: 'yes' }).grade, 4);
  assert.equal(at('circumferential', { totalLeavingDisc: 'yes', totalOnDisc: 'yes', everyVesselObscured: 'yes' }).grade, 5);
});

// THE temporal gap.
test('the temporal gap alone separates grade 1 from grade 2', () => {
  const one = at('temporal-gap');
  const two = at('circumferential');
  assert.equal(one.grade, 1);
  assert.equal(two.grade, 2);
  assert.deepEqual(one.vesselFindings, two.vesselFindings, 'the vessel findings are identical');
  assert.match(one.bandText, /TEMPORAL GAP IS THE ENTIRE DIFFERENCE/);
});

test('the anatomical reason for the gap is given, not just the appearance', () => {
  assert.match(at('temporal-gap').bandText, /axons being of fine caliber/);
});

// THE location distinction.
test('grade 3 and grade 4 differ only in where the obscured vessel is', () => {
  const three = at('circumferential', { totalLeavingDisc: 'yes' });
  const four = at('circumferential', { totalLeavingDisc: 'yes', totalOnDisc: 'yes' });
  assert.equal(three.grade, 3);
  assert.equal(four.grade, 4);
  assert.match(three.bandText, /LEAVES the disc/);
  assert.match(four.bandText, /ON the disc/);
});

// THE spared-vessel exception.
test('grade 4 requires a spared vessel and grade 5 requires none spared', () => {
  const four = at('circumferential', { totalLeavingDisc: 'yes', totalOnDisc: 'yes' });
  const five = at('circumferential', { totalLeavingDisc: 'yes', totalOnDisc: 'yes', everyVesselObscured: 'yes' });
  assert.equal(four.grade, 4);
  assert.equal(five.grade, 5);
  assert.match(four.bandText, /at least one major vessel on the disc must be SPARED/i);
  assert.match(five.bandText, /no major vessel is spared/);
  assert.match(gradeText(4), /SPARED/);
  assert.match(gradeText(5), /None is spared/);
});

// THE partial-versus-total distinction.
test('grade 2 permits partial obscuration and says so', () => {
  const two = at('circumferential');
  assert.match(two.bandText, /PARTIAL AND TOTAL OBSCURATION ARE NOT THE SAME THING/);
  assert.match(gradeText(2), /Partial obscuration of major vessels is PERMITTED/);
});

// THE enforced cumulative rule.
test('a vessel finding without the circumferential halo returns no grade', () => {
  for (const halo of ['none', 'temporal-gap']) {
    const r = at(halo, { totalLeavingDisc: 'yes' });
    assert.equal(r.grade, null, halo);
    assert.equal(r.consistent, false);
    assert.ok(r.contradictions.length >= 1);
    assert.match(r.bandText, /NO GRADE IS RETURNED/);
  }
});

test('obscuration on the disc without obscuration as vessels leave it returns no grade', () => {
  const r = at('circumferential', { totalOnDisc: 'yes' });
  assert.equal(r.grade, null);
  assert.equal(r.consistent, false);
  assert.ok(r.contradictions.some((c) => /requires the grade 3 finding/.test(c)));
});

test('every vessel obscured without on-disc obscuration returns no grade', () => {
  const r = at('circumferential', { totalLeavingDisc: 'yes', everyVesselObscured: 'yes' });
  assert.equal(r.grade, null);
  assert.equal(r.consistent, false);
  assert.ok(r.contradictions.some((c) => /ON the disc is reported as absent/.test(c)));
});

test('a contradiction is never resolved by picking the higher grade', () => {
  const r = at('temporal-gap', { totalLeavingDisc: 'yes', totalOnDisc: 'yes', everyVesselObscured: 'yes' });
  assert.equal(r.grade, null);
  assert.notEqual(r.band, 'Grade 5');
});

test('consistent findings report as consistent with no contradictions', () => {
  for (const r of [at('none'), at('temporal-gap'), at('circumferential'),
    at('circumferential', { totalLeavingDisc: 'yes' })]) {
    assert.equal(r.consistent, true);
    assert.deepEqual(r.contradictions, []);
  }
});

// THE scope.
test('the grade is never presented as an intracranial pressure', () => {
  for (const r of [at('none'), at('circumferential', { totalLeavingDisc: 'yes', totalOnDisc: 'yes' })]) {
    assert.match(r.bandText, /DOES NOT MEASURE INTRACRANIAL PRESSURE/);
    assert.match(r.note, /does not measure or estimate intracranial pressure/);
  }
  assert.match(at('none').bandText, /low grade does not exclude raised intracranial pressure/);
});

test('the inputs are validated', () => {
  assert.equal(frisenGrade({}).valid, false);
  assert.match(frisenGrade({}).message, /Describe the halo/);
  assert.match(at('none', { totalOnDisc: 'maybe' }).message, /must be yes or no/);
  assert.equal(frisenGrade({ halo: 'blurred', ...NO_VESSELS }).valid, false);
});

test('the scope note separates grading from diagnosis and from pseudopapilledema', () => {
  const r = at('circumferential');
  assert.match(r.note, /does not diagnose papilledema or its cause/);
  assert.match(r.note, /pseudopapilledema/);
  assert.match(r.note, /does not indicate whether imaging or a lumbar puncture is needed/);
});
