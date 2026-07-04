// spec-v257: worked examples for the diving / hyperbaric-medicine formulas.
// Formulas spec-v97 verified (nitrox MOD/EAD; pulmonary OTU).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maximumOperatingDepth, equivalentAirDepth, oxygenToxicityUnits } from '../../lib/dive-v257.js';

test('mod: EAN32 at 1.4 bar', () => {
  const r = maximumOperatingDepth({ fo2: 0.32, po2max: 1.4 });
  assert.equal(r.score, 33.8);
});
test('mod: richer mix shallower MOD', () => {
  const r = maximumOperatingDepth({ fo2: 0.36, po2max: 1.4 });
  assert.ok(r.score < 33.8);
});

test('ead: EAN32 at 30 m', () => {
  const r = equivalentAirDepth({ depth: 30, fo2: 0.32 });
  assert.equal(r.score, 24.4);
});
test('ead: shallower than actual depth on nitrox', () => {
  const r = equivalentAirDepth({ depth: 30, fo2: 0.32 });
  assert.ok(r.score < 30);
});

test('otu: within limit', () => {
  const r = oxygenToxicityUnits({ po2: 1.4, time: 30 });
  assert.equal(r.score, 48.9);
  assert.equal(r.abnormal, false);
});
test('otu: zero below 0.5 ATA', () => {
  const r = oxygenToxicityUnits({ po2: 0.4, time: 100 });
  assert.equal(r.score, 0);
});
