// spec-v189 §2: heme / rheum / anticoag / comorbidity instruments.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { msmart, impedeVte, sameTt2r2, elixhauser } from '../../lib/heme-risk-v189.js';

test('msmart: standard vs high, double/triple hit', () => {
  assert.equal(msmart({}).highRisk, false);
  assert.equal(msmart({ t414: '1' }).highRisk, true);
  assert.match(msmart({ t414: '1', del17p: '1' }).band, /double hit/);
  assert.match(msmart({ t414: '1', del17p: '1', gain1q: '1' }).band, /triple hit/);
  assert.equal(msmart({ t414: '1', del17p: '1' }).features, 2);
});

test('impede-vte: weighted sum and bands', () => {
  assert.equal(impedeVte({}).score, 0);
  assert.equal(impedeVte({}).risk, 'low');
  // IMiD +4, high-dose dex +4, prior VTE +5 = 13 -> high
  const r = impedeVte({ imid: '1', dexamethasone: 'high', vteHistory: '1' });
  assert.equal(r.score, 13);
  assert.equal(r.risk, 'high');
  // low-dose dex +2, aspirin -3 = -1 -> low
  assert.equal(impedeVte({ dexamethasone: 'low', thromboprophylaxis: 'aspirin' }).score, -1);
  // intermediate band: IMiD +4 + BMI +1 = 5
  assert.equal(impedeVte({ imid: '1', bmi25: '1' }).risk, 'intermediate');
});

test('same-tt2r2: points and cut', () => {
  assert.equal(sameTt2r2({}).score, 0);
  assert.equal(sameTt2r2({ female: '1' }).good, true); // 1 -> good
  assert.equal(sameTt2r2({ tobacco: '1' }).score, 2); // tobacco is +2
  assert.equal(sameTt2r2({ tobacco: '1' }).good, false); // >= 2 -> poorer
  assert.equal(sameTt2r2({ female: '1', ageUnder60: '1', tobacco: '1', nonWhite: '1' }).score, 6);
});

test('elixhauser: van Walraven signed weights', () => {
  assert.equal(elixhauser({}).score, 0);
  // CHF +7, metastatic +12, obesity -4 = 15 across 3 conditions
  const r = elixhauser({ chf: '1', metastatic: '1', obesity: '1' });
  assert.equal(r.score, 15);
  assert.equal(r.count, 3);
  // liver +11, drug abuse -7 = 4
  assert.equal(elixhauser({ liver: '1', drugAbuse: '1' }).score, 4);
  // zero-weight condition counts but does not move the score
  const z = elixhauser({ hypertension: '1', diabetes: '1' });
  assert.equal(z.score, 0);
  assert.equal(z.count, 2);
});
