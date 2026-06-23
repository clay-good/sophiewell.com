// spec-v141 2.4: corrected gestational age (AAP / Engle 2004).
// Corrected age = chronological age - (40 - GA at birth in weeks).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { correctedAge } from '../../lib/peds-growth-v141.js';

test('28-week preemie at 6 months chronological -> 3.2 months corrected', () => {
  const r = correctedAge({ chronoMonths: 6, gaWeeks: 28 });
  assert.equal(r.valid, true);
  assert.equal(r.prematurityWeeks, 12); // 40 - 28
  assert.equal(r.correctedMonths, 3.2); // 6 - 12/4.348
  assert.match(r.band, /12 wk of prematurity/);
});

test('term birth (>= 40 wk) -> no correction', () => {
  const r = correctedAge({ chronoMonths: 6, gaWeeks: 40 });
  assert.equal(r.prematurityWeeks, 0);
  assert.equal(r.correctedMonths, 6);
  assert.match(r.band, /no correction/);
});

test('beyond 24 months chronological adds the convention note', () => {
  const r = correctedAge({ chronoMonths: 30, gaWeeks: 32 });
  assert.equal(r.valid, true);
  assert.match(r.band, /no longer applied beyond about 24 months/);
});

test('correction never drives corrected age below 0', () => {
  const r = correctedAge({ chronoMonths: 1, gaWeeks: 24 });
  assert.equal(r.valid, true);
  assert.ok(r.correctedMonths >= 0, `expected >= 0, got ${r.correctedMonths}`);
});

test('guards: missing input, implausible GA -> valid:false', () => {
  assert.equal(correctedAge({ chronoMonths: 6 }).valid, false);
  assert.equal(correctedAge({ gaWeeks: 30 }).valid, false);
  assert.equal(correctedAge({ chronoMonths: -1, gaWeeks: 30 }).valid, false);
  assert.equal(correctedAge({ chronoMonths: 6, gaWeeks: 10 }).valid, false);
  assert.equal(correctedAge(0).valid, false);
});
