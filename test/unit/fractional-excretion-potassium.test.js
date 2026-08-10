// spec-v684: Fractional excretion of potassium (FEK).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fractionalExcretionPotassium } from '../../lib/fractional-excretion-potassium-v684.js';

test('worked example: uK 40, pK 4.0, uCr 100, pCr 1.0 -> 10%', () => {
  const r = fractionalExcretionPotassium({ urineK: '40', plasmaK: '4.0', urineCr: '100', plasmaCr: '1.0' });
  assert.equal(r.valid, true);
  assert.equal(r.fek, 10);
  assert.match(r.band, /FEK 10%/);
});

test('formula matches (uK*pCr)/(pK*uCr)*100', () => {
  const r = fractionalExcretionPotassium({ urineK: '30', plasmaK: '3.0', urineCr: '80', plasmaCr: '1.2' });
  const expected = Math.round((30 * 1.2) / (3.0 * 80) * 100 * 10) / 10; // 15
  assert.equal(r.fek, expected);
  assert.equal(r.fek, 15);
});

test('renal wasting range (> 20%)', () => {
  const r = fractionalExcretionPotassium({ urineK: '40', plasmaK: '3.0', urineCr: '50', plasmaCr: '1.0' });
  // (40*1)/(3*50)*100 = 26.7
  assert.equal(r.fek, 26.7);
});

test('inputs are validated', () => {
  assert.equal(fractionalExcretionPotassium({}).valid, false);
  assert.equal(fractionalExcretionPotassium({}).code, 'MISSING_INPUT');
  assert.equal(fractionalExcretionPotassium({ urineK: '40', plasmaK: '4', urineCr: '100' }).field, 'plasmaCr');
  assert.equal(fractionalExcretionPotassium({ urineK: '0', plasmaK: '4', urineCr: '100', plasmaCr: '1' }).field, 'urineK');
});
