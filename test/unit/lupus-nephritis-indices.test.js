// spec-v565: the modified NIH lupus nephritis activity and chronicity indices.
//
// The load-bearing tests are the two doubled activity components (without which the maximum would be 18,
// not 24), the two incommensurable rubrics, and the absence of any combined total.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lupusNephritisIndices, ACTIVITY_COMPONENTS, CHRONICITY_COMPONENTS, rubricFor,
  GLOMERULAR_RUBRIC, SEVERITY_RUBRIC, ACTIVITY_MAX, CHRONICITY_MAX,
} from '../../lib/lupus-nephritis-indices-v565.js';

const ALL = [...ACTIVITY_COMPONENTS, ...CHRONICITY_COMPONENTS];
const all = (v) => Object.fromEntries(ALL.map((c) => [c.key, String(v)]));

test('the two indices have the published component counts and maxima', () => {
  assert.equal(ACTIVITY_COMPONENTS.length, 6);
  assert.equal(CHRONICITY_COMPONENTS.length, 4);
  assert.equal(ACTIVITY_MAX, 24);
  assert.equal(CHRONICITY_MAX, 12);
});

test('the maxima are reached at full marks', () => {
  const r = lupusNephritisIndices(all(3));
  assert.equal(r.activityIndex, ACTIVITY_MAX);
  assert.equal(r.chronicityIndex, CHRONICITY_MAX);
});

test('all zeros give zero on both indices', () => {
  const r = lupusNephritisIndices(all(0));
  assert.equal(r.activityIndex, 0);
  assert.equal(r.chronicityIndex, 0);
});

// THE weighting.
test('exactly two activity components are weighted twice, and no chronicity component is', () => {
  const weighted = ACTIVITY_COMPONENTS.filter((c) => c.weight === 2).map((c) => c.key);
  assert.deepEqual(weighted, ['fibrinoidNecrosis', 'cellularCrescents']);
  assert.ok(CHRONICITY_COMPONENTS.every((c) => c.weight === 1));
});

test('without the doubled terms the activity maximum would be 18, not 24', () => {
  const unweightedMax = ACTIVITY_COMPONENTS.length * 3;
  assert.equal(unweightedMax, 18);
  assert.equal(ACTIVITY_MAX, 24);
  assert.equal(ACTIVITY_MAX - unweightedMax, 6, 'the two doubled terms contribute the extra 6');
});

test('a weighted component contributes double a non-weighted one', () => {
  const base = all(0);
  const necrosis = { ...base, fibrinoidNecrosis: '3' };
  const hyaline = { ...base, hyalineDeposits: '3' };
  assert.equal(lupusNephritisIndices(necrosis).activityIndex, 6);
  assert.equal(lupusNephritisIndices(hyaline).activityIndex, 3);
});

test('the chronicity index is unweighted throughout', () => {
  const base = all(0);
  for (const c of CHRONICITY_COMPONENTS) {
    const r = lupusNephritisIndices({ ...base, [c.key]: '3' });
    assert.equal(r.chronicityIndex, 3, c.key);
  }
});

// The two rubrics.
test('glomerular components use the percentage rubric and interstitial ones use severity', () => {
  assert.equal(rubricFor(ACTIVITY_COMPONENTS[0]), GLOMERULAR_RUBRIC);
  assert.equal(rubricFor(ACTIVITY_COMPONENTS.find((c) => c.key === 'interstitialInflammation')), SEVERITY_RUBRIC);
  assert.equal(rubricFor(CHRONICITY_COMPONENTS.find((c) => c.key === 'tubularAtrophy')), SEVERITY_RUBRIC);
  assert.equal(rubricFor(CHRONICITY_COMPONENTS.find((c) => c.key === 'totalGlomerulosclerosis')), GLOMERULAR_RUBRIC);
});

test('the two rubrics share a numeric range but not their wording', () => {
  assert.deepEqual(GLOMERULAR_RUBRIC.map((r) => r.value), SEVERITY_RUBRIC.map((r) => r.value));
  assert.match(GLOMERULAR_RUBRIC[1].text, /percent of glomeruli/);
  assert.equal(SEVERITY_RUBRIC[1].text, 'Mild');
});

test('the result explains that the rubrics are incommensurable', () => {
  assert.match(lupusNephritisIndices(all(1)).bandText, /The numeric range is the same and the meaning is not/);
});

// The two indices are never combined.
test('no combined total is emitted', () => {
  const r = lupusNephritisIndices(all(3));
  assert.equal(r.total, undefined);
  assert.equal(r.combined, undefined);
  assert.match(r.bandText, /never added together/);
});

test('the chronicity component is total, not global, glomerulosclerosis', () => {
  const c = CHRONICITY_COMPONENTS.find((x) => x.key === 'totalGlomerulosclerosis');
  assert.match(c.text, /global AND segmental/);
});

// Version and sampling caveats.
test('the result names the version and says the indices are not interconvertible', () => {
  const r = lupusNephritisIndices(all(2));
  assert.equal(r.version, '2018 modified NIH indices');
  assert.match(r.bandText, /NOT interconvertible with the 1984 original/);
  assert.match(r.bandText, /abolished the A, A\/C and C subscripts/);
});

test('the result warns that an inadequate biopsy can only lower the score', () => {
  assert.match(lupusNephritisIndices(all(1)).bandText, /can only LOWER the glomerular scores/);
});

// Input handling.
test('a missing component is refused and named', () => {
  const o = all(2);
  delete o.fibrousCrescents;
  const r = lupusNephritisIndices(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /fibrousCrescents/);
});

test('an out-of-range component is refused', () => {
  const o = all(2);
  o.tubularAtrophy = '4';
  assert.equal(lupusNephritisIndices(o).valid, false);
});

test('the scope note refuses to assign the class or indicate immunosuppression', () => {
  const r = lupusNephritisIndices(all(3));
  assert.match(r.note, /do not assign the ISN\/RPS class/);
  assert.match(r.note, /not a reason to withhold treatment/);
});
