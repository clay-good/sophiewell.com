import { test } from 'node:test';
import assert from 'node:assert/strict';
import { padss } from '../../lib/scoring-v4.js';

test('padss 0 (all zeros) -> not ready', () => {
  const r = padss({});
  assert.equal(r.score, 0);
  assert.equal(r.readyForDischarge, false);
});

test('padss 8 (upper edge of not-ready) -> not ready', () => {
  const r = padss({ vitalSigns: 2, ambulation: 2, nauseaVomiting: 2, pain: 2, surgicalBleeding: 0 });
  assert.equal(r.score, 8);
  assert.equal(r.readyForDischarge, false);
});

test('padss 9 (cutoff edge) -> ready for discharge', () => {
  const r = padss({ vitalSigns: 2, ambulation: 2, nauseaVomiting: 2, pain: 2, surgicalBleeding: 1 });
  assert.equal(r.score, 9);
  assert.equal(r.readyForDischarge, true);
});

test('padss 10 (all maxima) -> ready for discharge', () => {
  const r = padss({ vitalSigns: 2, ambulation: 2, nauseaVomiting: 2, pain: 2, surgicalBleeding: 2 });
  assert.equal(r.score, 10);
  assert.equal(r.readyForDischarge, true);
});

test('padss clamps out-of-range inputs', () => {
  const r = padss({ vitalSigns: 5, ambulation: -1, nauseaVomiting: 2, pain: 2, surgicalBleeding: 2 });
  // 5 -> clamped to 2; -1 -> clamped to 0; rest are valid
  assert.equal(r.score, 2 + 0 + 2 + 2 + 2);
});
