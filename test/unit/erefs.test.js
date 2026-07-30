// spec-v618: the EREFS endoscopic reference score.
//
// The load-bearing tests are that the total spans both regions (0 to 18, not 0 to 9), that all three
// published composite variants are returned rather than one bare number, and that no severity band is ever
// emitted because none is validated.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  erefs, findGrade, argKey, REGIONS, FEATURES, REGION_MAX, TOTAL_MAX, INFLAMMATORY_MAX, MODIFIED_MAX,
} from '../../lib/erefs-v618.js';

function at(fn) {
  const input = {};
  for (const r of REGIONS) for (const f of FEATURES) input[argKey(r.key, f.key)] = String(fn(r, f));
  return erefs(input);
}
const allZero = () => at(() => 0);
const allMax = () => at((r, f) => f.grades.length - 1);

test('the instrument is five features in each of two regions', () => {
  assert.equal(REGIONS.length, 2);
  assert.equal(FEATURES.length, 5);
  assert.deepEqual(REGIONS.map((r) => r.key), ['proximal', 'distal']);
  assert.deepEqual(FEATURES.map((f) => f.key), ['edema', 'rings', 'exudates', 'furrows', 'stricture']);
});

// THE regional structure.
test('a region maxes at 9 and the total at 18, not 9', () => {
  assert.equal(REGION_MAX, 9);
  assert.equal(TOTAL_MAX, 18);
  const hi = allMax();
  assert.equal(hi.total, 18);
  for (const r of hi.perRegion) assert.equal(r.score, 9);
  assert.equal(allZero().total, 0);
});

test('the two regions are reported separately and the total is their sum', () => {
  const r = at((region, f) => (region.key === 'proximal' && f.key === 'rings' ? 3 : 0));
  assert.equal(r.perRegion[0].score, 3);
  assert.equal(r.perRegion[1].score, 0);
  assert.equal(r.total, 3);
  assert.match(r.bandLabel, /proximal 3, distal 0/);
  assert.match(r.bandText, /SCORED SEPARATELY/);
});

test('one region alone is never presented as the whole score', () => {
  const r = allMax();
  assert.notEqual(r.perRegion[0].score, r.total);
  assert.match(r.bandText, /halves the scale/);
});

// THE unequal weighting.
test('the features have different maxima', () => {
  assert.deepEqual(FEATURES.map((f) => f.grades.length - 1), [1, 3, 2, 2, 1]);
  assert.notEqual(new Set(FEATURES.map((f) => f.grades.length)).size, 1);
});

test('a stricture is worth the same single point as edema, and less than rings', () => {
  const stricture = at((r, f) => (r.key === 'distal' && f.key === 'stricture' ? 1 : 0));
  const edema = at((r, f) => (r.key === 'distal' && f.key === 'edema' ? 1 : 0));
  const rings = at((r, f) => (r.key === 'distal' && f.key === 'rings' ? 3 : 0));
  assert.equal(stricture.total, edema.total);
  assert.ok(rings.total > stricture.total * 2);
  assert.equal(stricture.strictureAnywhere, true);
  assert.match(stricture.bandText, /A stricture is recorded and contributed 1 point/);
  assert.match(stricture.bandText, /least granular item/);
});

test('the stricture callout fires only when a stricture is present', () => {
  assert.equal(allZero().strictureAnywhere, false);
  assert.doesNotMatch(allZero().bandText, /A stricture is recorded/);
});

// THE three named variants.
test('all three published composites are returned, not one bare number', () => {
  const hi = allMax();
  assert.equal(hi.total, TOTAL_MAX);
  assert.equal(hi.inflammatoryScore, INFLAMMATORY_MAX);
  assert.equal(hi.modifiedScore, MODIFIED_MAX);
  assert.match(hi.bandText, /full composite/);
  assert.match(hi.bandText, /inflammatory subscore/);
  assert.match(hi.bandText, /modified presence-or-absence score/);
  assert.match(hi.bandText, /AMBIGUOUS/);
});

