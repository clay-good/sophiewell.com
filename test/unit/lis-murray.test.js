import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lisMurray } from '../../lib/scoring-v4.js';

test('lis-murray no injury: 0/300/5/80 -> 0.00', () => {
  const r = lisMurray({ quadrants: 0, pao2: 300, fio2: 0.4, peep: 5, complianceMlPerCmH2O: 80 });
  // P/F = 300/0.4 = 750 -> 0 pts; quadrants 0; PEEP 5 -> 0; compliance 80 -> 0
  assert.equal(r.score, 0);
  assert.match(r.band, /no lung injury/);
});

test('lis-murray mid: 2 quadrants / P/F 200 / PEEP 10 / compliance 50 -> 2.00', () => {
  // PaO2/FiO2 = 200; band 2. PEEP 10 -> band 2. Compliance 50 -> band 2.
  // Quadrants 2. Average (2+2+2+2)/4 = 2.00.
  const r = lisMurray({ quadrants: 2, pao2: 100, fio2: 0.5, peep: 10, complianceMlPerCmH2O: 50 });
  assert.ok(Math.abs(r.score - 2) < 0.005);
  assert.match(r.band, /mild-to-moderate/);
});

test('lis-murray severe: average > 2.5', () => {
  // 4 quadrants + P/F 80 (band 4) + PEEP 15 (band 4) + compliance 20 (band 3) -> 3.75
  const r = lisMurray({ quadrants: 4, pao2: 80, fio2: 1.0, peep: 15, complianceMlPerCmH2O: 20 });
  assert.ok(r.score > 2.5);
  assert.match(r.band, /severe lung injury/);
});

test('lis-murray quadrants clamped to 0-4', () => {
  const r = lisMurray({ quadrants: 99, pao2: 300, fio2: 0.4, peep: 5, complianceMlPerCmH2O: 80 });
  assert.equal(r.parts.quadrants, 4);
});
