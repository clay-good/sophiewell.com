// spec-v55 §2.11: Urine Anion Gap (non-gap metabolic acidosis discriminator).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { urineAnionGap } from '../../lib/clinical-v6.js';

test('uag negative -> GI bicarbonate loss: 40 + 30 - 90 = -20', () => {
  const r = urineAnionGap({ urineNa: 40, urineK: 30, urineCl: 90 });
  assert.equal(r.uag, -20);
  assert.match(r.band, /GI bicarbonate loss/);
});

test('uag positive -> RTA: 50 + 20 - 40 = +30', () => {
  const r = urineAnionGap({ urineNa: 50, urineK: 20, urineCl: 40 });
  assert.equal(r.uag, 30);
  assert.match(r.band, /renal tubular acidosis/);
});

test('uag zero boundary: 30 + 25 - 55 = 0 (impaired-excretion side)', () => {
  const r = urineAnionGap({ urineNa: 30, urineK: 25, urineCl: 55 });
  assert.equal(r.uag, 0);
  assert.match(r.band, /Positive/);
});

test('uag rejects impossible input', () => {
  assert.throws(() => urineAnionGap({ urineNa: NaN, urineK: 25, urineCl: 55 }), /urineNa/);
});
