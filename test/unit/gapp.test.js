// spec-v569: GAPP.
//
// The load-bearing test is the additivity of the two histological-pattern features: if they were treated as
// alternatives the maximum would be 9, and the published maximum of 10 would be unreachable.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  gapp, HISTOLOGICAL_FEATURES, CELLULARITY_LEVELS, KI67_LEVELS, CATECHOLAMINE_TYPES,
  COMEDO_NECROSIS_POINTS, INVASION_POINTS, GAPP_MAX,
} from '../../lib/gapp-v569.js';

const base = (over = {}) => ({
  largeIrregularNest: 'no', pseudorosette: 'no', comedoNecrosis: 'no',
  cellularity: 'low', ki67: 'under-1', vascularOrCapsularInvasion: 'no',
  catecholamineType: 'non-functioning', ...over,
});
const score = (over = {}) => gapp(base(over));

test('the parameter weights are the published ones', () => {
  assert.deepEqual(HISTOLOGICAL_FEATURES.map((f) => f.points), [1, 1]);
  assert.equal(COMEDO_NECROSIS_POINTS, 2);
  assert.deepEqual(CELLULARITY_LEVELS.map((c) => c.points), [0, 1, 2]);
  assert.deepEqual(KI67_LEVELS.map((k) => k.points), [0, 1, 2]);
  assert.equal(INVASION_POINTS, 1);
  assert.deepEqual(CATECHOLAMINE_TYPES.map((c) => c.points), [0, 0, 1]);
  assert.equal(GAPP_MAX, 10);
});

// THE additivity resolution.
test('the two histological-pattern features add, giving a pattern maximum of 2', () => {
  assert.equal(score({ largeIrregularNest: 'yes' }).patternPoints, 1);
  assert.equal(score({ pseudorosette: 'yes' }).patternPoints, 1);
  const both = score({ largeIrregularNest: 'yes', pseudorosette: 'yes' });
  assert.equal(both.patternPoints, 2);
  assert.equal(both.bothPatternFeatures, true);
});

test('the published maximum of 10 is reachable only because the pattern features add', () => {
  const top = score({
    largeIrregularNest: 'yes', pseudorosette: 'yes', comedoNecrosis: 'yes',
    cellularity: 'high', ki67: 'over-3', vascularOrCapsularInvasion: 'yes',
    catecholamineType: 'noradrenergic',
  });
  assert.equal(top.total, GAPP_MAX);

  // With only one pattern point the ceiling would be 9, and 10 unreachable.
  const exclusiveCeiling = 1 + COMEDO_NECROSIS_POINTS
    + Math.max(...CELLULARITY_LEVELS.map((c) => c.points))
    + Math.max(...KI67_LEVELS.map((k) => k.points))
    + INVASION_POINTS
    + Math.max(...CATECHOLAMINE_TYPES.map((c) => c.points));
  assert.equal(exclusiveCeiling, 9);
  assert.ok(exclusiveCeiling < GAPP_MAX, 'mutual exclusivity would make the published maximum unreachable');
});

test('the result explains the additivity and why it must hold', () => {
  assert.match(score().bandText, /ADD rather than being alternatives/);
  assert.match(score().bandText, /every other category summed with a single pattern point gives 9/);
});

test('the minimum is 0', () => {
  assert.equal(score().total, 0);
});

// The non-monotonic catecholamine term.
test('a non-functioning tumor scores the same as adrenergic and less than noradrenergic', () => {
  const nonFunctioning = score({ catecholamineType: 'non-functioning' });
  const adrenergic = score({ catecholamineType: 'adrenergic' });
  const noradrenergic = score({ catecholamineType: 'noradrenergic' });
  assert.equal(nonFunctioning.total, adrenergic.total);
  assert.ok(nonFunctioning.total < noradrenergic.total);
});

test('the result flags the catecholamine ordering as published, not a mistake', () => {
  assert.match(score().bandText, /non-monotonic/);
  assert.match(score().bandText, /published ordering and is not rearranged/);
});

test('the catecholamine term is described as biochemical, not from the slide', () => {
  assert.match(score().bandText, /BIOCHEMICAL variable inside a histopathology grade/);
  assert.match(score().bandText, /not from the slide/);
});

// Grade bands.
test('the grade boundaries are the published ones', () => {
  assert.equal(score().grade, 'WD');                                            // 0
  assert.equal(score({ comedoNecrosis: 'yes' }).grade, 'WD');                   // 2
  assert.equal(score({ comedoNecrosis: 'yes', ki67: '1-to-3' }).grade, 'MD');   // 3
  assert.equal(score({
    comedoNecrosis: 'yes', cellularity: 'high', ki67: 'over-3',
  }).grade, 'MD');                                                              // 6
  assert.equal(score({
    comedoNecrosis: 'yes', cellularity: 'high', ki67: 'over-3', vascularOrCapsularInvasion: 'yes',
  }).grade, 'PD');                                                              // 7
});

test('each grade carries its reported survival', () => {
  assert.match(score().survival, /100 percent/);
  assert.match(score({ comedoNecrosis: 'yes', ki67: '1-to-3' }).survival, /67 percent/);
  assert.match(score({
    comedoNecrosis: 'yes', cellularity: 'high', ki67: 'over-3', vascularOrCapsularInvasion: 'yes',
  }).survival, /22 percent/);
});

// The surveillance warning.
test('the result and note both state that no grade excludes metastasis', () => {
  const r = score();
  assert.match(r.bandText, /NO grade excludes metastasis/);
  assert.match(r.bandText, /not a reason to stop surveillance/);
  assert.match(r.note, /well-differentiated tumors included/);
});

test('SDHB is named as not part of GAPP', () => {
  assert.match(score().bandText, /SDHB immunohistochemistry is NOT part of GAPP/);
});

// Input handling.
test('a missing pattern feature is refused, with the additivity explained', () => {
  const o = base();
  delete o.pseudorosette;
  const r = gapp(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /ADD rather than being alternatives/);
});

test('missing categorical inputs are refused', () => {
  assert.equal(gapp(base({ cellularity: '' })).valid, false);
  assert.equal(gapp(base({ ki67: '' })).valid, false);
  assert.equal(gapp(base({ catecholamineType: '' })).valid, false);
});

test('an unknown categorical value is refused', () => {
  assert.equal(score({ cellularity: 'enormous' }).valid, false);
  assert.equal(score({ ki67: '5' }).valid, false);
});

test('the scope note refuses to diagnose or set an imaging interval', () => {
  const r = score();
  assert.match(r.note, /does not diagnose pheochromocytoma/);
  assert.match(r.note, /does not select adjuvant therapy or an imaging interval/);
});
