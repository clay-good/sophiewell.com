// spec-v541: RACHS-1.
// Worked-example tests: the six categories and their published mortality, the DELIBERATE absence of a
// category 5 figure, the modifiers being odds ratios rather than points, the historical framing, and the
// guards. Categories and values transcribed from Jenkins and colleagues 2002 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rachs1, RACHS_CATEGORIES, RACHS_MODIFIERS } from '../../lib/rachs1-v541.js';

function score(category, over = {}) {
  return rachs1({ category, ageBand: 'age>1y', premature: 'no', majorAnomaly: 'no', ...over });
}

test('six categories', () => {
  assert.deepEqual(RACHS_CATEGORIES.map((c) => c.value), ['1', '2', '3', '4', '5', '6']);
});

test('the published mortality figures sit where the source puts them', () => {
  assert.match(score('1').band, /0\.4 percent/);
  assert.match(score('2').band, /3\.8 percent/);
  assert.match(score('3').band, /8\.5 percent/);
  assert.match(score('4').band, /19\.4 percent/);
  assert.match(score('6').band, /47\.7 percent/);
});

test('CATEGORY 5 HAS NO PUBLISHED MORTALITY, and none is invented', () => {
  const r = score('5');
  assert.equal(r.valid, true);
  assert.equal(r.mortalityPublished, false);
  assert.equal(r.mortality, null);
  assert.match(r.band, /too few cases/);
  assert.match(r.band, /higher risk than category 4 and lower than category 6/);
  assert.match(r.band, /would invent a figure the source deliberately withheld/);
  // No percentage may appear for category 5.
  assert.doesNotMatch(r.band, /\d+\.\d+ percent/);
});

test('every other category does report a percentage', () => {
  for (const c of ['1', '2', '3', '4', '6']) {
    assert.equal(score(c).mortalityPublished, true, c);
    assert.match(score(c).band, /\d+\.\d+ percent/, c);
  }
});

test('the modifiers are odds ratios, not points (the META example)', () => {
  const r = score('4', { ageBand: 'age<=30d', premature: 'yes', majorAnomaly: 'no' });
  assert.equal(r.category, '4');
  assert.equal(r.modifiers.length, 2);
  assert.match(r.band, /adjusted odds ratio about 3/);
  assert.match(r.band, /adjusted odds ratio about 1\.8/);
  assert.match(r.band, /multiply risk within the model and are not points to add to the category/);
  // The category itself is unchanged by the modifiers.
  assert.equal(score('4').category, r.category);
});

test('the reference age band contributes no modifier', () => {
  const r = score('2', { ageBand: 'age>1y' });
  assert.deepEqual(r.modifiers, []);
  assert.match(r.band, /No additional risk modifiers were selected/);
  const ref = RACHS_MODIFIERS.find((m) => m.value === 'age>1y');
  assert.equal(ref.oddsRatio, 1.0);
});

test('every category frames the mortality figures as historical', () => {
  for (const c of RACHS_CATEGORIES) {
    assert.match(score(c.value).band, /historical/);
    assert.match(score(c.value).band, /improved substantially since/);
  }
});

test('every category refuses the individual-prediction reading', () => {
  for (const c of RACHS_CATEGORIES) {
    assert.match(score(c.value).band, /not a prediction for an individual child/);
  }
  assert.match(score('1').note, /not a basis for counselling a family/);
  assert.match(score('1').note, /not a difficulty rating for the operating room/);
});

test('the procedure lists are labeled representative rather than exhaustive', () => {
  assert.match(score('3').note, /representative rather than exhaustive/);
  for (const c of RACHS_CATEGORIES) assert.ok(c.examples.length > 0, c.value);
});

test('the guards', () => {
  assert.equal(rachs1({}).valid, false);
  assert.equal(rachs1({ category: '7', ageBand: 'age>1y', premature: 'no', majorAnomaly: 'no' }).valid, false);
  assert.equal(rachs1({ category: '1' }).valid, false);
  assert.equal(rachs1({ category: '1', ageBand: 'age>1y' }).valid, false);
  assert.equal(rachs1({ category: '1', ageBand: 'newborn', premature: 'no', majorAnomaly: 'no' }).valid, false);
  assert.equal(score('1', { premature: 'maybe' }).valid, false);
});
