import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heatstrokeDecision } from '../../lib/scoring-v4.js';

test('heat exhaustion: 39.5 C, no CNS, sweating, field -> rest + rehydration', () => {
  const r = heatstrokeDecision({ coreTempC: 39.5, cns: 'none', sweating: true, setting: 'field' });
  assert.equal(r.stage, 'heat exhaustion');
  assert.equal(r.subtype, null);
  assert.match(r.action, /oral or IV rehydration/);
});

test('heat exhaustion boundary: 40.0 C exactly, no CNS -> still heat exhaustion (Bouchama >40 threshold)', () => {
  const r = heatstrokeDecision({ coreTempC: 40.0, cns: 'none' });
  assert.equal(r.stage, 'heat exhaustion');
});

test('exertional heat stroke: 41.2 C, mild confusion, sweating, field -> CWI cool-first-transport-second', () => {
  const r = heatstrokeDecision({ coreTempC: 41.2, cns: 'mild-confusion', sweating: true, setting: 'field' });
  assert.equal(r.stage, 'heat stroke');
  assert.equal(r.subtype, 'exertional');
  assert.match(r.action, /Cold-water immersion/);
  assert.match(r.action, /38\.9 C/);
  assert.ok(r.banners.some((b) => /100% if core is lowered/.test(b)));
});

test('classic heat stroke: 41.0 C, coma, anhidrotic, hospital -> CWI preferred, evaporative acceptable', () => {
  const r = heatstrokeDecision({ coreTempC: 41.0, cns: 'altered', sweating: false, setting: 'hospital' });
  assert.equal(r.stage, 'heat stroke');
  assert.equal(r.subtype, 'classic');
  assert.match(r.action, /Cold-water immersion preferred/);
  assert.match(r.action, /evaporative/);
});

test('CNS dysfunction independent of temperature: 39.0 C with seizure-equivalent altered LOC -> heat stroke', () => {
  const r = heatstrokeDecision({ coreTempC: 39.0, cns: 'altered', sweating: true, setting: 'field' });
  assert.equal(r.stage, 'heat stroke');
  assert.ok(r.cnsDysfunction);
});

test('rhabdo/DIC/AKI surveillance banner present for heat stroke', () => {
  const r = heatstrokeDecision({ coreTempC: 41.0, cns: 'altered', setting: 'field' });
  assert.ok(r.banners.some((b) => /rhabdomyolysis/.test(b)));
});

test('rejects out-of-range and invalid inputs', () => {
  assert.throws(() => heatstrokeDecision({ coreTempC: 30, cns: 'none' }));
  assert.throws(() => heatstrokeDecision({ coreTempC: 41, cns: 'invalid' }));
  assert.throws(() => heatstrokeDecision({ coreTempC: 41, cns: 'none', setting: 'home' }));
});
