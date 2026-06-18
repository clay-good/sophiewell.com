// spec-v107 2.4: MACOCHA score (De Jong 2013). 0-12, >= 3 elevated risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { macocha } from '../../lib/eddecision-v107.js';

test('no factors -> 0, lower risk', () => {
  const r = macocha({});
  assert.equal(r.total, 0);
  assert.equal(r.elevated, false);
  assert.equal(r.abnormal, false);
});

test('band flip: total crossing 3 into elevated risk', () => {
  // OSA (2) -> 2, lower risk
  const lower = macocha({ osa: true });
  assert.equal(lower.total, 2);
  assert.equal(lower.elevated, false);
  // + reduced cervical mobility (1) = 3 -> elevated
  const elevated = macocha({ osa: true, cervical: true });
  assert.equal(elevated.total, 3);
  assert.equal(elevated.elevated, true);
  assert.equal(elevated.abnormal, true);
});

test('Mallampati III/IV alone (5) -> elevated', () => {
  const r = macocha({ mallampati: true });
  assert.equal(r.total, 5);
  assert.equal(r.elevated, true);
});

test('tile example: Mallampati (5) + OSA (2) = 7, elevated', () => {
  const r = macocha({ mallampati: true, osa: true });
  assert.equal(r.total, 7);
  assert.equal(r.elevated, true);
  assert.match(r.band, /MACOCHA score 7: elevated/);
});

test('all factors clamp to the published 0-12 maximum', () => {
  const r = macocha({
    mallampati: true, osa: true, cervical: true, mouthOpening: true,
    coma: true, hypoxemia: true, nonAnesthesiologist: true,
  });
  assert.equal(r.total, 12);
  assert.equal(r.elevated, true);
});
