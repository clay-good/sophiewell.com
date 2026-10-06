// spec-v1549 tool 1: F-75 volume per feed. The source's worked examples, +++ edema, the lower-row rule, the card
// range, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { f75FeedVolume as f } from '../../lib/f75-feed-volume-v1549.js';

test('the source examples: 7.0 kg 2-hourly 75 mL; 5.0 kg +++ edema 3-hourly 65 mL; 2.6 kg 4-hourly 55 mL', () => {
  assert.equal(f({ weight: '7.0', interval: '2', edema: 'no' }).bandLabel, '75 mL per feed');
  assert.equal(f({ weight: '5.0', interval: '3', edema: 'yes' }).bandLabel, '65 mL per feed');
  assert.equal(f({ weight: '2.6', interval: '4', edema: 'no' }).bandLabel, '55 mL per feed');
});

test('+++ edema changes 130 to 100 mL/kg/day, with the 80% minimum', () => {
  const r = f({ weight: '6.0', interval: '4', edema: 'yes' });
  assert.equal(r.bandLabel, '100 mL per feed');
  assert.match(r.notes.join(' '), /Daily total 600 mL \(100 mL\/kg\/day\); the minimum acceptable intake is 80%, 480 mL/);
  assert.match(f({ weight: '6.0', interval: '4', edema: 'no' }).notes.join(' '), /Daily total 780 mL \(130 mL\/kg\/day\)/);
});

test('a weight between card rows uses the lower row and shows the exact figure', () => {
  const r = f({ weight: '2.1', interval: '2', edema: 'no' });
  assert.equal(r.bandLabel, '20 mL per feed');
  assert.match(r.band, /the card's 2\.0 kg row, the lower row for 2\.1 kg/);
  assert.match(r.notes[0], /From the exact weight it would be 25 mL/);
});

test('outside the card the formula still answers, and says so', () => {
  assert.match(f({ weight: '12', interval: '4', edema: 'no' }).notes[0], /outside the card's 2\.0-10\.0 kg range/);
  assert.match(f({ weight: '2.5', interval: '4', edema: 'yes' }).notes[0], /outside the card's 3\.0-12\.0 kg range for severe edema/);
});

test('refusals', () => {
  assert.equal(f({ interval: '2', edema: 'no' }).valid, false);
  assert.equal(f({ weight: '5', edema: 'no' }).valid, false);
  assert.equal(f({ weight: '5', interval: '2' }).valid, false);
});
