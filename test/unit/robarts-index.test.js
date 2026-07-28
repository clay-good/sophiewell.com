// spec-v579: the Robarts Histopathology Index.
//
// The load-bearing tests are the non-injective erosion map (two descriptors, one value) and the sparse
// attainable range.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  robartsIndex, RHI_ITEMS, EROSION_ULCERATION, EPITHELIAL_NEUTROPHILS,
  GEBOES_GRADES_CONTRIBUTING_ZERO, attainableTotals,
  RHI_MAX, REMISSION_MAX, RESPONSE_MAX, GEBOES_REMISSION,
} from '../../lib/robarts-index-v579.js';

const at = ({ chronic = 0, lp = 0, epi = 0, erosion = '5.0' } = {}) => robartsIndex({
  chronicInfiltrate: String(chronic), laminaPropriaNeutrophils: String(lp),
  epithelialNeutrophils: String(epi), erosionUlceration: erosion,
});

test('the four weights are the published ones', () => {
  assert.deepEqual(RHI_ITEMS.map((i) => i.weight), [1, 2, 3, 5]);
});

test('the maximum is 33', () => {
  assert.equal(RHI_MAX, 33);
  assert.equal(at({ chronic: 3, lp: 3, epi: 3, erosion: '5.4' }).total, RHI_MAX);
  assert.equal(at({}).total, 0);
});

// THE non-injective map.
test('the erosion item has five descriptors but only four distinct values', () => {
  assert.equal(EROSION_ULCERATION.levels.length, 5);
  const distinct = new Set(EROSION_ULCERATION.levels.map((l) => l.value));
  assert.equal(distinct.size, 4, 'five descriptors collapse to four values');
});

test('descriptors 5.1 and 5.2 score identically', () => {
  const a = at({ erosion: '5.1' });
  const b = at({ erosion: '5.2' });
  assert.equal(a.total, b.total);
  assert.equal(a.total, 5, 'raw 1 at weight 5');
});

test('a five-value enum would overshoot the published maximum', () => {
  // If the five descriptors carried values 0..4, the item max would be 20 and the total 38.
  const wrongItemMax = 4 * EROSION_ULCERATION.weight;
  const correctItemMax = Math.max(...EROSION_ULCERATION.levels.map((l) => l.value)) * EROSION_ULCERATION.weight;
  assert.equal(correctItemMax, 15);
  assert.equal(wrongItemMax, 20);
  assert.equal(RHI_MAX - correctItemMax + wrongItemMax, 38, 'the maximum a naive implementation would report');
});

test('the result explains the shared score', () => {
  assert.match(at({}).bandText, /FIVE morphologic descriptors but only FOUR distinct values/);
});

test('the erosion item is addressed by descriptor, and a bare score is refused', () => {
  const r = robartsIndex({
    chronicInfiltrate: '0', laminaPropriaNeutrophils: '0',
    epithelialNeutrophils: '0', erosionUlceration: '1',
  });
  assert.equal(r.valid, false);
  assert.match(r.message, /must be one of: 5\.0, 5\.1, 5\.2, 5\.3, 5\.4/);
});

// The zero contributors.
test('three Geboes grades contribute nothing and are named', () => {
  assert.equal(GEBOES_GRADES_CONTRIBUTING_ZERO.length, 3);
  const named = GEBOES_GRADES_CONTRIBUTING_ZERO.map((g) => g.geboes);
  assert.deepEqual(named, ['Geboes grade 0', 'Geboes grade 2A', 'Geboes grade 4']);
  assert.deepEqual(at({}).zeroContributingGeboesGrades, named);
});

test('none of the zero-contributing grades is a scored item', () => {
  const scoredGeboes = RHI_ITEMS.map((i) => i.geboes);
  for (const g of GEBOES_GRADES_CONTRIBUTING_ZERO) {
    assert.ok(!scoredGeboes.includes(g.geboes), `${g.geboes} must not be an input`);
  }
});

test('the result states that those grades are descriptors, not inputs', () => {
  assert.match(at({}).bandText, /pathology descriptors, not calculator inputs/);
});

// The overlapping bands.
test('the epithelial-neutrophil overlap and hole are disclosed', () => {
  const levels = EPITHELIAL_NEUTROPHILS.levels.map((l) => l.text).join(' ');
  assert.match(levels, /Under 5 percent/);
  assert.match(levels, /Under 50 percent/);
  assert.match(at({}).bandText, /exactly 50 percent satisfies neither/);
});

// Density: the intuitive guess is that a weighted sum over coarse items leaves gaps. It does not.
test('every integer from 0 to 33 is attainable', () => {
  const totals = attainableTotals();
  assert.equal(totals[0], 0);
  assert.equal(totals[totals.length - 1], RHI_MAX);
  assert.equal(totals.length, RHI_MAX + 1, 'the range is fully dense with these weights');
  for (let i = 0; i <= RHI_MAX; i += 1) {
    assert.ok(totals.includes(i), `${i} must be attainable`);
  }
});

test('the result states that the range is dense, against the intuitive guess', () => {
  assert.match(at({}).bandText, /Every integer from 0 to 33 is attainable/);
});

// Thresholds.
test('remission and response use the RHI thresholds, not the Geboes ones', () => {
  assert.equal(REMISSION_MAX, 3);
  assert.equal(RESPONSE_MAX, 9);
  assert.notEqual(REMISSION_MAX, GEBOES_REMISSION);
  assert.equal(at({ chronic: 3 }).remission, true);
  assert.equal(at({ chronic: 3, lp: 1 }).remission, false);
  assert.equal(at({ chronic: 3, lp: 1 }).response, true);
  assert.equal(at({ epi: 3, lp: 1 }).response, false);
  assert.match(at({}).bandText, /NOT the Geboes thresholds/);
});

// Input handling.
test('every item is required', () => {
  assert.equal(robartsIndex({}).valid, false);
  assert.equal(robartsIndex({ chronicInfiltrate: '0' }).valid, false);
});

test('an out-of-range level is refused', () => {
  assert.equal(at({ chronic: 4 }).valid, false);
});

test('the scope note refuses dysplasia assessment and therapy selection', () => {
  const r = at({ epi: 3 });
  assert.match(r.note, /does not assess dysplasia/);
  assert.match(r.note, /persists in patients who look healed endoscopically/);
  assert.match(r.note, /does not select or escalate therapy/);
});
