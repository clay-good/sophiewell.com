// spec-v62 §2 A5: the substituted-formula derivation. The pure `substituted`
// function on a formula tile returns the published equation with the user's
// inputs plugged in, or null when an input is missing/non-finite (so the render
// layer never shows a NaN/Infinity).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';

const sub = META['cockcroft-gault'].derivation.substituted;

test('cockcroft-gault substituted: 60 yo male, 80 kg, SCr 1.0 -> 88.89 mL/min', () => {
  const s = sub({ age: 60, weightKg: 80, scr: 1.0, sex: 'M' });
  assert.match(s, /\(140 - 60\) x 80 kg/);
  assert.match(s, /= 88\.89 mL\/min$/);
});

test('cockcroft-gault substituted: female applies the 0.85 factor', () => {
  const s = sub({ age: 60, weightKg: 80, scr: 1.0, sex: 'F' });
  assert.match(s, /x 0\.85 \(female\)/);
  // 88.888... x 0.85 = 75.56
  assert.match(s, /= 75\.56 mL\/min$/);
});

test('cockcroft-gault substituted: missing/zero/non-finite input -> null (no NaN leak)', () => {
  assert.equal(sub({ age: 60, weightKg: 80, scr: 0, sex: 'M' }), null);
  assert.equal(sub({ age: NaN, weightKg: 80, scr: 1, sex: 'M' }), null);
  assert.equal(sub({ age: 60, weightKg: 80, sex: 'M' }), null);
  assert.equal(sub({}), null);
});

const subNa = META['corrected-sodium'].derivation.substituted;

test('corrected-sodium substituted: Na 130, glucose 600 -> 138 (1.6) / 142 (2.4)', () => {
  const s = subNa({ measuredNa: 130, glucose: 600 });
  assert.match(s, /= 138 mEq\/L \(Katz\)/);
  assert.match(s, /factor 2\.4 = 142 mEq\/L \(Hillier\)/);
});

test('corrected-sodium substituted: missing/non-finite input -> null', () => {
  assert.equal(subNa({ measuredNa: 130 }), null);
  assert.equal(subNa({ measuredNa: NaN, glucose: 600 }), null);
});

const subAa = META['aa-gradient'].derivation.substituted;

test('aa-gradient substituted: FiO2 0.21, PaCO2 40, PaO2 90 -> A-a 9.7', () => {
  const s = subAa({ fio2: 0.21, paco2: 40, pao2: 90 });
  assert.match(s, /0\.21 x \(760 - 47\) - 40\/0\.8/);
  assert.match(s, /A-a = 99\.7 - 90 = 9\.7 mmHg$/);
});

test('aa-gradient substituted: missing/non-finite input -> null', () => {
  assert.equal(subAa({ fio2: 0.21, paco2: 40 }), null);
  assert.equal(subAa({ fio2: Infinity, paco2: 40, pao2: 90 }), null);
});

const subOg = META['osmolal-gap'].derivation.substituted;

test('osmolal-gap substituted: Na 140, glu 90, BUN 14, measured 300 -> gap ~10', () => {
  const s = subOg({ measuredOsm: 300, sodium: 140, glucoseMgDl: 90, bunMgDl: 14, etohMgDl: 0 });
  assert.match(s, /2 x 140 \+ 90\/18 \+ 14\/2\.8/);
  assert.match(s, /gap = 300 - 290 = 10/);
});

test('osmolal-gap substituted: EtOH term appears only when nonzero; missing -> null', () => {
  assert.match(subOg({ measuredOsm: 320, sodium: 140, glucoseMgDl: 90, bunMgDl: 14, etohMgDl: 100 }), /\+ 100\/4\.6/);
  assert.equal(subOg({ measuredOsm: 300, sodium: 140, glucoseMgDl: 90 }), null);
});

const subW = META.winters.derivation.substituted;

test('winters substituted: HCO3 14 -> 27 to 31 mmHg', () => {
  assert.match(subW({ hco3: 14 }), /1\.5 x 14 \+ 8 \+\/- 2 = 27 to 31 mmHg/);
  assert.equal(subW({}), null);
});

const subFe = META['fena-feurea'].derivation.substituted;

test('fena-feurea substituted: both fractions rendered; partial -> one line; none -> null', () => {
  const s = subFe({ urineNa: 20, plasmaNa: 140, urineCr: 50, plasmaCr: 2.0, urineUrea: 300, plasmaUrea: 60 });
  assert.match(s, /FENa = \(20 x 2\) \/ \(140 x 50\) x 100 = 0\.57%/);
  assert.match(s, /FEUrea = \(300 x 2\) \/ \(60 x 50\) x 100 = 20%/);
  // FENa only (urea inputs missing)
  assert.match(subFe({ urineNa: 20, plasmaNa: 140, urineCr: 50, plasmaCr: 2.0 }), /^FENa = /);
  assert.equal(subFe({}), null);
});
