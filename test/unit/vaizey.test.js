// spec-v512: Vaizey (St Marks) fecal incontinence score.
// Worked-example tests: the two anchors, the weights on each added row, a mixed case, and the missing /
// out-of-range / unreadable-answer guards. Items and weights transcribed from Vaizey and colleagues 1999
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vaizey, FREQUENCY_ROWS, FREQUENCY_SCALE, YES_NO_ROWS } from '../../lib/vaizey-v512.js';

function score({ solid = 0, liquid = 0, gas = 0, lifestyle = 0, pad = 'no', meds = 'no', defer = 'no' } = {}) {
  return vaizey({ solid, liquid, gas, lifestyle, pad, meds, defer });
}

test('the score has four frequency rows on a 0-4 scale and three weighted rows', () => {
  assert.equal(FREQUENCY_ROWS.length, 4);
  assert.equal(FREQUENCY_SCALE.length, 5);
  assert.deepEqual(YES_NO_ROWS.map((r) => r.points), [2, 2, 4]);
});

test('a mixed case scores 15 (the META example)', () => {
  const r = score({ solid: 1, liquid: 3, gas: 4, lifestyle: 1, pad: 'yes', meds: 'no', defer: 'yes' });
  assert.equal(r.valid, true);
  assert.equal(r.frequencyTotal, 9);
  assert.equal(r.addedTotal, 6);
  assert.equal(r.total, 15);
  assert.match(r.band, /Vaizey \(St Marks\) score 15 of 24/);
});

test('perfect continence is 0 and total incontinence is 24', () => {
  const lo = score();
  assert.equal(lo.total, 0);

  const hi = score({ solid: 4, liquid: 4, gas: 4, lifestyle: 4, pad: 'yes', meds: 'yes', defer: 'yes' });
  assert.equal(hi.frequencyTotal, 16);
  assert.equal(hi.addedTotal, 8);
  assert.equal(hi.total, 24);
});

test('each added row carries its published weight', () => {
  assert.equal(score({ pad: 'yes' }).total, 2);
  assert.equal(score({ meds: 'yes' }).total, 2);
  assert.equal(score({ defer: 'yes' }).total, 4);
});

test('each frequency row contributes its face value', () => {
  assert.equal(score({ solid: 3 }).total, 3);
  assert.equal(score({ gas: 2, lifestyle: 1 }).total, 3);
});

test('strings, booleans, and 0/1 are accepted', () => {
  assert.equal(score({ solid: '2', pad: true }).total, 4);
  assert.equal(score({ liquid: '4', defer: 1 }).total, 8);
  assert.equal(score({ meds: '0' }).total, 0);
});

test('a missing row is invalid', () => {
  assert.equal(vaizey({}).valid, false);
  assert.equal(vaizey({ solid: 0, liquid: 0, gas: 0, lifestyle: 0, pad: 'no', meds: 'no' }).valid, false);
  assert.equal(vaizey({ liquid: 0, gas: 0, lifestyle: 0, pad: 'no', meds: 'no', defer: 'no' }).valid, false);
});

test('out-of-range, non-integer, or unreadable answers are invalid', () => {
  assert.equal(score({ solid: 5 }).valid, false);
  assert.equal(score({ solid: -1 }).valid, false);
  assert.equal(score({ solid: 2.5 }).valid, false);
  assert.equal(score({ gas: 'x' }).valid, false);
  assert.equal(score({ pad: 'maybe' }).valid, false);
});
