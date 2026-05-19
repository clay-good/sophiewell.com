import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aldrete } from '../../lib/scoring-v4.js';

test('aldrete 10 of 10 (tile example, all 2s) -> ready for discharge', () => {
  const r = aldrete({ activity: 2, respiration: 2, circulation: 2, consciousness: 2, oxygenSaturation: 2 });
  assert.equal(r.score, 10);
  assert.equal(r.readyForDischarge, true);
  assert.match(r.band, /ready for PACU discharge/i);
});

test('aldrete 9 of 10 -> ready for discharge (cutoff >=9)', () => {
  const r = aldrete({ activity: 2, respiration: 2, circulation: 2, consciousness: 2, oxygenSaturation: 1 });
  assert.equal(r.score, 9);
  assert.equal(r.readyForDischarge, true);
});

test('aldrete 8 of 10 -> not yet ready for discharge', () => {
  const r = aldrete({ activity: 2, respiration: 2, circulation: 2, consciousness: 1, oxygenSaturation: 1 });
  assert.equal(r.score, 8);
  assert.equal(r.readyForDischarge, false);
  assert.match(r.band, /not yet ready/i);
});

test('aldrete 0 of 10 -> not ready for discharge', () => {
  const r = aldrete({ activity: 0, respiration: 0, circulation: 0, consciousness: 0, oxygenSaturation: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.readyForDischarge, false);
});

test('aldrete clamps per-domain out-of-range to [0, 2]', () => {
  const r = aldrete({ activity: 99, respiration: -1, circulation: 2, consciousness: 2, oxygenSaturation: 2 });
  assert.equal(r.parts.activity, 2);
  assert.equal(r.parts.respiration, 0);
  assert.equal(r.score, 8);
});
