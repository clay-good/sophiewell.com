// spec-v521: the Primary Care PTSD Screen for DSM-5 (PC-PTSD-5).
// Worked-example tests: the trauma-exposure gate (a "no" is a FINISHED, VALID, zero result and the five
// items are not required), the 0-5 range, both published cut points and the band between them where they
// disagree, yes/no parsing, and the guards. Items, gate, and cut points transcribed from Prins and
// colleagues 2016 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pcPtsd5, PC_PTSD5_ITEMS } from '../../lib/pc-ptsd5-v521.js';

function screen({ trauma = 'yes', q1 = 'no', q2 = 'no', q3 = 'no', q4 = 'no', q5 = 'no' } = {}) {
  return pcPtsd5({ trauma, q1, q2, q3, q4, q5 });
}

test('five items', () => {
  assert.equal(PC_PTSD5_ITEMS.length, 5);
  for (const item of PC_PTSD5_ITEMS) assert.ok(item.text.length > 0);
});

test('no trauma reported is a finished, valid, zero screen without the five items', () => {
  const r = pcPtsd5({ trauma: 'no' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.gated, true);
  assert.equal(r.meetsSensitive, false);
  assert.match(r.band, /complete with a score of 0/);
});

test('with trauma reported, the five items are required', () => {
  assert.equal(pcPtsd5({ trauma: 'yes' }).valid, false);
  assert.equal(pcPtsd5({ trauma: 'yes', q1: 'yes', q2: 'no', q3: 'no', q4: 'no' }).valid, false);
});

test('four yes answers meet both cut points (the META example)', () => {
  const r = screen({ q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes' });
  assert.equal(r.total, 4);
  assert.equal(r.gated, false);
  assert.equal(r.meetsSensitive, true);
  assert.equal(r.meetsEfficient, true);
  assert.match(r.bandLabel, /PC-PTSD-5 4 of 5/);
});

test('three yes answers sit between the two cut points, and the result says they disagree', () => {
  const r = screen({ q1: 'yes', q2: 'yes', q3: 'yes' });
  assert.equal(r.total, 3);
  assert.equal(r.meetsSensitive, true);
  assert.equal(r.meetsEfficient, false);
  assert.match(r.band, /disagree/);
});

test('two yes answers are below both cut points', () => {
  const r = screen({ q1: 'yes', q2: 'yes' });
  assert.equal(r.total, 2);
  assert.equal(r.meetsSensitive, false);
  assert.equal(r.meetsEfficient, false);
});

test('the ceiling is 5 and the floor is 0', () => {
  const hi = screen({ q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes', q5: 'yes' });
  assert.equal(hi.total, 5);
  assert.equal(hi.meetsEfficient, true);

  const lo = screen();
  assert.equal(lo.total, 0);
  assert.equal(lo.gated, false); // trauma reported, but no symptoms -- not the same as the gated zero
});

test('the result never states a diagnosis', () => {
  const r = screen({ q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes', q5: 'yes' });
  assert.match(r.band, /screen is not a diagnosis/);
  assert.doesNotMatch(r.band, /\bhas PTSD\b|diagnostic of/);
});

test('yes/no is accepted as words, booleans, and 0/1', () => {
  assert.equal(pcPtsd5({ trauma: true, q1: true, q2: 1, q3: 'Y', q4: false, q5: 0 }).total, 3);
  assert.equal(pcPtsd5({ trauma: 'YES', q1: 'No', q2: 'no', q3: 'no', q4: 'no', q5: 'no' }).total, 0);
});

test('a missing or unparseable trauma answer is invalid', () => {
  assert.equal(pcPtsd5({}).valid, false);
  assert.equal(pcPtsd5({ trauma: 'maybe' }).valid, false);
});

test('an unparseable symptom answer is invalid', () => {
  assert.equal(screen({ q3: 'sometimes' }).valid, false);
});
