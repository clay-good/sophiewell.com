// spec-v462: GMFCS cerebral-palsy gross-motor classification (levels I-V).
// Worked-example tests: each level and its mobility description, numeric input, and the invalid-level guard.
// Levels transcribed from Palisano 1997 (Dev Med Child Neurol) / GMFCS-E&R (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gmfcs } from '../../lib/gmfcs-v462.js';

test('level III: hand-held mobility device (the META example)', () => {
  const r = gmfcs({ level: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.level, 'III');
  assert.match(r.band, /walks using a hand-held mobility device/);
});

test('level I: walks without limitations', () => {
  assert.match(gmfcs({ level: 'I' }).band, /walks without limitations/);
});

test('level II: walks with limitations', () => {
  assert.match(gmfcs({ level: 'II' }).band, /walks with limitations/);
});

test('level IV: powered mobility', () => {
  assert.match(gmfcs({ level: 'IV' }).band, /may use powered mobility/);
});

test('level V: transported in a manual wheelchair', () => {
  const r = gmfcs({ level: 'V' });
  assert.equal(r.level, 'V');
  assert.match(r.band, /transported in a manual wheelchair/);
});

test('numeric input maps to the levels', () => {
  assert.equal(gmfcs({ level: 1 }).level, 'I');
  assert.equal(gmfcs({ level: 5 }).level, 'V');
});

test('a missing or out-of-range level is invalid', () => {
  assert.equal(gmfcs({}).valid, false);
  assert.equal(gmfcs({ level: 'VI' }).valid, false);
  assert.equal(gmfcs({ level: '0' }).valid, false);
});
