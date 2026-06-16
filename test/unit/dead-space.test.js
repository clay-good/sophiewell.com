// spec-v87 §2.3: Bohr-Enghoff physiologic dead-space fraction (Vd/Vt).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deadSpace } from '../../lib/hemodynamics-v87.js';

test('worked example: PaCO2 60, PĒCO2 20 -> Vd/Vt 0.67 (67%), elevated', () => {
  const r = deadSpace({ paco2: 60, expiredCo2: 20, source: 'peco2' });
  assert.equal(r.valid, true);
  assert.equal(r.ratio, 0.67); // (60-20)/60 = 0.6667
  assert.equal(r.ratioPercent, 67);
  assert.equal(r.elevated, true);
  assert.equal(r.implausible, false);
  assert.equal(r.isEtco2, false);
  assert.match(r.band, /over 0\.6/i);
});

test('EtCO2 surrogate below threshold: PaCO2 40, EtCO2 28 -> 0.3, labeled as underestimate', () => {
  const r = deadSpace({ paco2: 40, expiredCo2: 28, source: 'etco2' });
  assert.equal(r.ratio, 0.3);
  assert.equal(r.ratioPercent, 30);
  assert.equal(r.elevated, false);
  assert.equal(r.isEtco2, true);
  assert.match(r.note, /underestimate/i);
});

test('implausible input (expired CO2 >= PaCO2) is flagged, not silently clamped', () => {
  const r = deadSpace({ paco2: 30, expiredCo2: 35, source: 'peco2' });
  assert.equal(r.valid, true);
  assert.equal(r.implausible, true);
  assert.equal(r.ratio, -0.17); // (30-35)/30
  assert.match(r.band, /implausible/i);
});

test('missing inputs surface a valid:false fallback', () => {
  assert.equal(deadSpace({ expiredCo2: 20 }).valid, false);
  assert.equal(deadSpace({ paco2: 0, expiredCo2: 20 }).valid, false);
  assert.equal(deadSpace({}).valid, false);
});
