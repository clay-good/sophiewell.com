import { test } from 'node:test';
import assert from 'node:assert/strict';
import { braden } from '../../lib/scoring-v4.js';

test('braden 23 (tile example: all maxima) -> not at risk', () => {
  const r = braden({ sensory: 4, moisture: 4, activity: 4, mobility: 4, nutrition: 4, friction: 3 });
  assert.equal(r.score, 23);
  assert.equal(r.band, 'not at risk');
});

test('braden 19 (lower edge of not-at-risk) -> not at risk', () => {
  const r = braden({ sensory: 3, moisture: 3, activity: 3, mobility: 3, nutrition: 4, friction: 3 });
  assert.equal(r.score, 19);
  assert.equal(r.band, 'not at risk');
});

test('braden 18 (upper edge of mild) -> mild risk', () => {
  const r = braden({ sensory: 3, moisture: 3, activity: 3, mobility: 3, nutrition: 3, friction: 3 });
  assert.equal(r.score, 18);
  assert.equal(r.band, 'mild risk');
});

test('braden 14 (upper edge of moderate) -> moderate risk', () => {
  const r = braden({ sensory: 2, moisture: 3, activity: 2, mobility: 2, nutrition: 3, friction: 2 });
  assert.equal(r.score, 14);
  assert.equal(r.band, 'moderate risk');
});

test('braden 12 (upper edge of high) -> high risk', () => {
  const r = braden({ sensory: 2, moisture: 2, activity: 2, mobility: 2, nutrition: 2, friction: 2 });
  assert.equal(r.score, 12);
  assert.equal(r.band, 'high risk');
});

test('braden 9 (upper edge of very high) -> very high risk', () => {
  const r = braden({ sensory: 1, moisture: 2, activity: 2, mobility: 1, nutrition: 2, friction: 1 });
  assert.equal(r.score, 9);
  assert.equal(r.band, 'very high risk');
});

test('braden rejects out-of-range inputs', () => {
  assert.throws(() => braden({ sensory: 5, moisture: 4, activity: 4, mobility: 4, nutrition: 4, friction: 3 }));
  assert.throws(() => braden({ sensory: 4, moisture: 4, activity: 4, mobility: 4, nutrition: 4, friction: 4 }));
});

// spec-v1080: the Braden runs the other way, so BOTH readings of a partial are
// unsupportable.
//
// Every subscale scores 1-4 (friction 1-3) and a HIGHER total means LESS risk.
// The tile rendered six sliders parked at their maxima, so a patient nobody had
// assessed read "Braden 23: not at risk" -- the reassuring end, by default. And
// simply summing whichever subscales were rated is no better: it understates the
// total and reads as more risk than the patient has, which spec-v1036 says is
// not the safe direction either.
//
// With no honest partial band available on a scale of this shape, it asks.
test('spec-v1080: an unrated subscale is asked for, not banded', () => {
  const complete = {
    sensory: 2, moisture: 3, activity: 2, mobility: 2, nutrition: 3, friction: 2,
  };
  const full = braden(complete);
  assert.equal(full.valid, true);
  assert.equal(full.score, 14);
  assert.equal(full.band, 'moderate risk');
  assert.deepEqual(full.missing, []);

  // Nothing rated: no score, and every subscale named.
  const none = braden({});
  assert.equal(none.valid, false);
  assert.equal(none.score, null);
  assert.equal(none.band, null, 'a band from nothing is the defect');
  assert.equal(none.missing.length, 6);
  assert.doesNotMatch(none.text, /not at risk/);

  // Five of six: it names the one it is waiting on rather than banding 5/6 of a
  // scale whose partial sum reads alarming.
  const { friction, ...fiveOfSix } = complete;
  void friction;
  const partial = braden(fiveOfSix);
  assert.equal(partial.valid, false);
  assert.equal(partial.itemsScored, 5);
  assert.deepEqual(partial.missing, ['friction and shear']);
  assert.match(partial.text, /friction and shear/);
});
