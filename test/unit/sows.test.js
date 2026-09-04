// spec-v1061: the Short Opiate Withdrawal Scale.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sows, SOWS_ITEMS } from '../../lib/sows-v1061.js';

const rate = (v) => Object.fromEntries(SOWS_ITEMS.map((i) => [i.key, v]));

test('ten items, none to severe, 0 to 30', () => {
  assert.equal(SOWS_ITEMS.length, 10);
  assert.equal(sows(rate(0)).score, 0);
  assert.equal(sows(rate(3)).score, 30);
});

test('the total is the sum of the ratings', () => {
  const input = rate(0);
  input.feelingSick = 3;
  input.yawning = 2;
  input.runnyEyes = 1;
  assert.equal(sows(input).score, 6);
});

test('a fully rated calm patient scores 0, and says so', () => {
  const r = sows(rate(0));
  assert.equal(r.score, 0);
  assert.equal(r.incomplete, false);
  assert.match(r.band, /SOWS 0 of 30/);
});

// The rule this family has carried since spec-v1028: an unrated item is not a
// symptom the patient denied.
test('an unrated symptom is not a rating of none', () => {
  const input = rate(1);
  delete input.yawning;
  const r = sows(input);
  assert.equal(r.score, null);
  assert.equal(r.incomplete, true);
  assert.equal(r.partial, 9);
  assert.equal(r.rated, 9);
  assert.match(r.band, /at least 9 from 9 of 10 symptoms/);
  assert.match(r.band, /Rate yawning/);
});

test('an empty form asks for all ten', () => {
  const r = sows({});
  assert.equal(r.score, null);
  assert.equal(r.rated, 0);
  assert.match(r.band, /at least 0 from 0 of 10 symptoms/);
});

// The scale has no published cut-offs. Its sibling COWS has four, and inventing
// the same shape here would be stating a threshold no source gives.
test('it states no severity band, and says that it does not', () => {
  const band = sows(rate(2)).band;
  assert.match(band, /no severity bands/);
  // What is forbidden is a CLASSIFICATION -- "SOWS 20: moderate withdrawal", the
  // shape COWS legitimately has and this scale does not publish. The comparative
  // "higher is a more severe withdrawal" is the sources' own wording and stays.
  assert.doesNotMatch(band, /:\s*(mild|moderate|moderately severe|severe)\b/i);
  assert.doesNotMatch(band, /\b(indicates|suggests)\s+(mild|moderate|severe)\b/i);
});

test('it names the meaningful change instead', () => {
  assert.match(sows(rate(1)).band, /change of 2 to 4 points/);
});

test('a rating outside 0-3 is refused, not clamped', () => {
  assert.throws(() => sows({ ...rate(0), feelingSick: 4 }), /0-3/);
  assert.throws(() => sows({ ...rate(0), feelingSick: 1.5 }), /0-3/);
});
