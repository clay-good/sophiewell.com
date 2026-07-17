// spec-v379: Tile (AO/Tile) classification of a pelvic ring injury (types A/B/C). Worked-example tests:
// each type and its stability description, the unstable flag on types B-C, letter + numeric +
// case-insensitive input, and the invalid-type guard. Types transcribed from Tile 1996 (JAAOS),
// cross-verified against orthopedic/trauma references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tilePelvic } from '../../lib/tile-pelvic-v379.js';

test('type C: rotationally and vertically unstable, flagged (the META example)', () => {
  const r = tilePelvic({ type: 'C' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'C');
  assert.equal(r.unstable, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /rotationally and vertically unstable/);
  assert.match(r.band, /completely disrupted/);
});

test('type A is stable, posterior ring intact, not flagged', () => {
  const r = tilePelvic({ type: 'A' });
  assert.equal(r.unstable, false);
  assert.match(r.band, /stable/);
  assert.match(r.band, /posterior ring is intact/);
});

test('type B is rotationally unstable but vertically stable, flagged', () => {
  const r = tilePelvic({ type: 'B' });
  assert.equal(r.unstable, true);
  assert.match(r.band, /rotationally unstable but vertically stable/);
});

test('numeric and case-insensitive input map to the types', () => {
  assert.equal(tilePelvic({ type: 3 }).type, 'C');
  assert.equal(tilePelvic({ type: '1' }).type, 'A');
  assert.equal(tilePelvic({ type: 'b' }).type, 'B');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(tilePelvic({}).valid, false);
  assert.equal(tilePelvic({ type: 'D' }).valid, false);
  assert.equal(tilePelvic({ type: '0' }).valid, false);
});
