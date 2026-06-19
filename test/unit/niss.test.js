// spec-v108 2.2: NISS (Osler 1997). Sum of squares of 3 worst AIS, any region.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { niss } from '../../lib/trauma-v108.js';

test('no AIS entered -> fallback', () => {
  assert.equal(niss({}).valid, false);
});

test('sum of squares of the three worst AIS (5,4,3) = 50', () => {
  const r = niss({ ais1: 5, ais2: 4, ais3: 3 });
  assert.equal(r.score, 50);
  assert.equal(r.major, true);
  assert.deepEqual(r.used, [5, 4, 3]);
});

test('band flip: an AIS 6 forces the maximal score 75', () => {
  const r = niss({ ais1: 6, ais2: 3, ais3: 2 });
  assert.equal(r.score, 75);
  assert.equal(r.force6, true);
  assert.match(r.band, /forces the maximal score/);
});

test('takes the three highest when more than three given is not possible; lowest AIS still squares', () => {
  const r = niss({ ais1: 2, ais2: 2, ais3: 2 });
  assert.equal(r.score, 12); // 4+4+4
  assert.equal(r.major, false);
});

test('AIS clamps to 1-6 and rounds', () => {
  const r = niss({ ais1: 9, ais2: 0.4, ais3: 4 });
  // 9 -> 6 forces 75
  assert.equal(r.score, 75);
});

test('single AIS scores its square', () => {
  const r = niss({ ais1: 4 });
  assert.equal(r.score, 16);
});
