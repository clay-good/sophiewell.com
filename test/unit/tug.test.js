// spec-v154 2.2: Timed Up & Go (Podsiadlo & Richardson 1991). Single measured
// time in seconds; CDC STEADI flags >= 12 s, community-dwelling cutoff >= 13.5
// s, dependent band >= 30 s. Higher time = higher risk; blank/non-finite ->
// valid:false (no spurious flag).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tug } from '../../lib/function-v154.js';

test('tile example: 12.5 s -> STEADI flagged, community not yet', () => {
  const r = tug({ seconds: 12.5 });
  assert.equal(r.valid, true);
  assert.equal(r.seconds, 12.5);
  assert.equal(r.steadi, true);
  assert.equal(r.community, false);
  assert.equal(r.abnormal, true);
});

test('exactly 12 s is the inclusive STEADI threshold', () => {
  const at12 = tug({ seconds: 12 });
  assert.equal(at12.steadi, true);
  const below = tug({ seconds: 11.9 });
  assert.equal(below.steadi, false);
  assert.equal(below.abnormal, false);
});

test('13.5 s community cutoff and 30 s dependent band', () => {
  const at135 = tug({ seconds: 13.5 });
  assert.equal(at135.community, true);
  assert.equal(at135.dependent, false);
  const at30 = tug({ seconds: 30 });
  assert.equal(at30.dependent, true);
  assert.match(at30.band, /dependent/i);
});

test('blank / non-finite / out-of-range -> valid:false', () => {
  assert.equal(tug({ seconds: null }).valid, false);
  assert.equal(tug({ seconds: NaN }).valid, false);
  assert.equal(tug({}).valid, false);
  assert.equal(tug({ seconds: -1 }).valid, false);
  assert.equal(tug({ seconds: 700 }).valid, false);
  assert.match(tug({}).message, /seconds/i);
});
