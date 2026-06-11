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

// spec-v70: SAS 3 is the lower edge of the printed light-sedation goal (SAS
// 3-4), so it must read as in-goal -- not "deeper than goal; lighten sedation".
// Before v70 this passed vacuously: the old /goal of SAS 3-4/ regex also
// matched the contradictory "deeper than ... goal of SAS 3-4" string.
test('sasRiker 3: sedated but within the goal band 3-4 (not "deeper than goal")', () => {
  const r = sasRiker({ level: 3 });
  assert.match(r.band, /within the .* goal of SAS 3-4/);
  assert.doesNotMatch(r.band, /deeper than/);
  assert.doesNotMatch(r.band, /lightening sedation/);
});

test('sasRiker 2: very sedated, deeper than the 3-4 goal (lower bound enforced)', () => {
  const r = sasRiker({ level: 2 });
  assert.match(r.band, /deeper than/);
  assert.match(r.band, /lightening sedation/);
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
