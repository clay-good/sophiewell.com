// spec-v140 2.4: Clinical Dehydration Scale (Goldman 2008). Four items 0-2,
// total 0-8: 0 none, 1-4 some, 5-8 moderate-severe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clinicalDehydrationScale } from '../../lib/peds-v140.js';

test('worked example -> 5/8, moderate to severe (some -> moderate-severe boundary)', () => {
  const r = clinicalDehydrationScale({ appearance: 1, eyes: 1, mucous: 2, tears: 1 });
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /moderate to severe dehydration/);
});

test('0 -> no dehydration', () => {
  const r = clinicalDehydrationScale({ appearance: 0, eyes: 0, mucous: 0, tears: 0 });
  assert.equal(r.score, 0);
  assert.match(r.band, /no dehydration/);
  assert.equal(r.abnormal, false);
});

test('4 -> some dehydration (upper edge of the some band)', () => {
  const r = clinicalDehydrationScale({ appearance: 1, eyes: 1, mucous: 1, tears: 1 });
  assert.equal(r.score, 4);
  assert.match(r.band, /some dehydration/);
  assert.equal(r.abnormal, false);
});

test('max 8 -> moderate to severe', () => {
  const r = clinicalDehydrationScale({ appearance: 2, eyes: 2, mucous: 2, tears: 2 });
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, true);
});

test('out-of-range items clamp to 0-2', () => {
  assert.equal(clinicalDehydrationScale({ appearance: 9, eyes: 9, mucous: 9, tears: 9 }).score, 8);
  assert.equal(clinicalDehydrationScale({}).score, 0);
});
