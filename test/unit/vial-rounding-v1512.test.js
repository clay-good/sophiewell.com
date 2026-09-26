// spec-v1512 tool 1: dose rounding to whole vials.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vialRounding as v } from '../../lib/vial-rounding-v1512.js';

test('mg/kg dose rounds to the nearest whole-vial total within 10%', () => {
  const r = v({ basis: 'mgkg', dose: '5', weight: '84', vial1: '100' });
  assert.equal(r.rounded, 400);
  assert.match(r.band, /discarding 80 mg/);
});

test('ties on total break on cost', () => {
  assert.match(v({ basis: 'mg', dose: '460', vial1: '100', vial2: '500', cost1: '700', cost2: '3400' }).band, /: 1 × 500 mg, nothing discarded, \$3,400\.00/);
});

test('no combination within the threshold says rounding is not within policy', () => {
  const r = v({ basis: 'mg', dose: '150', vial1: '100', threshold: '5' });
  assert.equal(r.rounded, null);
  assert.equal(r.bandLabel, 'Not within policy');
});

test('an exact whole-vial dose needs no rounding and discards nothing', () => {
  const r = v({ basis: 'mg', dose: '400', vial1: '100' });
  assert.equal(r.rounded, 400);
  assert.match(r.band, /JZ modifier/);
});

test('blank inputs ask', () => {
  assert.equal(v({}).valid, false);
  assert.equal(v({ basis: 'mg', vial1: '100' }).valid, false);
  assert.equal(v({ basis: 'mgkg', dose: '5', vial1: '100' }).valid, false);
  assert.equal(v({ basis: 'mg', dose: '400' }).valid, false);
});
