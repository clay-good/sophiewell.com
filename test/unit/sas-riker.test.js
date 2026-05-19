// spec-v13 §3.2.2 wave 13-2: SAS / Riker boundary examples per
// Riker RR, et al. Crit Care Med. 1999;27(7):1325-1329.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sasRiker } from '../../lib/scoring-v4.js';

test('sasRiker 4: calm and cooperative (goal band)', () => {
  const r = sasRiker({ level: 4 });
  assert.equal(r.level, 4);
  assert.match(r.band, /goal sedation/);
});

test('sasRiker 3: sedated (still in goal band 3-4)', () => {
  const r = sasRiker({ level: 3 });
  assert.match(r.band, /goal of SAS 3-4/);
});

test('sasRiker 5: agitated', () => {
  const r = sasRiker({ level: 5 });
  assert.match(r.band, /agitated/);
});

test('sasRiker 1: unarousable; deeper than goal', () => {
  const r = sasRiker({ level: 1 });
  assert.match(r.band, /deeper/);
});

test('sasRiker clamps out-of-range to 1-7', () => {
  assert.equal(sasRiker({ level: 99 }).level, 7);
  assert.equal(sasRiker({ level: 0 }).level, 1);
});
