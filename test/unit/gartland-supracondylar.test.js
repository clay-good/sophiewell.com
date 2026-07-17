// spec-v377: Gartland classification of a pediatric extension-type supracondylar humerus fracture
// (types I-III + modified IV). Worked-example tests: each type and its displacement/hinge description,
// the displaced flag on types II-IV, roman + numeric + IIA/IIB + case-insensitive input, and the
// invalid-type guard. Types transcribed from Gartland 1959 (+ Leitch 2006 type IV), cross-verified
// against orthopedic references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gartlandSupracondylar } from '../../lib/gartland-supracondylar-v377.js';

test('type III: completely displaced, no cortical contact, flagged (the META example)', () => {
  const r = gartlandSupracondylar({ type: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'III');
  assert.equal(r.displaced, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /completely displaced/);
  assert.match(r.band, /no cortical contact/);
});

test('type I is nondisplaced, anterior humeral line through the capitellum, not flagged', () => {
  const r = gartlandSupracondylar({ type: 'I' });
  assert.equal(r.displaced, false);
  assert.match(r.band, /nondisplaced/);
  assert.match(r.band, /anterior humeral line passes through the capitellum/);
});

test('type II is displaced with an intact posterior hinge, flagged (Wilkins IIA/IIB)', () => {
  const r = gartlandSupracondylar({ type: 'II' });
  assert.equal(r.displaced, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /intact posterior cortical hinge/);
  assert.match(r.band, /Wilkins IIA/);
});

test('type IV is the modified multidirectional-instability type, flagged', () => {
  const r = gartlandSupracondylar({ type: 'IV' });
  assert.equal(r.displaced, true);
  assert.match(r.band, /multidirectional instability/);
});

test('numeric, case-insensitive, and IIA/IIB input map to the types', () => {
  assert.equal(gartlandSupracondylar({ type: 3 }).type, 'III');
  assert.equal(gartlandSupracondylar({ type: '2' }).type, 'II');
  assert.equal(gartlandSupracondylar({ type: 'i' }).type, 'I');
  assert.equal(gartlandSupracondylar({ type: 'IIA' }).type, 'II');
  assert.equal(gartlandSupracondylar({ type: 'iib' }).type, 'II');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(gartlandSupracondylar({}).valid, false);
  assert.equal(gartlandSupracondylar({ type: 'V' }).valid, false);
  assert.equal(gartlandSupracondylar({ type: '0' }).valid, false);
});
