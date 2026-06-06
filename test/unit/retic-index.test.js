// spec-v55 §2.2: corrected reticulocyte % + Reticulocyte Production Index.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reticIndex } from '../../lib/clinical-v6.js';

test('retic adequate: 5% at Hct 30 -> corrected 3.33, factor 1.5, RPI 2.22', () => {
  const r = reticIndex({ reticPct: 5, hct: 30 });
  assert.equal(r.correctedRetic, 3.33);
  assert.equal(r.maturationFactor, 1.5);
  assert.equal(r.rpi, 2.22);
  assert.match(r.band, /adequate/);
});

test('retic inadequate: 1% at normal Hct 45 -> RPI 1.0', () => {
  const r = reticIndex({ reticPct: 1, hct: 45 });
  assert.equal(r.maturationFactor, 1.0);
  assert.equal(r.rpi, 1.0);
  assert.match(r.band, /inadequate/);
});

test('retic inadequate just below 2: 8% at Hct 22 -> RPI 1.96', () => {
  const r = reticIndex({ reticPct: 8, hct: 22 });
  assert.equal(r.maturationFactor, 2.0);
  assert.equal(r.rpi, 1.96);
  assert.match(r.band, /inadequate/);
});

test('retic severe anemia: 3% at Hct 15 -> factor 2.5, RPI 0.4', () => {
  const r = reticIndex({ reticPct: 3, hct: 15 });
  assert.equal(r.maturationFactor, 2.5);
  assert.equal(r.rpi, 0.4);
});

test('retic rejects impossible input', () => {
  assert.throws(() => reticIndex({ reticPct: 5, hct: 0 }), /hct/);
  assert.throws(() => reticIndex({ reticPct: NaN, hct: 30 }), /reticPct/);
});