test('the inflammatory subscore excludes rings and stricture', () => {
  const ringsAndStricture = at((r, f) => (f.key === 'rings' ? 3 : f.key === 'stricture' ? 1 : 0));
  assert.ok(ringsAndStricture.total > 0);
  assert.equal(ringsAndStricture.inflammatoryScore, 0, 'rings and stricture contribute nothing to it');
  const edemaOnly = at((r, f) => (f.key === 'edema' ? 1 : 0));
  assert.equal(edemaOnly.inflammatoryScore, 2, 'one point in each region');
});

test('the modified score counts features present, so it cannot exceed ten', () => {
  const hi = allMax();
  assert.equal(hi.modifiedScore, FEATURES.length * REGIONS.length);
  assert.equal(MODIFIED_MAX, 10);
  // A severe finding still counts once under the modified score.
  const severeRings = at((r, f) => (f.key === 'rings' ? 3 : 0));
  assert.equal(severeRings.modifiedScore, 2, 'once per region regardless of grade');
  assert.equal(severeRings.total, 6, 'but three points per region in the full composite');
});

// THE withheld material.
test('no severity band is ever returned', () => {
  for (const r of [allZero(), allMax(), at((region, f) => (f.key === 'edema' ? 1 : 0))]) {
    assert.equal(r.band, null);
  }
  assert.match(allZero().bandText, /NO VALIDATED SEVERITY BANDS/);
  assert.match(allZero().bandText, /CHANGE from a patient own baseline/);
});

test('the rings descriptors are named but not asserted', () => {
  const rings = FEATURES.find((f) => f.key === 'rings');
  assert.deepEqual(rings.grades.map((g) => g.text), ['Absent', 'Mild', 'Moderate', 'Severe']);
  assert.match(allZero().bandText, /NAMED BUT NOT DEFINED HERE/);
});

test('the exudate 10% boundary is disclosed only at the severe grade', () => {
  const severe = at((r, f) => (f.key === 'exudates' && r.key === 'proximal' ? 2 : 0));
  const mild = at((r, f) => (f.key === 'exudates' && r.key === 'proximal' ? 1 : 0));
  assert.match(severe.bandText, /DISCLOSURE AT THIS GRADE ONLY/);
  assert.doesNotMatch(mild.bandText, /DISCLOSURE AT THIS GRADE ONLY/);
  assert.match(FEATURES.find((f) => f.key === 'exudates').grades[2].text, /10% or more/);
});

// Input handling and scope.
test('grades outside a feature range are rejected', () => {
  const edema = FEATURES.find((f) => f.key === 'edema');
  const rings = FEATURES.find((f) => f.key === 'rings');
  assert.equal(findGrade(edema, 2), null, 'edema has no grade 2');
  assert.equal(findGrade(rings, 3).grade, 3);
  assert.equal(findGrade(rings, 4), null);
  assert.equal(findGrade(edema, '1').grade, 1);
  assert.equal(findGrade(edema, '1.5'), null);
});

test('an empty value is never silently read as grade 0', () => {
  // Grade 0 is a real grade, and Number('') is 0 - so a blank must be rejected before coercion.
  const edema = FEATURES.find((f) => f.key === 'edema');
  assert.equal(findGrade(edema, ''), null);
  assert.equal(findGrade(edema, '   '), null);
  assert.equal(findGrade(edema, undefined), null);
  assert.equal(findGrade(edema, null), null);
  assert.equal(findGrade(edema, '0').grade, 0, 'an explicit 0 is still accepted');
});

test('the inputs are validated', () => {
  assert.equal(erefs({}).valid, false);
  assert.match(erefs({}).message, /Grade all 10 items/);
  assert.match(erefs({}).message, /10 still ungraded/);
  const partial = {};
  for (const f of FEATURES) partial[argKey('proximal', f.key)] = '0';
  assert.match(erefs(partial).message, /5 still ungraded/);
});

test('the scope note keeps EREFS off diagnosis, symptoms and therapy', () => {
  const r = allMax();
  assert.match(r.note, /does not diagnose eosinophilic esophagitis/);
  assert.match(r.note, /biopsy with an eosinophil count/);
  assert.match(r.note, /normal-looking esophagus can still be histologically active/);
  assert.match(r.note, /does not measure symptoms or dysphagia/);
  assert.match(r.note, /dilation, diet elimination, topical steroid or biologic therapy/);
});
