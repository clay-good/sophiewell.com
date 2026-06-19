// spec-v110 2.4: TCA toxicity QRS risk + sodium-bicarbonate target (Boehnert
// 1985). QRS >= 100 ms seizures, >= 160 ms ventricular arrhythmias; bicarb 1-2
// mEq/kg, target pH 7.45-7.55.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tcaBicarbonate } from '../../lib/tox-v110.js';

test('QRS 120 ms at 70 kg: seizure risk, 70-140 mEq', () => {
  const r = tcaBicarbonate({ qrs: 120, weight: 70 });
  assert.equal(r.valid, true);
  assert.equal(r.risk, 'seizure risk');
  assert.equal(r.bicarbLow, 70);
  assert.equal(r.bicarbHigh, 140);
  assert.match(r.band, /7\.45-7\.55/);
});

test('band flip: QRS crosses 100 then 160 into successive bands', () => {
  assert.equal(tcaBicarbonate({ qrs: 99, weight: 70 }).risk, 'below the 100 ms risk threshold');
  assert.equal(tcaBicarbonate({ qrs: 100, weight: 70 }).risk, 'seizure risk');
  assert.equal(tcaBicarbonate({ qrs: 159, weight: 70 }).risk, 'seizure risk');
  assert.equal(tcaBicarbonate({ qrs: 160, weight: 70 }).risk, 'ventricular-arrhythmia risk');
});

test('abnormal flag is set at and above 100 ms', () => {
  assert.equal(tcaBicarbonate({ qrs: 90, weight: 70 }).abnormal, false);
  assert.equal(tcaBicarbonate({ qrs: 110, weight: 70 }).abnormal, true);
});

test('bolus scales with weight (1-2 mEq/kg)', () => {
  const r = tcaBicarbonate({ qrs: 120, weight: 100 });
  assert.equal(r.bicarbLow, 100);
  assert.equal(r.bicarbHigh, 200);
});

test('guards zero / blank / negative weight and missing QRS', () => {
  assert.equal(tcaBicarbonate({ qrs: 120, weight: 0 }).valid, false);
  assert.equal(tcaBicarbonate({ weight: 70 }).valid, false);
  assert.equal(tcaBicarbonate({ qrs: -10, weight: 70 }).valid, false);
});
