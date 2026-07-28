// spec-v542: the TWSTRS severity subscale.
// Worked-example tests: the sum-to-35 arithmetic that validates the item ranges, the DOUBLED duration item,
// the mutually exclusive sagittal deviation occupying ONE slot, the explicit scoping to one subscale, and
// the guards. Items and ranges transcribed from Consky and Lang 1994 / Comella 1997 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { twstrsSeverity, TWSTRS_ITEMS, TWSTRS_SEVERITY_MAX } from '../../lib/twstrs-severity-v542.js';

function fill(value, over = {}) {
  const args = {};
  for (const item of TWSTRS_ITEMS) args[item.key] = String(Math.min(value, item.max));
  return twstrsSeverity({ ...args, ...over });
}
function zero(over = {}) {
  const args = {};
  for (const item of TWSTRS_ITEMS) args[item.key] = '0';
  return twstrsSeverity({ ...args, ...over });
}

test('ten items, and the ranges sum to exactly 35', () => {
  assert.equal(TWSTRS_ITEMS.length, 10);
  assert.equal(TWSTRS_SEVERITY_MAX, 35);
  // 12 (excursion) + 10 (duration doubled) + 2 + 3 + 4 + 4
  const excursionMax = TWSTRS_ITEMS.filter((i) => i.group === 'excursion').reduce((a, i) => a + i.max, 0);
  assert.equal(excursionMax, 12);
});

test('the maximum is reachable and equals 35', () => {
  const max = fill(9);
  assert.equal(max.total, 35);
  assert.equal(max.max, 35);
  assert.equal(max.excursionSubtotal, 12);
});

test('DURATION IS DOUBLED, and the raw rating stays visible', () => {
  const duration = TWSTRS_ITEMS.find((i) => i.key === 'duration');
  assert.equal(duration.weight, 2);
  assert.equal(duration.max, 5);
  const r = zero({ duration: '5' });
  assert.equal(r.durationRaw, 5);
  assert.equal(r.durationPoints, 10);
  assert.equal(r.total, 10);
  assert.match(r.band, /rated 5 of 5 and doubled to 10 of 10/);
  // Summing it raw would have given 30 rather than 35 at maximum.
  assert.notEqual(TWSTRS_ITEMS.reduce((a, i) => a + i.max, 0), 35);
  assert.equal(TWSTRS_ITEMS.reduce((a, i) => a + i.max, 0), 30);
});

test('duration is the ONLY weighted item', () => {
  const weighted = TWSTRS_ITEMS.filter((i) => i.weight && i.weight !== 1);
  assert.equal(weighted.length, 1);
  assert.equal(weighted[0].key, 'duration');
});

test('anterocollis and retrocollis share ONE slot, so the subscale cannot reach 38', () => {
  const sag = TWSTRS_ITEMS.find((i) => i.key === 'sagittalDeviation');
  assert.equal(sag.max, 3);
  assert.match(sag.text, /mutually exclusive/);
  assert.match(sag.text, /cannot be flexed and extended at once/);
  // There is no second sagittal item that could be scored alongside it.
  assert.equal(TWSTRS_ITEMS.filter((i) => /anterocollis|retrocollis/i.test(i.key)).length, 0);
});

test('each item is capped at its own range, not a shared one', () => {
  assert.equal(zero({ rotation: '4' }).total, 4);
  assert.equal(zero({ rotation: '5' }).valid, false);       // rotation stops at 4
  assert.equal(zero({ laterocollis: '4' }).valid, false);   // laterocollis stops at 3
  assert.equal(zero({ lateralShift: '2' }).valid, false);   // shift is 0 or 1
  assert.equal(zero({ sensoryTricks: '3' }).valid, false);  // tricks stop at 2
});

test('a worked example (the META example)', () => {
  const r = zero({
    rotation: '3', laterocollis: '1', sagittalDeviation: '0', lateralShift: '1', sagittalShift: '0',
    duration: '4', sensoryTricks: '1', shoulderElevation: '2', rangeOfMotion: '2', time: '2',
  });
  assert.equal(r.excursionSubtotal, 5);
  assert.equal(r.durationPoints, 8);
  assert.equal(r.total, 5 + 8 + 1 + 2 + 2 + 2);
  assert.equal(r.total, 20);
  assert.match(r.bandLabel, /TWSTRS severity 20 of 35/);
});

test('every result states this is ONE subscale of three', () => {
  for (const r of [zero(), fill(9)]) {
    assert.match(r.band, /severity subscale ALONE/);
    assert.match(r.band, /disability subscale out of 30 and a pain subscale out of 20/);
  }
  assert.match(zero().note, /not implemented here rather than shipping a total/);
});

test('the copy names the urgent mimics and refuses the treatment reading', () => {
  const n = zero().note;
  assert.match(n, /does not diagnose cervical dystonia/);
  assert.match(n, /posterior fossa pathology/);
  assert.match(n, /acute dystonic reaction/);
  assert.match(n, /not an indication for botulinum toxin/);
  assert.match(n, /deep brain stimulation/);
});

test('the guards', () => {
  assert.equal(twstrsSeverity({}).valid, false);
  const partial = twstrsSeverity({ rotation: '1' });
  assert.equal(partial.valid, false);
  assert.match(partial.message, /laterocollis/);
  assert.equal(zero({ duration: '2.5' }).valid, false);
  assert.equal(zero({ duration: '-1' }).valid, false);
});
