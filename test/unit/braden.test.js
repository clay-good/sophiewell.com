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
