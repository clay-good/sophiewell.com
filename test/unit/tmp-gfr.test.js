// spec-v204 2.5: TmP/GFR worked examples crossing the 0.86 TRP branch point.
// TRP = 1 - (U_P*S_Cr)/(S_P*U_Cr); TmP/GFR = TRP*S_P (TRP<=0.86) else Payne
// hyperbolic. Branches + constants spec-v97 cross-verified (Payne 1998, ESPN,
// Walton/Bijvoet nomogram).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tmpGfr } from '../../lib/nephro-fluids-v204.js';

test('TRP > 0.86 -> hyperbolic branch (worked example)', () => {
  const r = tmpGfr({ serumP: 1.2, urineP: 15, serumCr: 0.09, urineCr: 9 });
  assert.equal(r.valid, true);
  assert.equal(r.trp, 0.875);
  assert.equal(r.score, 1.05);
  assert.match(r.band, /hyperbolic/);
});

test('TRP <= 0.86 -> linear branch (phosphate wasting)', () => {
  const r = tmpGfr({ serumP: 0.7, urineP: 30, serumCr: 0.09, urineCr: 9 });
  assert.equal(r.trp, 0.571);
  assert.equal(r.score, 0.4); // 0.5714 * 0.7
  assert.match(r.band, /linear/);
});

test('linear branch equals TRP * serum phosphate', () => {
  const r = tmpGfr({ serumP: 1.0, urineP: 20, serumCr: 0.09, urineCr: 9 });
  const trp = 1 - (20 * 0.09) / (1.0 * 9);
  assert.ok(trp <= 0.86);
  assert.equal(r.score, Math.round(trp * 1.0 * 100) / 100);
});

test('non-positive TRP -> guarded (bad values/units)', () => {
  const r = tmpGfr({ serumP: 1.0, urineP: 200, serumCr: 0.09, urineCr: 9 });
  assert.equal(r.valid, false);
  assert.match(r.message, /reabsorption/);
});

test('zero denominator -> complete-the-fields', () => {
  const r = tmpGfr({ serumP: 0, urineP: 15, serumCr: 0.09, urineCr: 9 });
  assert.equal(r.valid, false);
});
