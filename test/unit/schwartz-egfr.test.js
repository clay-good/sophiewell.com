// spec-v55 §2.13: bedside Schwartz eGFR (pediatric).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schwartzEgfr } from '../../lib/clinical-v6.js';

test('schwartz: height 100 cm, SCr 0.5 -> 82.6 mL/min/1.73m^2', () => {
  const r = schwartzEgfr({ heightCm: 100, scr: 0.5 });
  assert.equal(r.egfr, 82.6);
  assert.match(r.band, /G2/);
});

test('schwartz high: height 120 cm, SCr 0.4 -> 123.9', () => {
  const r = schwartzEgfr({ heightCm: 120, scr: 0.4 });
  assert.equal(r.egfr, 123.9);
  assert.match(r.band, /G1/);
});

test('schwartz low (G4): height 90 cm, SCr 2.0 -> 18.6', () => {
  const r = schwartzEgfr({ heightCm: 90, scr: 2.0 });
  assert.equal(r.egfr, 18.6);
  assert.match(r.band, /G4/);
});

test('schwartz rejects impossible input', () => {
  assert.throws(() => schwartzEgfr({ heightCm: 100, scr: 0 }), /scr/);
});
