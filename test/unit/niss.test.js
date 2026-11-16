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

// spec-v1744: this pinned the clamp (9 -> 6, forcing 75); an AIS above 6 is now refused.
test('AIS outside 1-6 is refused', () => {
  const r = niss({ ais1: 9, ais3: 4 });
  assert.equal(r.valid, false);
  assert.match(r.band, /highest AIS must be between 1 and 6/);
});

// spec-v1722: an AIS of 0.4 was rounded to 0 and dropped; a fraction is refused now.
test('a fractional AIS is refused', () => {
  const r = niss({ ais1: 5, ais2: 0.4, ais3: 4 });
  assert.equal(r.valid, false);
  assert.match(r.band, /second-highest AIS must be a whole number/);
});

test('single AIS scores its square', () => {
  const r = niss({ ais1: 4 });
  assert.equal(r.score, 16);
});

test('niss: an AIS outside 1-6 is refused, not clamped (spec-v1744)', () => {
  const ex = { ais1: 6, ais2: 3, ais3: 2 };
  for (const k of ['ais2', 'ais3']) {
    assert.equal(niss({ ...ex, [k]: 7 }).valid, false, k);
    assert.equal(niss({ ...ex, [k]: 0 }).valid, false, k);
    assert.equal(niss({ ...ex, [k]: 1 }).valid, true, k);
    assert.equal(niss({ ...ex, [k]: 6 }).valid, true, k);
  }
  assert.match(niss({ ...ex, ais2: 60 }).band, /second-highest AIS must be between 1 and 6/);
  const r = niss(ex); // worked example
  assert.equal(r.valid, true);
  assert.equal(r.score, 75);
  assert.equal(niss({ ais1: 5, ais2: null, ais3: null }).valid, true);
});
