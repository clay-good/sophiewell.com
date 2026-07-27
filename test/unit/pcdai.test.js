// spec-v522: the Pediatric Crohn's Disease Activity Index (PCDAI).
// Worked-example tests: the non-uniform weighting that makes 100 reachable (and that albumin is the
// full-weight lab), the age- and sex-specific hematocrit thresholds, every lab cut point including the
// values that fall between the printed rows, both activity-band edges at exactly 10 and exactly 30, and the
// guards. Items, weights, and thresholds transcribed from Hyams and colleagues 1991 and 2005 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pcdai, PCDAI_ITEMS, HCT_BANDS } from '../../lib/pcdai-v522.js';

// A healthy baseline: every clinical item 0, every lab normal.
function score(over = {}) {
  return pcdai({
    pain: 0, stools: 0, wellbeing: 0, weight: 0, height: 0, abdomen: 0, perirectal: 0, eim: 0,
    hctBand: 'child', hct: 40, esr: 5, albumin: 4.2, ...over,
  });
}

test('eight full-weight clinical items, each with three options', () => {
  assert.equal(PCDAI_ITEMS.length, 8);
  for (const item of PCDAI_ITEMS) {
    assert.deepEqual(item.options.map((o) => o.value), ['0', '5', '10']);
  }
});

test('the weights are not uniform, and they add to exactly 100', () => {
  const max = pcdai({
    pain: 10, stools: 10, wellbeing: 10, weight: 10, height: 10, abdomen: 10, perirectal: 10, eim: 10,
    hctBand: 'child', hct: 20, esr: 80, albumin: 2.0,
  });
  assert.equal(max.clinicalTotal, 80);
  assert.equal(max.hctPoints, 5);      // half weight
  assert.equal(max.esrPoints, 5);      // half weight
  assert.equal(max.albuminPoints, 10); // FULL weight -- the odd one out
  assert.equal(max.labTotal, 20);
  assert.equal(max.total, 100);
});

test('albumin is the full-weight lab: half-weighting it would cap the index at 95', () => {
  const max = pcdai({
    pain: 10, stools: 10, wellbeing: 10, weight: 10, height: 10, abdomen: 10, perirectal: 10, eim: 10,
    hctBand: 'child', hct: 20, esr: 80, albumin: 2.0,
  });
  assert.notEqual(max.albuminPoints, 5);
  assert.equal(max.albuminPoints, 10);
});

test('the floor is 0 and reads as inactive', () => {
  const lo = score();
  assert.equal(lo.valid, true);
  assert.equal(lo.total, 0);
  assert.equal(lo.activity, 'inactive disease');
});

test('the same hematocrit scores differently by age and sex', () => {
  // 34% is a perfect 0 for a girl of 12 and worth 2.5 for a boy of 12.
  assert.equal(score({ hctBand: 'female11to19', hct: 34 }).hctPoints, 0);
  assert.equal(score({ hctBand: 'male11to14', hct: 34 }).hctPoints, 2.5);
  // ...and worth 2.5 for an older boy too, whose zero threshold is higher still.
  assert.equal(score({ hctBand: 'male15to19', hct: 34 }).hctPoints, 2.5);
  // A 10-year-old's zero threshold is the lowest of the four.
  assert.equal(score({ hctBand: 'child', hct: 34 }).hctPoints, 0);
});

test('every published hematocrit band edge', () => {
  const edges = [
    ['child', 33, 0], ['child', 32, 2.5], ['child', 28, 2.5], ['child', 27, 5],
    ['male11to14', 35, 0], ['male11to14', 34, 2.5], ['male11to14', 30, 2.5], ['male11to14', 29, 5],
    ['male15to19', 37, 0], ['male15to19', 36, 2.5], ['male15to19', 32, 2.5], ['male15to19', 31, 5],
    ['female11to19', 34, 0], ['female11to19', 33, 2.5], ['female11to19', 29, 2.5], ['female11to19', 28, 5],
  ];
  for (const [hctBand, hct, pts] of edges) {
    assert.equal(score({ hctBand, hct }).hctPoints, pts, `${hctBand} at ${hct}`);
  }
  assert.equal(HCT_BANDS.length, 4);
});

