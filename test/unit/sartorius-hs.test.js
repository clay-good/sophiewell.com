// spec-v607: the modified Sartorius score.
//
// The load-bearing tests are that a draining fistula is worth exactly six nodules, and that no severity band
// is ever returned because the published band table is single-sourced.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sartoriusRegion, DISTANCE_BANDS, REGION_POINTS, NODULE_POINTS, FISTULA_POINTS, SEPARATION_POINTS,
} from '../../lib/sartorius-hs-v607.js';

const at = (over = {}) => sartoriusRegion({
  nodules: '0', fistulas: '0', distance: 'none', separatedByNormalSkin: 'yes', ...over,
});

test('the published weights are carried', () => {
  assert.equal(REGION_POINTS, 3);
  assert.equal(NODULE_POINTS, 1);
  assert.equal(FISTULA_POINTS, 6);
  assert.equal(SEPARATION_POINTS, 9);
});

// THE type-over-count weighting.
test('a draining fistula is worth exactly six nodules', () => {
  const sixNodules = at({ nodules: '6' });
  const oneFistula = at({ fistulas: '1' });
  assert.equal(sixNodules.nodulePoints, oneFistula.fistulaPoints);
  assert.equal(sixNodules.regionalScore, oneFistula.regionalScore);
  assert.equal(FISTULA_POINTS / NODULE_POINTS, 6);
});

test('the fistula weighting is spelled out whenever fistulas are present', () => {
  const r = at({ fistulas: '2' });
  assert.equal(r.fistulaPoints, 12);
  assert.equal(r.fistulasWorthNodules, 12);
  assert.match(r.bandText, /as much as 12 nodules/);
});

// THE tripling distance term.
test('the distance term triples at each step', () => {
  assert.deepEqual(DISTANCE_BANDS.map((d) => d.points), [0, 1, 3, 9]);
  assert.equal(at({ nodules: '1', distance: 'under-5' }).distancePoints, 1);
  assert.equal(at({ nodules: '1', distance: '5-to-10' }).distancePoints, 3);
  assert.equal(at({ nodules: '1', distance: 'over-10' }).distancePoints, 9);
});

test('a span over 10 cm is worth nine nodules', () => {
  const span = at({ nodules: '1', distance: 'over-10' });
  const nodules = at({ nodules: '10', distance: 'none' });
  assert.equal(span.distancePoints, 9);
  assert.equal(span.regionalScore, nodules.regionalScore, '1 nodule + 9 distance == 10 nodules');
  assert.match(span.bandText, /as much as 9 nodules/);
});

// THE Hurley overlap.
test('the separation item is the Hurley stage III criterion', () => {
  const separated = at({ nodules: '1', separatedByNormalSkin: 'yes' });
  const confluent = at({ nodules: '1', separatedByNormalSkin: 'no' });
  assert.equal(separated.separationPoints, 0);
  assert.equal(confluent.separationPoints, SEPARATION_POINTS);
  assert.equal(confluent.regionalScore - separated.regionalScore, SEPARATION_POINTS);
  assert.match(confluent.bandText, /HURLEY QUESTION IN DISGUISE/);
  assert.match(confluent.bandText, /not independent/);
});

// THE withheld band.
test('no severity band is ever returned', () => {
  for (const over of [{}, { nodules: '50' }, { fistulas: '20', distance: 'over-10', separatedByNormalSkin: 'no' }]) {
    assert.equal(at(over).band, null, JSON.stringify(over));
  }
  assert.match(at().bandText, /No severity band is returned/);
  assert.match(at().bandText, /single-sourced/);
});

test('the score is unbounded and reports no maximum', () => {
  const huge = at({ nodules: '100', fistulas: '30', distance: 'over-10', separatedByNormalSkin: 'no' });
  assert.ok(huge.regionalScore > 200, `got ${huge.regionalScore}`);
  assert.equal('max' in huge, false);
  assert.match(huge.bandText, /NO maximum/);
});

// The region point.
test('the region point applies only when the region has lesions', () => {
  assert.equal(at().regionPoints, 0);
  assert.equal(at({ nodules: '1' }).regionPoints, REGION_POINTS);
  assert.equal(at({ fistulas: '1' }).regionPoints, REGION_POINTS);
});

test('the regional unit is stated in every result', () => {
  assert.match(at().bandText, /SINGLE anatomical region/);
  assert.match(at().bandText, /SUM across involved regions/);
});

// Provenance.
test('the reason it was superseded is stated', () => {
  assert.match(at().bandText, /time-consuming/);
  assert.match(at().bandText, /no patient-reported component/);
});

// Input handling and scope.
test('the inputs are validated and counts must be whole numbers', () => {
  assert.equal(sartoriusRegion({}).valid, false);
  assert.match(sartoriusRegion({}).message, /FOR ONE REGION/);
  assert.match(at({ nodules: '1.5' }).message, /whole number/);
  assert.match(at({ nodules: '1', distance: 'far' }).message, /Distance must be one of/);
});

test('the scope note separates extent from symptom burden', () => {
  const r = at();
  assert.match(r.note, /does not diagnose hidradenitis suppurativa/);
  assert.match(r.note, /pain, drainage, odor or quality of life/);
  assert.match(r.note, /does not by itself mean the patient feels better/);
});
