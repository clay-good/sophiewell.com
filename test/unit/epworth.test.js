import { test } from 'node:test';
import assert from 'node:assert/strict';
import { epworth } from '../../lib/scoring-v4.js';

const zero = {
  reading: 0, tv: 0, publicPlace: 0, carPassenger: 0,
  lyingDown: 0, sittingTalking: 0, afterLunch: 0, carTraffic: 0,
};

test('epworth 0 of 24 -> normal band (Johns 1991)', () => {
  const r = epworth(zero);
  assert.equal(r.score, 0);
  assert.match(r.band, /normal daytime sleepiness/i);
});

test('epworth 6 of 24 (tile example) -> normal band', () => {
  const r = epworth({ ...zero, reading: 1, tv: 1, carPassenger: 1, lyingDown: 2, afterLunch: 1 });
  assert.equal(r.score, 6);
  assert.match(r.band, /normal/i);
});

test('epworth 10 of 24 -> still normal band (upper bound)', () => {
  const r = epworth({ reading: 1, tv: 2, publicPlace: 1, carPassenger: 1, lyingDown: 2, sittingTalking: 1, afterLunch: 1, carTraffic: 1 });
  assert.equal(r.score, 10);
  assert.match(r.band, /normal/i);
});

test('epworth 11 of 24 -> mild band (Johns 1991 cutoff 11-14)', () => {
  const r = epworth({ reading: 2, tv: 2, publicPlace: 1, carPassenger: 1, lyingDown: 2, sittingTalking: 1, afterLunch: 1, carTraffic: 1 });
  assert.equal(r.score, 11);
  assert.match(r.band, /mild/i);
});

test('epworth 15 of 24 -> moderate band (Johns 1991 cutoff 15-17)', () => {
  const r = epworth({ reading: 2, tv: 2, publicPlace: 2, carPassenger: 2, lyingDown: 3, sittingTalking: 1, afterLunch: 2, carTraffic: 1 });
  assert.equal(r.score, 15);
  assert.match(r.band, /moderate/i);
});

test('epworth 24 of 24 -> severe band (Johns 1991 cutoff 18-24)', () => {
  const r = epworth({ reading: 3, tv: 3, publicPlace: 3, carPassenger: 3, lyingDown: 3, sittingTalking: 3, afterLunch: 3, carTraffic: 3 });
  assert.equal(r.score, 24);
  assert.match(r.band, /severe/i);
});

test('epworth clamps per-item out-of-range to [0, 3]', () => {
  const r = epworth({ reading: 99, tv: -5, publicPlace: 0, carPassenger: 0, lyingDown: 0, sittingTalking: 0, afterLunch: 0, carTraffic: 0 });
  assert.equal(r.parts.reading, 3);
  assert.equal(r.parts.tv, 0);
});

// spec-v1086: an unrated situation is not "would never doze".
//
// Eight sliders resting at 0 read "Epworth 0 of 24: normal daytime sleepiness"
// for somebody who had answered nothing, and epworthClamp reads anything
// non-finite as 0. The total is a floor and the reassuring band is the low one,
// so a partial score can only understate the sleepiness.
test('spec-v1086: an unrated situation is asked for; a rated 0 still scores', () => {
  const all0 = {
    reading: 0, tv: 0, publicPlace: 0, carPassenger: 0,
    lyingDown: 0, sittingTalking: 0, afterLunch: 0, carTraffic: 0,
  };
  const rated = epworth(all0);
  assert.equal(rated.valid, true);
  assert.equal(rated.score, 0);
  assert.match(rated.band, /normal daytime sleepiness/, 'someone who never dozes is a real answer');

  const none = epworth({});
  assert.equal(none.valid, false);
  assert.equal(none.score, null);
  assert.equal(none.itemsScored, 0);
  assert.doesNotMatch(none.text, /normal daytime sleepiness/);

  const { carTraffic, ...seven } = all0;
  void carTraffic;
  const partial = epworth(seven);
  assert.equal(partial.valid, false);
  assert.equal(partial.itemsScored, 7);
  assert.match(partial.text, /in a car stopped in traffic/);
});