test('ESR cut points', () => {
  assert.equal(score({ esr: 19 }).esrPoints, 0);
  assert.equal(score({ esr: 20 }).esrPoints, 2.5);
  assert.equal(score({ esr: 50 }).esrPoints, 2.5);
  assert.equal(score({ esr: 51 }).esrPoints, 5);
});

test('albumin cut points', () => {
  assert.equal(score({ albumin: 3.5 }).albuminPoints, 0);
  assert.equal(score({ albumin: 3.4 }).albuminPoints, 5);
  assert.equal(score({ albumin: 3.1 }).albuminPoints, 5);
  assert.equal(score({ albumin: 3.0 }).albuminPoints, 10);
});

test('values falling between the printed rows resolve without moving a published edge', () => {
  // 32.5 is between the 10-and-under band's printed "28-32" and ">=33" rows.
  assert.equal(score({ hctBand: 'child', hct: 32.5 }).hctPoints, 2.5);
  // 3.45 is between the printed "3.1-3.4" and ">=3.5" rows.
  assert.equal(score({ albumin: 3.45 }).albuminPoints, 5);
});

test('both activity-band edges are exactly reachable and sit where 2005 recommends', () => {
  const ten = score({ pain: 5, hct: 20 });            // 5 clinical + 5 hematocrit (child, below 28)
  assert.equal(ten.total, 10);
  assert.equal(ten.activity, 'mild disease');         // exactly 10 is NOT inactive

  const justUnder = score({ pain: 5, esr: 25 });      // 5 + 2.5 = 7.5
  assert.equal(justUnder.total, 7.5);
  assert.equal(justUnder.activity, 'inactive disease');

  const thirty = score({ pain: 10, stools: 10, wellbeing: 10 });
  assert.equal(thirty.total, 30);
  assert.equal(thirty.activity, 'moderate to severe disease'); // exactly 30 IS moderate-severe

  const justUnder30 = score({ pain: 10, stools: 10, wellbeing: 5, esr: 25 });
  assert.equal(justUnder30.total, 27.5);
  assert.equal(justUnder30.activity, 'mild disease');
});

test('a worked moderate case (the META example)', () => {
  const r = pcdai({
    pain: 5, stools: 5, wellbeing: 5, weight: 5, height: 0, abdomen: 5, perirectal: 0, eim: 0,
    hctBand: 'male11to14', hct: 31, esr: 40, albumin: 3.2,
  });
  assert.equal(r.clinicalTotal, 25);
  assert.equal(r.hctPoints, 2.5);
  assert.equal(r.esrPoints, 2.5);
  assert.equal(r.albuminPoints, 5);
  assert.equal(r.labTotal, 10);
  assert.equal(r.total, 35);
  assert.equal(r.activity, 'moderate to severe disease');
});

test('the result never claims mucosal healing or a diagnosis', () => {
  const r = score();
  assert.match(r.note, /not a substitute for endoscopy/);
  assert.doesNotMatch(r.band, /remission confirmed|mucosal healing|diagnos/i);
});

test('string inputs are accepted', () => {
  const r = pcdai({
    pain: '5', stools: '5', wellbeing: '5', weight: '5', height: '0', abdomen: '5', perirectal: '0', eim: '0',
    hctBand: 'male11to14', hct: '31', esr: '40', albumin: '3.2',
  });
  assert.equal(r.total, 35);
});

test('a missing item, an unknown band, or a bad number is invalid', () => {
  assert.equal(pcdai({}).valid, false);
  assert.equal(score({ pain: undefined }).valid, false);
  assert.equal(score({ hctBand: 'male20to30' }).valid, false);
  assert.equal(score({ pain: 7 }).valid, false);
  assert.equal(score({ esr: -1 }).valid, false);
  assert.equal(score({ albumin: 'low' }).valid, false);
});
