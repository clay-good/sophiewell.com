// spec-v1550 tool 2: vitamin A dose for a child by reason. Each reason's age bands at 5.9/6 and 11.9/12
// months (and 12 vs 12.1 for eye signs), the holds, capsules, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vitaminADoseChild as v } from '../../lib/vitamin-a-dose-child-v1550.js';

const R = { reason: 'routine', recent: 'no', rutf: 'no' };

test('routine: none under 6 months, 100,000 IU at 6-11, 200,000 IU from 12 months', () => {
  assert.equal(v({ ...R, age: '5.9' }).bandLabel, 'Not under 6 months');
  assert.equal(v({ ...R, age: '6' }).bandLabel, '100,000 IU');
  assert.equal(v({ ...R, age: '11.9' }).bandLabel, '100,000 IU');
  const big = v({ ...R, age: '12' });
  assert.equal(big.bandLabel, '200,000 IU');
  assert.match(big.notes.join(' '), /every 4 to 6 months/);
  assert.match(big.notes.join(' '), /one 200,000 IU capsule, two 100,000 IU capsules or four 50,000 IU capsules/);
});

test('holds: a dose in the past month, or on RUTF', () => {
  assert.equal(v({ ...R, age: '24', recent: 'yes' }).bandLabel, 'Hold');
  assert.match(v({ ...R, age: '24', rutf: 'yes' }).band, /on RUTF/);
  assert.equal(v({ ...R, reason: 'diarrhea', age: '24', recent: 'yes' }).bandLabel, 'Hold');
  assert.match(v({ reason: 'routine', age: '24', rutf: 'no' }).message, /past month/);
});

test('measles: 50,000 / 100,000 / 200,000 IU once a day for 2 days, regardless of a routine dose', () => {
  assert.equal(v({ reason: 'measles', age: '5.9' }).bandLabel, '50,000 IU x 2 days');
  assert.equal(v({ reason: 'measles', age: '6' }).bandLabel, '100,000 IU x 2 days');
  assert.equal(v({ reason: 'measles', age: '12' }).bandLabel, '200,000 IU x 2 days');
  const n = v({ reason: 'measles', age: '30' }).notes.join(' ');
  assert.match(n, /third dose 2 to 4 weeks after the second/);
  assert.match(n, /IMCI chart's outpatient rule withholds/);
});

test('eye signs: day 1, day 2 and 2 weeks later; 12 months is still 100,000 IU (SAM99 "over 12 months")', () => {
  assert.equal(v({ reason: 'eyes', age: '5' }).bandLabel, '50,000 IU x 3 doses');
  assert.equal(v({ reason: 'eyes', age: '12' }).bandLabel, '100,000 IU x 3 doses');
  assert.equal(v({ reason: 'eyes', age: '12.1' }).bandLabel, '200,000 IU x 3 doses');
  assert.match(v({ reason: 'eyes', age: '30' }).band, /on day 1, day 2, and again at least 2 weeks later/);
});

test('refusals', () => {
  assert.equal(v({ age: '12' }).valid, false);
  assert.equal(v({ reason: 'measles' }).valid, false);
  assert.match(v({ reason: 'measles', age: '61' }).message, /up to 5 years/);
  assert.equal(v().valid, false);
});
