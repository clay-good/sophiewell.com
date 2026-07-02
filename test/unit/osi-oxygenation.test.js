// spec-v195 2.3: osi worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { osi } from '../../lib/vent-v195.js';

test('moderate PARDS band', () => {
  const r = osi({fio2:0.6,map:15,spo2:92});
  assert.equal(r.valid, true);
  assert.equal(r.value, 9.78);
  assert.equal(r.abnormal, true);
});

test('severe PARDS band', () => {
  const r = osi({fio2:0.8,map:20,spo2:90});
  assert.equal(r.value, 17.78);
});

test('guards: SpO2 required', () => {
  const r = osi({fio2:0.6,map:15});
  assert.equal(r.valid, false);
});
