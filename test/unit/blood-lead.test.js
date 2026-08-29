import test from 'node:test';
import assert from 'node:assert/strict';
import { bloodLead as bl, REFERENCE_VALUE } from '../../lib/lead-v863.js';

test('lead: the reference value is 3.5 and the boundary is inclusive', () => {
  assert.equal(REFERENCE_VALUE, 3.5);
  assert.equal(bl({ level: 3.4 }).atOrAbove, false);
  assert.equal(bl({ level: 3.5 }).atOrAbove, true);
  assert.equal(bl({ level: 3.5 }).abnormal, true);
  assert.equal(bl({ level: 3.4 }).abnormal, false);
});

test('lead: the band the old line of 5 hides is named', () => {
  // The reason the tile exists.
  const r = bl({ level: 4.2 });
  assert.equal(r.atOrAbove, true);
  assert.match(r.loweredNote, /below the old line of 5/);
  assert.match(r.loweredNote, /would have looked normal/);
  // Outside that band there is nothing to say about the old line.
  assert.equal(bl({ level: 5 }).loweredNote, null);
  assert.equal(bl({ level: 3.4 }).loweredNote, null);
});

test('lead: the reference value is never presented as safe or as a treatment line', () => {
  for (const level of [0, 2, 3.5, 12, 50, 90]) {
    assert.match(bl({ level }).notSafeNote, /not a safe level/);
    assert.match(bl({ level }).notSafeNote, /97.5th percentile/);
  }
  assert.match(bl({ level: 12 }).actionNote, /find and remove the source/);
  assert.match(bl({ level: 12 }).actionNote, /not a threshold for a drug/);
});

test('lead: the chelation and emergency thresholds', () => {
  assert.equal(bl({ level: 44.9 }).chelationRange, false);
  assert.equal(bl({ level: 45 }).chelationRange, true);
  assert.equal(bl({ level: 69.9 }).emergency, false);
  assert.equal(bl({ level: 70 }).emergency, true);
  assert.match(bl({ level: 70 }).actionNote, /medical emergency/);
  assert.match(bl({ level: 50 }).actionNote, /made with a specialist/);
});

test('lead: an elevated capillary result is sent for venous confirmation', () => {
  assert.match(bl({ level: 12, sample: 'capillary' }).capillaryNote, /confirmed on a venous sample/);
  // A venous result needs no confirmation, and a normal one needs nothing.
  assert.equal(bl({ level: 12, sample: 'venous' }).capillaryNote, null);
  assert.equal(bl({ level: 2, sample: 'capillary' }).capillaryNote, null);
  // An unstated sample type on an elevated result still gets the warning.
  assert.match(bl({ level: 12 }).capillaryNote, /sample type was not entered/);
});

test('lead: a result below the value is not read as no exposure', () => {
  assert.match(bl({ level: 1 }).actionNote, /does not mean there is no exposure/);
});

test('lead: the value has moved before, and the tool says so', () => {
  assert.match(bl({ level: 1 }).historyNote, /from 10 to 5 and then to 3.5/);
});

test('lead: a missing or implausible level is refused', () => {
  assert.equal(bl({}).valid, false);
  assert.match(bl({}).message, /micrograms per deciliter/);
  assert.equal(bl({ level: '' }).valid, false);
  assert.equal(bl({ level: -1 }).valid, false);
  assert.equal(bl({ level: 900 }).valid, false);
});

test('lead: string input from the DOM behaves like a number', () => {
  assert.equal(bl({ level: '4.2', sample: 'capillary' }).atOrAbove, true);
  assert.equal(bl({ level: '3.4' }).atOrAbove, false);
});
