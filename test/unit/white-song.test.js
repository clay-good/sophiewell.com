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

// spec-v1082: a discharge decision is not made by a form nobody filled in.
//
// The tile rendered seven sliders parked at 2, so an untouched form read
// "White-Song 14 of 14: fast-track eligible" -- a post-anaesthesia DISCHARGE
// routing, for a patient nobody had looked at. Summing only the rated domains is
// the mirror error, and worse here than on a plain monotone score: the rule
// fails a patient on ANY single domain below 1, so a partial can manufacture an
// ineligibility as readily as an eligibility.
test('spec-v1082: an unrated domain is asked for, not scored either way', () => {
  const complete = {
    loc: 2, physicalActivity: 2, hemodynamicStability: 2, respiratoryStability: 2,
    oxygenSaturation: 2, postoperativePain: 0, postoperativeEmesis: 2,
  };
  const full = whiteSong(complete);
  assert.equal(full.valid, true);
  assert.equal(full.score, 12);
  // The branch worth demonstrating: over the numeric cutoff and still not
  // eligible, because one domain is below 1.
  assert.equal(full.fastTrackEligible, false);
  assert.equal(full.anyDomainLt1, true);

  const none = whiteSong({});
  assert.equal(none.valid, false);
  assert.equal(none.score, null, 'a score from nothing is the defect');
  assert.equal(none.fastTrackEligible, null, 'and an eligibility from nothing is the worse one');
  assert.equal(none.unrated.length, 7);
  assert.doesNotMatch(none.band, /fast-track eligible per/);

  const { postoperativeEmesis, ...six } = complete;
  void postoperativeEmesis;
  const partial = whiteSong(six);
  assert.equal(partial.valid, false);
  assert.equal(partial.domainsScored, 6);
  assert.match(partial.band, /postoperative emetic symptoms/);
});
