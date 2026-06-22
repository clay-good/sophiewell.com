// spec-v138 2.4: Amniotic Fluid Index (Moore & Cayle 1990). Sum of the four-quadrant
// deepest vertical pockets (cm); oligohydramnios < 5, polyhydramnios > 24, 5-8 low-normal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { afi } from '../../lib/ob-v138.js';

test('oligohydramnios at < 5 cm (flagged)', () => {
  const r = afi({ q1: 1, q2: 1, q3: 1, q4: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.afi, 4);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /oligohydramnios/);
});

test('normal AFI (not flagged)', () => {
  const r = afi({ q1: 5, q2: 4, q3: 4, q4: 5 });
  assert.equal(r.afi, 18);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /normal/);
});

test('low-normal band 5-8 cm (not flagged)', () => {
  const r = afi({ q1: 2, q2: 2, q3: 1.5, q4: 1 });
  assert.equal(r.afi, 6.5);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low-normal/);
});

test('polyhydramnios at > 24 cm (flagged)', () => {
  const r = afi({ q1: 8, q2: 8, q3: 7, q4: 6 });
  assert.equal(r.afi, 29);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /polyhydramnios/);
});

test('negative / missing pocket -> valid:false', () => {
  assert.equal(afi({ q1: -1, q2: 4, q3: 4, q4: 4 }).valid, false);
  assert.equal(afi({ q1: 4, q2: 4, q3: 4 }).valid, false);
});
