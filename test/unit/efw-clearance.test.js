// spec-v204 2.4: Electrolyte-Free Water Clearance worked examples (positive and
// negative). EFWC = V * [1 - (U_Na + U_K)/P_Na]. Formula spec-v97 cross-verified
// (Rose 1986 + standard nephrology references).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { efwClearance as efwc } from '../../lib/nephro-fluids-v204.js';

test('positive EFWC -> excreting free water (worked example)', () => {
  const r = efwc({ urineVolume: 2000, urineNa: 20, urineK: 10, plasmaNa: 140 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 1571.4); // 2000 * (1 - 30/140)
  assert.equal(r.abnormal, false);
  assert.match(r.band, /excreting free water/);
});

test('negative EFWC -> net free-water retention', () => {
  const r = efwc({ urineVolume: 1000, urineNa: 80, urineK: 80, plasmaNa: 140 });
  assert.equal(r.score, -142.9); // 1000 * (1 - 160/140)
  assert.equal(r.abnormal, true);
  assert.match(r.band, /retention/);
});

test('matches the formula exactly', () => {
  const r = efwc({ urineVolume: 1500, urineNa: 40, urineK: 20, plasmaNa: 135 });
  const expected = Math.round(1500 * (1 - (40 + 20) / 135) * 10) / 10;
  assert.equal(r.score, expected);
});

test('zero plasma sodium -> guarded', () => {
  const r = efwc({ urineVolume: 1500, urineNa: 40, urineK: 20, plasmaNa: 0 });
  assert.equal(r.valid, false);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = efwc({ urineVolume: 1500, urineNa: 40 });
  assert.equal(r.valid, false);
});
