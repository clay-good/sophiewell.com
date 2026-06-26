// spec-v152 2.2: Harris-Benedict BEE, revised constants (Roza 1984). Male BEE =
// 88.362 + 13.397*wt + 4.799*ht - 5.677*age; female BEE = 447.593 + 9.247*wt +
// 3.098*ht - 4.330*age. TDEE = BEE * activity factor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { harrisBenedict } from '../../lib/nutrition-energy-v152.js';

test('tile example: male 70 kg / 175 cm / 40 yr -> BEE 1639', () => {
  // 88.362 + 13.397*70 + 4.799*175 - 5.677*40 = 88.362 + 937.79 + 839.825 - 227.08 = 1638.897 -> 1639.
  const r = harrisBenedict({ weight: 70, height: 175, age: 40, sex: 'male' });
  assert.equal(r.valid, true);
  assert.equal(r.base, 1639);
});

test('female revised equation worked total (identical anthropometrics)', () => {
  // 447.593 + 9.247*70 + 3.098*175 - 4.330*40 = 447.593 + 647.29 + 542.15 - 173.2 = 1463.833 -> 1464.
  const r = harrisBenedict({ weight: 70, height: 175, age: 40, sex: 'female' });
  assert.equal(r.base, 1464);
});

test('activity factor -> TDEE (very active 1.725)', () => {
  const r = harrisBenedict({ weight: 70, height: 175, age: 40, sex: 'male', activity: 'very' });
  assert.equal(r.base, 1639);
  assert.equal(r.tdee, Math.round(1639 * 1.725)); // 2827
});

test('blank input -> valid:false', () => {
  assert.equal(harrisBenedict({ weight: 70, height: 175 }).valid, false);
  assert.equal(harrisBenedict({}).valid, false);
});
