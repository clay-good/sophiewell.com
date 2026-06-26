// spec-v154 2.3: Tinetti POMA (Tinetti 1986), 28-point version. Balance 0-16 +
// gait 0-12, total 0-28. Bands <= 18 high, 19-23 moderate, >= 24 low (MDCalc /
// StatPearls; 24 classed low). Sub-scores reported; total = balance + gait.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tinettiPoma } from '../../lib/function-v154.js';

test('tile example: balance 12 + gait 8 = 20 -> moderate', () => {
  const r = tinettiPoma({ balance: 12, gait: 8 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 20);
  assert.equal(r.balance, 12);
  assert.equal(r.gait, 8);
  assert.equal(r.bandLabel, 'Moderate fall risk');
});

test('18/19 boundary', () => {
  const at18 = tinettiPoma({ balance: 10, gait: 8 });
  assert.equal(at18.score, 18);
  assert.equal(at18.bandLabel, 'High fall risk');
  const at19 = tinettiPoma({ balance: 11, gait: 8 });
  assert.equal(at19.score, 19);
  assert.equal(at19.bandLabel, 'Moderate fall risk');
});

test('23/24 boundary (24 classed low)', () => {
  const at23 = tinettiPoma({ balance: 14, gait: 9 });
  assert.equal(at23.score, 23);
  assert.equal(at23.bandLabel, 'Moderate fall risk');
  assert.equal(at23.abnormal, true);
  const at24 = tinettiPoma({ balance: 14, gait: 10 });
  assert.equal(at24.score, 24);
  assert.equal(at24.bandLabel, 'Low fall risk');
  assert.equal(at24.abnormal, false);
});

test('max 28 low; sub-scores clamp to their ranges; blank -> valid:false', () => {
  const max = tinettiPoma({ balance: 16, gait: 12 });
  assert.equal(max.score, 28);
  assert.equal(max.bandLabel, 'Low fall risk');
  // gait clamps at 12 (15 -> 12) so total 16+12 = 28, not 31.
  assert.equal(tinettiPoma({ balance: 16, gait: 15 }).score, 28);
  assert.equal(tinettiPoma({ balance: 10 }).valid, false);
  assert.match(tinettiPoma({ gait: 5 }).message, /balance subscore/i);
});
