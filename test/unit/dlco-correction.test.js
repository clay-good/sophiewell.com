// spec-v186 §2.4: hemoglobin-corrected DLCO (Cotes) & KCO. Hb and VA are guarded
// > 0 before the divisions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dlcoCorrection } from '../../lib/specialtymath-v186.js';

test('tile example: anemia correction raises the DLCO', () => {
  // male: 20·(10.22 + 10)/(1.7·10) = 20·20.22/17 = 23.79 -> 23.8; KCO = 20/5 = 4
  const r = dlcoCorrection({ dlco: 20, hb: 10, va: 5, sex: 'male' });
  assert.equal(r.valid, true);
  assert.equal(r.corrected, 23.8);
  assert.equal(r.kco, 4);
  assert.match(r.detail, /raised/);
});

test('the female constant differs from the male constant', () => {
  const male = dlcoCorrection({ dlco: 20, hb: 10, va: 5, sex: 'male' });
  const female = dlcoCorrection({ dlco: 20, hb: 10, va: 5, sex: 'female' });
  assert.ok(female.corrected !== male.corrected);
});

test('polycythemia (high Hb) lowers the corrected value', () => {
  const r = dlcoCorrection({ dlco: 20, hb: 18, va: 5, sex: 'male' });
  assert.ok(r.corrected < 20, `corrected ${r.corrected}`);
  assert.match(r.detail, /lowered/);
});

test('guards: Hb / VA must be > 0; sex required; blanks fall back', () => {
  assert.equal(dlcoCorrection({ dlco: 20, hb: 0, va: 5, sex: 'male' }).valid, false);
  assert.equal(dlcoCorrection({ dlco: 20, hb: 10, va: 5 }).valid, false);
  assert.equal(dlcoCorrection({}).valid, false);
});
