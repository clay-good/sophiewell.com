// spec-v140 2.2: SNAPPE-II (Richardson 2001). Nine banded variables summing
// 0-162; PaO2(mmHg)/FiO2(%) ratio. Unmeasured items score their 0 band.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snappeII } from '../../lib/peds-v140.js';

test('worked example -> 89/162, high severity', () => {
  const r = snappeII({ map: 25, temp: 34.5, pao2: 50, fio2: 80, ph: 7.05, seizures: false, urine: 0.5, bw: 800, sga: false, apgar5: 5 });
  // 9 (BP) + 15 (temp) + 16 (P/F 0.625) + 16 (pH) + 0 + 5 (urine) + 10 (BW) + 0 + 18 (Apgar) = 89
  assert.equal(r.score, 89);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high illness severity/);
});

test('all-normal / blank -> 0 and lower severity', () => {
  assert.equal(snappeII({}).score, 0);
  assert.match(snappeII({}).band, /lower illness severity/);
});

test('max physiology bands sum correctly', () => {
  // BP<20 (19) + temp<35 (15) + P/F<0.3 (28) + pH<7.10 (16) + seizures (19)
  // + urine<0.1 (18) + BW<750 (17) + SGA (12) + Apgar<7 (18) = 162
  const r = snappeII({ map: 10, temp: 34, pao2: 20, fio2: 100, ph: 7.0, seizures: true, urine: 0.05, bw: 600, sga: true, apgar5: 3 });
  assert.equal(r.score, 162);
});

test('PaO2/FiO2 ratio bands: 80/40 = 2.0 -> 5 points', () => {
  // only oxygenation contributes; ratio 2.0 is in the 1.0-2.49 band (5)
  assert.equal(snappeII({ pao2: 80, fio2: 40 }).score, 5);
  assert.equal(snappeII({ pao2: 90, fio2: 30 }).score, 0); // ratio 3.0 -> 0
});

test('zero FiO2 is guarded (oxygenation scores 0, no divide-by-zero)', () => {
  const r = snappeII({ pao2: 50, fio2: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
});

test('SGA and multiple seizures are checkbox add-ons', () => {
  assert.equal(snappeII({ sga: true }).score, 12);
  assert.equal(snappeII({ seizures: true }).score, 19);
});
