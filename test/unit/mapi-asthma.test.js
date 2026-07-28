// spec-v573: the Modified Asthma Predictive Index.
//
// The load-bearing tests are that criteria cannot substitute for the frequency gate, and that allergic
// rhinitis - removed from the original API - is not a criterion here.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mapiAsthma, MAPI_MAJOR_CRITERIA, MAPI_MINOR_CRITERIA,
  WHEEZE_EPISODE_THRESHOLD, EOSINOPHIL_THRESHOLD, MAJORS_REQUIRED, MINORS_REQUIRED,
} from '../../lib/mapi-asthma-v573.js';

const ALL = [...MAPI_MAJOR_CRITERIA, ...MAPI_MINOR_CRITERIA];
const base = (over = {}) => {
  const o = { wheezeEpisodes: '4' };
  for (const c of ALL) o[c.key] = 'no';
  return { ...o, ...over };
};
const run = (over = {}) => mapiAsthma(base(over));

test('the thresholds are the published ones', () => {
  assert.equal(WHEEZE_EPISODE_THRESHOLD, 4);
  assert.equal(EOSINOPHIL_THRESHOLD, 4);
  assert.equal(MAJORS_REQUIRED, 1);
  assert.equal(MINORS_REQUIRED, 2);
});

test('there are three major and three minor criteria', () => {
  assert.equal(MAPI_MAJOR_CRITERIA.length, 3);
  assert.equal(MAPI_MINOR_CRITERIA.length, 3);
});

// THE two-gate rule.
test('one major criterion with enough episodes is positive', () => {
  const r = run({ parentalAsthma: 'yes' });
  assert.equal(r.positive, true);
  assert.equal(r.majorCount, 1);
});

test('two minor criteria with enough episodes is positive', () => {
  const r = run({ wheezeApartFromColds: 'yes', foodSensitization: 'yes' });
  assert.equal(r.positive, true);
  assert.equal(r.minorCount, 2);
});

test('one minor criterion alone is not enough', () => {
  const r = run({ wheezeApartFromColds: 'yes' });
  assert.equal(r.positive, false);
  assert.equal(r.criteriaGate, false);
});

test('criteria can NEVER substitute for the frequency gate', () => {
  const everything = {};
  for (const c of ALL) everything[c.key] = 'yes';
  const r = mapiAsthma({ ...everything, wheezeEpisodes: '3' });
  assert.equal(r.frequencyGate, false);
  assert.equal(r.criteriaGate, true);
  assert.equal(r.positive, false, 'every criterion present still fails below the episode threshold');
  assert.match(r.bandText, /frequency gate is not met/);
});

test('the frequency gate is met at exactly four episodes', () => {
  assert.equal(run({ wheezeEpisodes: '3', parentalAsthma: 'yes' }).positive, false);
  assert.equal(run({ wheezeEpisodes: '4', parentalAsthma: 'yes' }).positive, true);
});

test('the result states that this is a two-gate boolean with no total', () => {
  assert.match(run().bandText, /not a score. It is a two-gate boolean/);
});

// THE removed criterion.
test('allergic rhinitis is not a criterion in the mAPI', () => {
  const keys = ALL.map((c) => c.key).join(' ');
  assert.ok(!/rhinitis/i.test(keys));
  const texts = ALL.map((c) => c.text).join(' ');
  assert.ok(!/rhinitis/i.test(texts), 'allergic rhinitis was REMOVED from the original API');
});

test('the two criteria added in the mAPI are flagged as such', () => {
  const added = ALL.filter((c) => c.addedInMapi).map((c) => c.key);
  assert.deepEqual(added, ['aeroallergenSensitization', 'foodSensitization']);
});

test('the result explains that the modification was a move, not an addition', () => {
  const r = run();
  assert.match(r.bandText, /MOVE, not an addition/);
  assert.match(r.bandText, /allergic rhinitis was REMOVED/);
});

// The different denominators.
test('the result warns that the API rating scale is not the mAPI episode count', () => {
  assert.match(run().bandText, /1-to-5 frequency RATING SCALE/);
  assert.match(run().bandText, /not interchangeable/);
});

// The eosinophil boundary.
test('an eosinophil percentage decides the criterion, and 4.0 percent meets it', () => {
  const r = run({ eosinophilPercent: '4', wheezeApartFromColds: 'yes' });
  assert.equal(r.minorCount, 2, 'exactly 4.0 percent satisfies the eosinophil criterion');
  assert.equal(r.positive, true);
  assert.equal(r.onEosBoundary, true);
  assert.match(r.bandText, /OR MORE, so exactly 4\.0 percent MEETS it/);
});

test('an eosinophil percentage below the threshold does not satisfy the criterion', () => {
  const r = run({ eosinophilPercent: '3.9', wheezeApartFromColds: 'yes' });
  assert.equal(r.minorCount, 1);
  assert.equal(r.positive, false);
});

test('the boundary disclosure appears only at exactly 4 percent', () => {
  assert.doesNotMatch(run({ eosinophilPercent: '6' }).bandText, /so exactly 4\.0 percent MEETS it/);
});

// Input handling.
test('the episode count is required, and the message names the denominator difference', () => {
  const o = base();
  delete o.wheezeEpisodes;
  const r = mapiAsthma(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /1-to-5 rating scale/);
});

test('a missing criterion is refused and named', () => {
  const o = base();
  delete o.atopicDermatitis;
  const r = mapiAsthma(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /atopicDermatitis/);
});

test('the scope note states the horizon and refuses to indicate a controller', () => {
  const r = run({ parentalAsthma: 'yes' });
  assert.match(r.note, /ages six, eight and eleven/);
  assert.match(r.note, /not an indication to start inhaled corticosteroids/);
  assert.match(r.note, /foreign body/);
});
