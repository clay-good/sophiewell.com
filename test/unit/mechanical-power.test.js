// spec-v87 §2.2: Gattinoni simplified mechanical power of ventilation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mechanicalPower } from '../../lib/hemodynamics-v87.js';

test('worked example over threshold: RR 22, Vt 420, Pplat 26, PEEP 12, Ppeak 32 -> 22.6 J/min', () => {
  const r = mechanicalPower({ respiratoryRate: 22, tidalVolume: 420, plateau: 26, peep: 12, peak: 32 });
  assert.equal(r.valid, true);
  assert.equal(r.drivingPressure, 14); // 26 - 12
  // 0.098 * 22 * 0.42 * (32 - 0.5*14) = 0.098 * 22 * 0.42 * 25 = 22.638
  assert.equal(r.mechanicalPower, 22.6);
  assert.equal(r.highRisk, true);
  assert.match(r.band, /over 17/i);
});

test('below the 17 J/min threshold: RR 12, Vt 400, Pplat 20, PEEP 8, Ppeak 24 -> 8.5 J/min', () => {
  const r = mechanicalPower({ respiratoryRate: 12, tidalVolume: 400, plateau: 20, peep: 8, peak: 24 });
  // 0.098 * 12 * 0.4 * (24 - 0.5*12) = 0.098 * 12 * 0.4 * 18 = 8.4672
  assert.equal(r.mechanicalPower, 8.5);
  assert.equal(r.drivingPressure, 12);
  assert.equal(r.highRisk, false);
  assert.match(r.band, /or below/i);
});

test('threshold flip is at 17 J/min', () => {
  const high = mechanicalPower({ respiratoryRate: 24, tidalVolume: 450, plateau: 28, peep: 10, peak: 34 });
  assert.equal(high.highRisk, true); // ~24 J/min
});

test('any missing ventilator value surfaces a valid:false fallback', () => {
  const r = mechanicalPower({ respiratoryRate: 22, tidalVolume: 420, plateau: 26, peep: 12 });
  assert.equal(r.valid, false);
  assert.match(r.band, /peak/i);
  assert.equal(mechanicalPower({}).valid, false);
});

// spec-v1736: 0 <= PEEP <= plateau <= peak by definition. Out of order, the bracket went negative
// and a negative power was called "below the higher-VILI-risk threshold".
test('pressures out of their definitional order are refused, not read as low power', () => {
  const b = { respiratoryRate: 20, tidalVolume: 450, plateau: 25, peep: 8, peak: 30 };
  for (const [o, re] of [[{ plateau: 80 }, /peak pressure \(30\) is below the plateau/], [{ plateau: 999 }, /below the plateau/],
    [{ peep: 30 }, /plateau pressure \(25\) is below PEEP \(30\)/], [{ peep: -10 }, /PEEP cannot be negative/]]) {
    const r = mechanicalPower({ ...b, ...o });
    assert.equal(r.valid, false, JSON.stringify(o));
    assert.match(r.band, re);
  }
  // Equal pressures are possible (pressure control: peak ~ plateau; zero driving pressure).
  assert.equal(mechanicalPower({ ...b, plateau: 30, peak: 30 }).valid, true);
  assert.equal(mechanicalPower({ ...b, peep: 0 }).valid, true);
});

// spec-v1746: an entered value outside the range read as blank and was asked for again.
test('spec-v1746 a rate or tidal volume of -999999 is told its range; a blank is still asked for', () => {
  const ex = { respiratoryRate: 22, tidalVolume: 420, plateau: 26, peep: 12, peak: 32 };
  const bad = mechanicalPower({ ...ex, respiratoryRate: -999999 });
  assert.equal(bad.valid, false);
  assert.match(bad.band, /respiratory rate in breaths\/min must be greater than 0/);
  assert.match(mechanicalPower({ ...ex, tidalVolume: -999999 }).band, /tidal volume in mL must be greater than 0/);
  assert.equal(mechanicalPower({ ...ex, tidalVolume: null }).band, 'Enter respiratory rate, tidal volume, plateau, PEEP, and peak pressure.');
  assert.equal(mechanicalPower(ex).valid, true);
});
