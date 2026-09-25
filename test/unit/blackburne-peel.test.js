// spec-v1469: Blackburne-Peel index = A / B, read against two published cutoff sets.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blackburnePeel as bp } from '../../lib/blackburne-peel-v1469.js';

const r = (a, b) => bp({ distanceA: a, lengthB: b });

test('the index is A divided by B, rounded to two decimals', () => {
  assert.equal(r(24, 30).index, 0.8);
  assert.equal(r(21, 30).index, 0.7);
  assert.equal(r(20, 30).index, 0.67);
  assert.equal(r('24', '30').bandLabel, 'Index 0.80');
});

// Boundary cases use B = 50 mm so A / B lands exactly on each cutoff.
test('original range is inclusive: 0.54 and 1.06 are within it', () => {
  assert.equal(r(27, 50).original, 'normal');
  assert.equal(r(26.5, 50).original, 'low');
  assert.equal(r(53, 50).original, 'normal');
  assert.equal(r(53.5, 50).original, 'high');
  // floating-point noise does not push 16.2 / 30 below 0.54
  assert.equal(r(16.2, 30).original, 'normal');
});

test('categories: below 0.80 low, 0.80 to 1.00 normal inclusive, above 1.00 high', () => {
  assert.equal(r(39.5, 50).category, 'low');
  assert.equal(r(40, 50).category, 'normal');
  assert.equal(r(50, 50).category, 'normal');
  assert.equal(r(50.5, 50).category, 'high');
});

test('classified on the unrounded value, and never printed as a cutoff it misses', () => {
  const x = r(39.95, 50);
  assert.equal(x.category, 'low');
  assert.equal(x.bandLabel, 'Index 0.799');
});

test('when the conventions agree it is said once', () => {
  assert.equal(r(24, 30).band, 'Blackburne-Peel index 0.80 (A 24 mm / B 30 mm): normal patellar height by both the original range (0.54 to 1.06) and the commonly used categories (0.80 to 1.00).');
  assert.equal(r(24, 30).abnormal, false);
  assert.match(r(15, 30).band, /low by both/);
  assert.match(r(33, 30).band, /high by both/);
});

test('when they disagree both readings are stated, and it counts as abnormal', () => {
  const low = r(21, 30);
  assert.equal(low.band, 'Blackburne-Peel index 0.70 (A 21 mm / B 30 mm): within the 0.54 to 1.06 range of the original normal knees, but below 0.80, the low cutoff of the commonly used categories.');
  assert.equal(low.agree, false);
  assert.equal(low.abnormal, true);
  assert.match(r(51.5, 50).band, /within the 0\.54 to 1\.06 range .*but above 1\.00, the high cutoff/);
  assert.equal(r(51.5, 50).abnormal, true);
});

test('blank inputs ask; impossible values are refused', () => {
  assert.match(r('', 30).message, /^Enter distance A/);
  assert.match(r(24, '').message, /^Enter length B/);
  assert.match(bp().message, /^Enter /);
  assert.equal(r(24, 0).valid, false);
  assert.equal(r(24, 9).valid, false);
  assert.equal(r(24, 81).valid, false);
  assert.equal(r(81, 30).valid, false);
  assert.equal(r(-1, 30).valid, false);
  assert.match(r(24, 0).message, /Check the value entered/);
});
