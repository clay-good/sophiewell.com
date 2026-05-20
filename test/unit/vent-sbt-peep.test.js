import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ventSbtPeep } from '../../lib/scoring-v4.js';

test('All five Boles 2007 criteria met -> SBT ready', () => {
  const r = ventSbtPeep({
    pao2FiO2: 200, peep: 6, fio2: 0.4,
    vasopressors: false, awakeCooperative: true,
  });
  assert.ok(r.sbtReady);
  assert.deepEqual(r.failedCriteria, []);
});

test('PaO2/FiO2 149 fails -> not ready, banner names the failed item', () => {
  const r = ventSbtPeep({
    pao2FiO2: 149, peep: 6, fio2: 0.4,
    vasopressors: false, awakeCooperative: true,
  });
  assert.equal(r.sbtReady, false);
  assert.ok(r.failedCriteria.some((c) => c.includes('PaO2/FiO2')));
});

test('PEEP 10 fails the <=8 criterion', () => {
  const r = ventSbtPeep({
    pao2FiO2: 200, peep: 10, fio2: 0.4,
    vasopressors: false, awakeCooperative: true,
  });
  assert.equal(r.sbtReady, false);
  assert.ok(r.failedCriteria.some((c) => c.includes('PEEP')));
});

test('Vasopressors at more than minimal dose fail readiness', () => {
  const r = ventSbtPeep({
    pao2FiO2: 200, peep: 6, fio2: 0.4,
    vasopressors: true, awakeCooperative: true,
  });
  assert.equal(r.sbtReady, false);
});

test('ARDSnet low-PEEP at FiO2 0.5 -> 8-10', () => {
  const r = ventSbtPeep({
    pao2FiO2: 200, peep: 6, fio2: 0.4, awakeCooperative: true,
    ardsArm: 'low', lookupFiO2: 0.5,
  });
  assert.equal(r.suggestedPeep, '8-10');
});

test('ARDSnet low-PEEP at FiO2 1.0 -> 18-24', () => {
  const r = ventSbtPeep({
    pao2FiO2: 200, peep: 6, fio2: 0.4, awakeCooperative: true,
    ardsArm: 'low', lookupFiO2: 1.0,
  });
  assert.equal(r.suggestedPeep, '18-24');
});

test('ARDSnet high-PEEP at FiO2 0.3 -> 12-14', () => {
  const r = ventSbtPeep({
    pao2FiO2: 200, peep: 6, fio2: 0.4, awakeCooperative: true,
    ardsArm: 'high', lookupFiO2: 0.3,
  });
  assert.equal(r.suggestedPeep, '12-14');
});

test('ARDSnet lookup rounds up to next band (FiO2 0.55 -> 0.6 band)', () => {
  const r = ventSbtPeep({
    pao2FiO2: 200, peep: 6, fio2: 0.4, awakeCooperative: true,
    ardsArm: 'low', lookupFiO2: 0.55,
  });
  assert.equal(r.suggestedPeep, '10');
});

test('Unknown ARDSnet arm throws', () => {
  assert.throws(() => ventSbtPeep({
    pao2FiO2: 200, peep: 6, fio2: 0.4, awakeCooperative: true,
    ardsArm: 'middle', lookupFiO2: 0.5,
  }));
});

test('Without lookupFiO2 -> suggestedPeep null; SBT block still evaluates', () => {
  const r = ventSbtPeep({
    pao2FiO2: 200, peep: 6, fio2: 0.4, awakeCooperative: true,
  });
  assert.equal(r.suggestedPeep, null);
  assert.ok(r.sbtReady);
});
