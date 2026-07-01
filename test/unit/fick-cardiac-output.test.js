// spec-v185 §2.1: cardiac output by the Fick principle. CO = VO2 / [1.36·Hb·
// (SaO2 − SvO2)·10]; the (SaO2 − SvO2) denominator is guarded (SaO2 > SvO2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fickCardiacOutput } from '../../lib/gaps-v185.js';

test('tile example: measured VO2 gives a normal cardiac index', () => {
  // avO2diff = 1.36·15·0.28 = 5.712 mL/dL; CO = 280/57.12 = 4.90; CI = 4.90/1.9 = 2.58
  const r = fickCardiacOutput({ method: 'measured', vo2: 280, hb: 15, sao2: 98, svo2: 70, bsa: 1.9 });
  assert.equal(r.valid, true);
  assert.equal(r.co, 4.9);
  assert.equal(r.ci, 2.58);
  assert.equal(r.bandLabel, 'Normal cardiac index');
});

test('estimated VO2 (LaFarge) path computes a plausible output', () => {
  // male, age 40, HR 70: VO2i = 138.1 − 11.49·ln40 + 0.378·70 ≈ 122.2; VO2 ≈ 232
  const r = fickCardiacOutput({ method: 'estimated', age: 40, sex: 'male', hr: 70, hb: 15, sao2: 98, svo2: 70, bsa: 1.9 });
  assert.equal(r.valid, true);
  assert.ok(r.co > 3.5 && r.co < 4.5, `CO ${r.co}`);
  assert.match(r.detail, /LaFarge estimate/);
});

test('low and high cardiac index band correctly', () => {
  const low = fickCardiacOutput({ method: 'measured', vo2: 200, hb: 15, sao2: 98, svo2: 70, bsa: 2.0 });
  assert.equal(low.bandLabel, 'Low cardiac index');
  const high = fickCardiacOutput({ method: 'measured', vo2: 600, hb: 15, sao2: 98, svo2: 60, bsa: 1.8 });
  assert.equal(high.bandLabel, 'High cardiac index');
});

test('guards: SaO2 must exceed SvO2; blanks fall back', () => {
  assert.equal(fickCardiacOutput({ method: 'measured', vo2: 250, hb: 15, sao2: 70, svo2: 70, bsa: 1.9 }).valid, false);
  assert.equal(fickCardiacOutput({ method: 'measured', vo2: 250, hb: 15, sao2: 60, svo2: 70, bsa: 1.9 }).valid, false);
  assert.equal(fickCardiacOutput({ method: 'measured', hb: 15, sao2: 98, svo2: 70, bsa: 1.9 }).valid, false);
  assert.equal(fickCardiacOutput({ method: 'estimated', sex: 'male', hr: 70, hb: 15, sao2: 98, svo2: 70, bsa: 1.9 }).valid, false);
  assert.equal(fickCardiacOutput({}).valid, false);
});
