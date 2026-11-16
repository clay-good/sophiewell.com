// spec-v194 2.2: pressureGradients worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pressureGradients } from '../../lib/hemo-v194.js';

test('combined pre/post-capillary DPG >= 7 with PCWP > 15', () => {
  const r = pressureGradients({mpap:40,padp:30,pcwp:20});
  assert.equal(r.valid, true);
  assert.equal(r.tpg, 20);
  assert.equal(r.dpg, 10);
  assert.equal(r.abnormal, true);
});

test('normal transpulmonary range', () => {
  const r = pressureGradients({mpap:20,padp:12,pcwp:10});
  assert.equal(r.tpg, 10);
  assert.equal(r.dpg, 2);
  assert.equal(r.abnormal, false);
});

test('guards: PCWP required', () => {
  const r = pressureGradients({mpap:40,padp:30});
  assert.equal(r.valid, false);
});

// spec-v1736: neither the PA diastolic nor the PCWP can exceed the mean PA pressure; a negative DPG still answers.
test('a PCWP or PA diastolic above the mean PA pressure is refused; a negative DPG is not', () => {
  assert.match(pressureGradients({ mpap: 10, padp: 8, pcwp: 14 }).message, /PCWP \(14\) is above the mean PA pressure \(10\)/);
  assert.equal(pressureGradients({ mpap: 40, padp: 50, pcwp: 20 }).valid, false);
  assert.equal(pressureGradients({ mpap: 40, padp: 15, pcwp: 20 }).dpg, -5);
});
