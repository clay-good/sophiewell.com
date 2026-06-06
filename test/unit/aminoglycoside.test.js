// spec-v56 §2.3: extended-interval aminoglycoside (Hartford), CrCl interval.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aminoglycoside } from '../../lib/medication-v5.js';

test('gentamicin 70 kg, CrCl 80 -> 490 mg q24h', () => {
  const r = aminoglycoside({ drug: 'gentamicin', weightKg: 70, crCl: 80 });
  assert.equal(r.doseMg, 490);
  assert.equal(r.interval, 'q24h');
  assert.equal(r.mgkg, 7);
});

test('amikacin uses 15 mg/kg', () => {
  const r = aminoglycoside({ drug: 'amikacin', weightKg: 60, crCl: 90 });
  assert.equal(r.doseMg, 900);
});

test('CrCl bands set q36h (40-59) and q48h (20-39)', () => {
  assert.equal(aminoglycoside({ drug: 'tobramycin', weightKg: 70, crCl: 50 }).interval, 'q36h');
  assert.equal(aminoglycoside({ drug: 'tobramycin', weightKg: 70, crCl: 30 }).interval, 'q48h');
});

test('REFUSES dialysis and CrCl <20 (validity-window guard)', () => {
  assert.throws(() => aminoglycoside({ drug: 'gentamicin', weightKg: 70, crCl: 80, dialysis: true }), /Dialysis/);
  assert.throws(() => aminoglycoside({ drug: 'gentamicin', weightKg: 70, crCl: 10 }), /CrCl <20/);
});

test('rejects unknown drug and impossible weight', () => {
  assert.throws(() => aminoglycoside({ drug: 'vancomycin', weightKg: 70, crCl: 80 }), /drug must be/);
  assert.throws(() => aminoglycoside({ drug: 'gentamicin', weightKg: 0, crCl: 80 }), /weightKg/);
});
