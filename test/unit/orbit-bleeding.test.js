import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orbitBleeding } from '../../lib/scoring-v4.js';

test('orbit-bleeding 0 of 7 (tile example) -> low risk 2.4%/yr', () => {
  const r = orbitBleeding({});
  assert.equal(r.score, 0);
  assert.match(r.band, /low annual major-bleed risk 2\.4% per O'Brien 2015/);
});

test('orbit-bleeding 3 of 7 -> intermediate band 4.7%/yr', () => {
  const r = orbitBleeding({ lowHbOrHct: true, antiplatelet: true });
  // lowHbOrHct (2) + antiplatelet (1) = 3
  assert.equal(r.score, 3);
  assert.match(r.band, /intermediate annual major-bleed risk 4\.7%/);
});

test('orbit-bleeding 4 of 7 boundary -> high band 8.1%/yr', () => {
  const r = orbitBleeding({ lowHbOrHct: true, bleedingHistory: true });
  // lowHbOrHct (2) + bleedingHistory (2) = 4
  assert.equal(r.score, 4);
  assert.match(r.band, /high annual major-bleed risk 8\.1%/);
});

test('orbit-bleeding 7 of 7 (all criteria) -> high band', () => {
  const r = orbitBleeding({
    lowHbOrHct: true, ageGt74: true, bleedingHistory: true,
    renalInsufficiency: true, antiplatelet: true,
  });
  assert.equal(r.score, 7);
  assert.match(r.band, /high annual major-bleed risk 8\.1%/);
});

test('orbit-bleeding 2 of 7 upper edge of low band -> low band', () => {
  const r = orbitBleeding({ ageGt74: true, antiplatelet: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /low annual major-bleed risk 2\.4%/);
});
