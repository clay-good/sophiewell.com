// spec-v358: Ramsay Sedation Scale (levels 1-6). Worked-example tests: each level and its description,
// the awake/asleep state, the outside-target flag on 1 and 5-6, string/number input, and the invalid-
// level guard. Levels transcribed from Ramsay et al. BMJ 1974, cross-verified against ICU/anesthesia
// references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ramsaySedation } from '../../lib/ramsay-sedation-v358.js';

test('level 2: cooperative, awake, not flagged (the META example)', () => {
  const r = ramsaySedation({ level: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.level, 2);
  assert.equal(r.state, 'awake');
  assert.equal(r.outsideTarget, false);
  assert.match(r.band, /cooperative, oriented, and tranquil/);
});

test('levels 2-4 are the cooperative-to-lightly-sedated range (not flagged)', () => {
  for (const l of [2, 3, 4]) {
    assert.equal(ramsaySedation({ level: l }).outsideTarget, false, String(l));
  }
  assert.equal(ramsaySedation({ level: 3 }).state, 'awake');
  assert.equal(ramsaySedation({ level: 4 }).state, 'asleep');
});

test('level 1 (agitation) and levels 5-6 (deep sedation) are flagged', () => {
  for (const l of [1, 5, 6]) {
    assert.equal(ramsaySedation({ level: l }).outsideTarget, true, String(l));
    assert.equal(ramsaySedation({ level: l }).abnormal, true, String(l));
  }
  assert.match(ramsaySedation({ level: 1 }).band, /anxious, agitated/);
  assert.match(ramsaySedation({ level: 6 }).band, /no response/);
});

test('string and number input both resolve', () => {
  assert.equal(ramsaySedation({ level: 5 }).level, 5);
  assert.equal(ramsaySedation({ level: '5' }).level, 5);
  assert.equal(ramsaySedation({ level: 6 }).state, 'asleep');
});

test('a missing or out-of-range level is invalid', () => {
  assert.equal(ramsaySedation({}).valid, false);
  assert.equal(ramsaySedation({ level: '0' }).valid, false);
  assert.equal(ramsaySedation({ level: 7 }).valid, false);
});
