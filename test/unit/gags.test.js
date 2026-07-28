// spec-v554: the Global Acne Grading System.
//
// The load-bearing tests are the three source facts: the grade is a maximum and never a sum, the trunk is
// one region and not two, and a score of exactly 39 has no band in the published table.

import test from 'node:test';
import assert from 'node:assert/strict';
import { gags, GAGS_REGIONS, GAGS_GRADES, GAGS_MAX, UNASSIGNED_SCORE } from '../../lib/gags-v554.js';

const at = (grades) => {
  const o = {};
  GAGS_REGIONS.forEach((r, i) => { o[r.key] = String(grades[i]); });
  return gags(o);
};
const uniform = (g) => at([g, g, g, g, g, g]);

test('there are exactly six regions with the published factors', () => {
  assert.deepEqual(
    GAGS_REGIONS.map((r) => [r.key, r.factor]),
    [['forehead', 2], ['rightCheek', 2], ['leftCheek', 2], ['nose', 1], ['chin', 1], ['trunk', 3]],
  );
});

test('the factors sum to 11 and the maximum score is 44', () => {
  assert.equal(GAGS_REGIONS.reduce((a, r) => a + r.factor, 0), 11);
  assert.equal(GAGS_MAX, 44);
  assert.equal(uniform(4).total, 44);
  assert.equal(uniform(0).total, 0);
});

test('chest and upper back are one region, not two', () => {
  const trunk = GAGS_REGIONS.filter((r) => r.factor === 3);
  assert.equal(trunk.length, 1);
  assert.match(trunk[0].text, /ONE combined region/);
});

test('the grade key is the five published lesion levels', () => {
  assert.deepEqual(GAGS_GRADES.map((g) => g.value), [0, 1, 2, 3, 4]);
  assert.match(GAGS_GRADES[4].text, /nodule/);
});

test('each region score is factor times grade', () => {
  const r = at([4, 3, 2, 1, 0, 2]);
  assert.deepEqual(r.regionScores.map((x) => x.local), [8, 6, 4, 1, 0, 6]);
  assert.equal(r.total, 25);
});

// The grade is a maximum, never a sum: a nodule region is 4 regardless of what else is there.
test('a region grade never exceeds 4, so mixed lesions cannot stack', () => {
  assert.equal(at([5, 0, 0, 0, 0, 0]).valid, false);
  assert.equal(at([4, 0, 0, 0, 0, 0]).regionScores[0].local, 8);
});

test('the result states that the grade is the most severe lesion, not a sum', () => {
  assert.match(uniform(2).bandText, /MOST SEVERE lesion, never by counting lesions or adding lesion types/);
});

// Bands.
test('the band boundaries sit where the source puts them', () => {
  assert.equal(uniform(0).band, 'None');
  assert.equal(at([1, 0, 0, 0, 0, 0]).band, 'Mild');       // 2
  assert.equal(at([4, 4, 1, 0, 0, 0]).total, 18);
  assert.equal(at([4, 4, 1, 0, 0, 0]).band, 'Mild');
  assert.equal(at([4, 4, 1, 1, 0, 0]).total, 19);
  assert.equal(at([4, 4, 1, 1, 0, 0]).band, 'Moderate');
  assert.equal(at([4, 4, 4, 4, 2, 0]).total, 30);
  assert.equal(at([4, 4, 4, 4, 2, 0]).band, 'Moderate');
  assert.equal(at([4, 4, 4, 4, 3, 0]).total, 31);
  assert.equal(at([4, 4, 4, 4, 3, 0]).band, 'Severe');
});

// THE gap.
test('a score of exactly 39 is reachable and has no band', () => {
  const r39 = at([4, 4, 4, 4, 2, 3]); // 8+8+8+4+2+9 = 39
  assert.equal(r39.total, UNASSIGNED_SCORE);
  assert.equal(r39.bandAssigned, false);
  assert.equal(r39.band, null);
  assert.match(r39.bandText, /assigns NO band to a score of exactly 39/);
});

test('38 is severe and 40 is very severe, bracketing the gap', () => {
  const r38 = at([4, 4, 4, 3, 2, 3]); // 8+8+8+3+2+9 = 38
  assert.equal(r38.total, 38);
  assert.equal(r38.band, 'Severe');

  const r40 = at([4, 4, 4, 4, 3, 3]); // 40
  assert.equal(r40.total, 40);
  assert.equal(r40.band, 'Very severe');
  assert.equal(r40.bandAssigned, true);
});

test('the maximum score is very severe and assigned', () => {
  const r = uniform(4);
  assert.equal(r.band, 'Very severe');
  assert.equal(r.bandAssigned, true);
});

test('the gap disclosure appears only at 39', () => {
  for (const total of [[4, 4, 4, 3, 2, 3], [4, 4, 4, 4, 3, 3], [0, 0, 0, 0, 0, 0]]) {
    assert.doesNotMatch(at(total).bandText, /assigns NO band/);
  }
});

// Input handling.
test('a missing region is refused and named', () => {
  const o = {};
  for (const r of GAGS_REGIONS.slice(0, 5)) o[r.key] = '2';
  const r = gags(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /trunk/);
});

test('an out-of-range or non-integer grade is refused', () => {
  assert.equal(at([-1, 0, 0, 0, 0, 0]).valid, false);
  assert.equal(at([2.5, 0, 0, 0, 0, 0]).valid, false);
});

test('the scope note refuses to diagnose or select therapy and names what it misses', () => {
  const r = uniform(3);
  assert.match(r.note, /does not diagnose acne/);
  assert.match(r.note, /not an indication for isotretinoin/);
  assert.match(r.note, /scarring/);
});
