// spec-v129 2.5: expected PaCO2 in metabolic alkalosis (Narins-Emmett 1980).
// expected PaCO2 = 0.7*(HCO3-24) + 40 (+/-5). Measured outside the band flags
// an added respiratory disorder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metAlkalosisCompensation } from '../../lib/acidbase-v129.js';

test('HCO3 40 -> expected PaCO2 51.2, measured 51 matches', () => {
  const r = metAlkalosisCompensation({ bicarbonate: 40, paco2: 51 });
  assert.equal(r.valid, true);
  assert.equal(r.expected, 51.2); // 0.7*16 + 40
  assert.equal(r.abnormal, false);
  assert.match(r.band, /appropriate compensation/);
});

test('measured PaCO2 above expected -> added respiratory acidosis flag', () => {
  const r = metAlkalosisCompensation({ bicarbonate: 40, paco2: 60 });
  assert.equal(r.expected, 51.2);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /respiratory acidosis/);
});

test('measured PaCO2 below expected -> added respiratory alkalosis flag', () => {
  const r = metAlkalosisCompensation({ bicarbonate: 40, paco2: 44 });
  assert.equal(r.expected, 51.2);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /respiratory alkalosis/);
});

test('normal HCO3 24 -> expected PaCO2 clamps at 40 (floor)', () => {
  const r = metAlkalosisCompensation({ bicarbonate: 24, paco2: 40 });
  assert.equal(r.expected, 40);
  assert.equal(r.abnormal, false);
});

test('any blank field -> valid:false', () => {
  assert.equal(metAlkalosisCompensation({ bicarbonate: 40 }).valid, false);
  assert.equal(metAlkalosisCompensation(1).valid, false);
});
