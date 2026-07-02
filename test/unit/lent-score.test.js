// spec-v205 2.1: LENT score worked examples crossing the risk groups. LDH>=1500
// +1, ECOG 0-3, N/L>=9 +1, tumour meso/heme 0 / breast-gyn-renal 1 / lung 2;
// total 0-7. Weights + survival spec-v97 cross-verified (Clive 2014 + validation).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lent } from '../../lib/pulm-copd-v205.js';

test('high-risk worked example (LENT 6)', () => {
  const r = lent({ pleuralLdh: 1600, ecog: '2', nlr: 10, tumorType: 'high' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high-risk/);
  assert.match(r.band, /44 days/);
});

test('low-risk case (LENT 0, ~319 days)', () => {
  const r = lent({ pleuralLdh: 800, ecog: '0', nlr: 5, tumorType: 'low' });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /319 days/);
});

test('moderate-risk case (LENT 3, ~130 days)', () => {
  const r = lent({ pleuralLdh: 800, ecog: '1', nlr: 10, tumorType: 'moderate' });
  assert.equal(r.score, 3);
  assert.match(r.band, /moderate-risk/);
  assert.match(r.band, /130 days/);
});

test('LDH threshold at 1500 and N/L threshold at 9', () => {
  const base = { ecog: '0', tumorType: 'low' };
  assert.equal(lent({ ...base, pleuralLdh: 1499, nlr: 8.9 }).score, 0);
  assert.equal(lent({ ...base, pleuralLdh: 1500, nlr: 8.9 }).score, 1);
  assert.equal(lent({ ...base, pleuralLdh: 1499, nlr: 9 }).score, 1);
});

test('maximum score is 7', () => {
  const r = lent({ pleuralLdh: 2000, ecog: '3-4', nlr: 20, tumorType: 'high' });
  assert.equal(r.score, 7); // 1 + 3 + 1 + 2
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = lent({ pleuralLdh: 1600, ecog: '2' });
  assert.equal(r.valid, false);
});
