import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rox } from '../../lib/clinical-v4.js';

test('rox success: SpO2 94 / FiO2 0.5 / RR 24 -> 7.83 (>=4.88 success)', () => {
  const r = rox({ spo2: 94, fio2: 0.5, rr: 24, hoursAfterStart: 12 });
  assert.ok(Math.abs(r.score - 7.833) < 0.005);
  assert.match(r.band, /success/);
});

test('rox failure at 12h: ROX 3.04 < 3.85', () => {
  // SpO2 85, FiO2 0.7, RR 40 -> (85/0.7)/40 = 3.04
  const r = rox({ spo2: 85, fio2: 0.7, rr: 40, hoursAfterStart: 12 });
  assert.ok(r.score < 3.85);
  assert.match(r.band, /failure/);
});

test('rox failure at 2h uses tighter cutoff <2.85', () => {
  // SpO2 80, FiO2 0.8, RR 38 -> (80/0.8)/38 = 2.63
  const r = rox({ spo2: 80, fio2: 0.8, rr: 38, hoursAfterStart: 2 });
  assert.ok(r.score < 2.85);
  assert.match(r.band, /failure/);
});

test('rox rejects invalid inputs', () => {
  assert.throws(() => rox({ spo2: 0, fio2: 0.5, rr: 20 }), /spo2/);
  assert.throws(() => rox({ spo2: 95, fio2: 0, rr: 20 }), /fio2/);
  assert.throws(() => rox({ spo2: 95, fio2: 0.5, rr: 0 }), /rr/);
});
