// spec-v55 §2.7: arterial O2 content (CaO2) + O2 delivery (DO2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cao2Do2 } from '../../lib/clinical-v6.js';

test('cao2 normal: Hb 15, SaO2 98, PaO2 100, CO 5 -> CaO2 20.01, DO2 1000', () => {
  const r = cao2Do2({ hb: 15, sao2: 98, pao2: 100, cardiacOutput: 5 });
  assert.equal(r.cao2, 20.01);
  assert.equal(r.boundO2, 19.7);
  assert.equal(r.dissolvedO2, 0.31);
  assert.equal(r.do2, 1000);
});

test('cao2 anemic/hypoxemic: Hb 8, SaO2 90, PaO2 60 -> CaO2 9.83, no DO2', () => {
  const r = cao2Do2({ hb: 8, sao2: 90, pao2: 60 });
  assert.equal(r.cao2, 9.83);
  assert.equal(r.do2, null);
});

test('cao2 high delivery: Hb 12, SaO2 100, PaO2 200, CO 8', () => {
  const r = cao2Do2({ hb: 12, sao2: 100, pao2: 200, cardiacOutput: 8 });
  // bound 1.34*12*1 = 16.08; dissolved 0.0031*200 = 0.62; cao2 16.7; do2 16.7*80 = 1336
  assert.equal(r.cao2, 16.7);
  assert.equal(r.do2, 1336);
});

test('cao2 rejects impossible input', () => {
  assert.throws(() => cao2Do2({ hb: 0, sao2: 98, pao2: 100 }), /hb/);
  assert.throws(() => cao2Do2({ hb: 15, sao2: 98, pao2: 100, cardiacOutput: 0 }), /cardiacOutput/);
});
