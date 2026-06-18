// spec-v106 2.1: PEGeD graduated D-dimer rule (Kearon 2019). C-PTP tier x
// D-dimer threshold (ng/mL FEU): low < 1000, moderate < 500, high always images.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { peged } from '../../lib/vte-v106.js';

test('low C-PTP, D-dimer 600 < 1000 -> PE excluded', () => {
  const r = peged({ tier: 'low', dDimer: 600 });
  assert.equal(r.valid, true);
  assert.equal(r.excluded, true);
  assert.equal(r.threshold, 1000);
});

test('band flip: low C-PTP, D-dimer crossing 1000', () => {
  assert.equal(peged({ tier: 'low', dDimer: 999 }).excluded, true);
  assert.equal(peged({ tier: 'low', dDimer: 1000 }).excluded, false);
  assert.equal(peged({ tier: 'low', dDimer: 1200 }).excluded, false);
});

test('moderate C-PTP uses the 500 threshold', () => {
  assert.equal(peged({ tier: 'moderate', dDimer: 499 }).excluded, true);
  assert.equal(peged({ tier: 'moderate', dDimer: 500 }).excluded, false);
});

test('high C-PTP always images, no D-dimer needed', () => {
  const r = peged({ tier: 'high' });
  assert.equal(r.valid, true);
  assert.equal(r.excluded, false);
  assert.equal(r.threshold, null);
  assert.match(r.band, /directly to CT/);
});

test('partial input -> complete-the-fields fallback (no verdict from missing value)', () => {
  assert.equal(peged({}).valid, false);
  assert.equal(peged({ tier: 'low' }).valid, false);
  assert.equal(peged({ dDimer: 600 }).valid, false);
});
