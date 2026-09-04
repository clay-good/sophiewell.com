// spec-v1062: the Subjective Opiate Withdrawal Scale (Handelsman 1987).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sowsSubjective, SOWS_SUBJECTIVE_ITEMS } from '../../lib/sows-subjective-v1062.js';
import { sows } from '../../lib/sows-v1061.js';

const rate = (v) => Object.fromEntries(SOWS_SUBJECTIVE_ITEMS.map((i) => [i.key, v]));

test('sixteen items, 0-4 each, 0 to 64', () => {
  assert.equal(SOWS_SUBJECTIVE_ITEMS.length, 16);
  assert.equal(sowsSubjective(rate(0)).score, 0);
  assert.equal(sowsSubjective(rate(4)).score, 64);
});

test('the total is the sum of the ratings', () => {
  const input = rate(0);
  input.anxious = 4;
  input.craving = 3;
  input.nauseous = 1;
  assert.equal(sowsSubjective(input).score, 8);
});

test('an unrated symptom is not a rating of none', () => {
  const input = rate(2);
  delete input.craving;
  const r = sowsSubjective(input);
  assert.equal(r.score, null);
  assert.equal(r.incomplete, true);
  assert.equal(r.partial, 30);
  assert.match(r.band, /at least 30 from 15 of 16 symptoms/);
  assert.match(r.band, /Rate craving to use now/);
});

// The two scales share an acronym and nothing else. This is the assertion that
// would fail if someone ever "unified" them.
test('it is a different instrument from the ten-item Short scale', () => {
  assert.equal(SOWS_SUBJECTIVE_ITEMS.length, 16);
  const short = sows(Object.fromEntries(
    ['feelingSick', 'stomachCramps', 'muscleSpasms', 'feelingCold', 'heartPounding',
      'muscularTension', 'achesAndPains', 'yawning', 'runnyEyes', 'insomnia'].map((k) => [k, 3]),
  ));
  assert.equal(short.score, 30);            // ten items x 3
  assert.equal(sowsSubjective(rate(3)).score, 48); // sixteen items x 3
  assert.match(sowsSubjective(rate(1)).note, /SHORT Opiate Withdrawal Scale/);
});

// Bands exist in the literature for a FIFTEEN-item modified version out of 60.
// Borrowing them for this total would be a threshold from another instrument.
test('it states no severity band, and says which bands it is refusing', () => {
  const band = sowsSubjective(rate(2)).band;
  assert.match(band, /no severity bands/);
  assert.match(band, /fifteen-item modified version/);
  assert.doesNotMatch(band, /:\s*(mild|moderate|severe)\b/i);
});

test('a rating outside 0-4 is refused, not clamped', () => {
  assert.throws(() => sowsSubjective({ ...rate(0), anxious: 5 }), /0-4/);
  assert.throws(() => sowsSubjective({ ...rate(0), anxious: 2.5 }), /0-4/);
});
