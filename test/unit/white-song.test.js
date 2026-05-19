import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whiteSong } from '../../lib/scoring-v4.js';

test('white-song 14 of 14 (all 2s; tile example) -> fast-track eligible', () => {
  const r = whiteSong({ loc: 2, physicalActivity: 2, hemodynamicStability: 2, respiratoryStability: 2, oxygenSaturation: 2, postoperativePain: 2, postoperativeEmesis: 2 });
  assert.equal(r.score, 14);
  assert.equal(r.fastTrackEligible, true);
  assert.match(r.band, /fast-track eligible per White 1999/);
});

test('white-song 12 with all domains >=1 -> fast-track eligible (boundary)', () => {
  // five 2s + two 1s = 12
  const r = whiteSong({ loc: 2, physicalActivity: 2, hemodynamicStability: 2, respiratoryStability: 2, oxygenSaturation: 2, postoperativePain: 1, postoperativeEmesis: 1 });
  assert.equal(r.score, 12);
  assert.equal(r.anyDomainLt1, false);
  assert.equal(r.fastTrackEligible, true);
});

test('white-song 12 with one domain = 0 -> NOT fast-track (per-domain floor)', () => {
  // six 2s + one 0 = 12 but one domain = 0
  const r = whiteSong({ loc: 2, physicalActivity: 2, hemodynamicStability: 2, respiratoryStability: 2, oxygenSaturation: 2, postoperativePain: 2, postoperativeEmesis: 0 });
  assert.equal(r.score, 12);
  assert.equal(r.anyDomainLt1, true);
  assert.equal(r.fastTrackEligible, false);
  assert.match(r.band, /at least one domain <1/);
});

test('white-song 11 with all domains >=1 -> NOT fast-track (sum cutoff)', () => {
  // four 2s + three 1s = 11
  const r = whiteSong({ loc: 2, physicalActivity: 2, hemodynamicStability: 2, respiratoryStability: 2, oxygenSaturation: 1, postoperativePain: 1, postoperativeEmesis: 1 });
  assert.equal(r.score, 11);
  assert.equal(r.anyDomainLt1, false);
  assert.equal(r.fastTrackEligible, false);
});

test('white-song 0 of 14 -> NOT fast-track', () => {
  const r = whiteSong({ loc: 0, physicalActivity: 0, hemodynamicStability: 0, respiratoryStability: 0, oxygenSaturation: 0, postoperativePain: 0, postoperativeEmesis: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.fastTrackEligible, false);
});

test('white-song clamps per-domain out-of-range to [0, 2]', () => {
  const r = whiteSong({ loc: 99, physicalActivity: -1, hemodynamicStability: 2, respiratoryStability: 2, oxygenSaturation: 2, postoperativePain: 2, postoperativeEmesis: 2 });
  assert.equal(r.parts.loc, 2);
  assert.equal(r.parts.physicalActivity, 0);
  assert.equal(r.score, 12);
  // physicalActivity = 0 means per-domain floor fails
  assert.equal(r.fastTrackEligible, false);
});
