// spec-v65 §2.3 unit tests: cerebral-perfusion-pressure. >=3 boundary worked
// examples including the MAP-from-BP path and the negative-CPP critical flag.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../../lib/clinical-v8.js';

test('cerebralPerfusionPressure: MAP 90 - ICP 20 -> CPP 70 (top of the BTF target band)', () => {
  const r = C.cerebralPerfusionPressure({ map: 90, icp: 20 });
  assert.equal(r.cpp, 70);
  assert.equal(r.map, 90);
  assert.match(r.band, /60-70/);
  assert.equal(r.critical, false);
  assert.equal(r.negative, false);
});

test('cerebralPerfusionPressure: computes MAP from SBP 120 / DBP 60 = 80 when MAP not entered', () => {
  const r = C.cerebralPerfusionPressure({ sbp: 120, dbp: 60, icp: 15 });
  assert.equal(r.map, 80); // ((2*60)+120)/3
  assert.equal(r.cpp, 65);
});

test('cerebralPerfusionPressure: CPP below 60 flags ischemia risk', () => {
  const r = C.cerebralPerfusionPressure({ map: 70, icp: 25 });
  assert.equal(r.cpp, 45);
  assert.equal(r.critical, true);
  assert.match(r.band, /ischemia/i);
});

test('cerebralPerfusionPressure: negative CPP (ICP > MAP) flagged, not hidden', () => {
  const r = C.cerebralPerfusionPressure({ map: 40, icp: 55 });
  assert.equal(r.cpp, -15);
  assert.equal(r.negative, true);
  assert.equal(r.critical, true);
});

test('cerebralPerfusionPressure: no MAP source -> null; impossible inputs throw', () => {
  assert.equal(C.cerebralPerfusionPressure({ icp: 10 }), null); // no map, no SBP/DBP
  assert.throws(() => C.cerebralPerfusionPressure({ map: 90, icp: NaN }), TypeError);
  assert.throws(() => C.cerebralPerfusionPressure({ map: 90, icp: 500 }), RangeError);
});
