// spec-v362: Forrester hemodynamic classification (subsets I-IV) from CI and PCWP. Worked-example
// tests: each subset from its CI/PCWP quadrant, the warm/cold and dry/wet cutoffs (CI 2.2, PCWP 18),
// the flag on subsets II-IV, and the guards. Cutoffs/mortality transcribed from Forrester, Diamond &
// Swan 1977, cross-verified against cardiology references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forresterHemodynamic } from '../../lib/forrester-hemodynamic-v362.js';

test('subset IV: CI 1.8 / PCWP 24 -> cold and wet, flagged (the META example)', () => {
  const r = forresterHemodynamic({ ci: '1.8', pcwp: '24' });
  assert.equal(r.valid, true);
  assert.equal(r.subset, 'IV');
  assert.equal(r.profile, 'cold and wet');
  assert.equal(r.abnormal, true);
  assert.equal(r.mortality, '~55.5%');
  assert.match(r.band, /1\.8/);
  assert.match(r.band, /24/);
});

test('the four quadrants map to subsets I-IV', () => {
  assert.equal(forresterHemodynamic({ ci: 3.0, pcwp: 12 }).subset, 'I');   // warm & dry
  assert.equal(forresterHemodynamic({ ci: 3.0, pcwp: 24 }).subset, 'II');  // warm & wet
  assert.equal(forresterHemodynamic({ ci: 1.8, pcwp: 12 }).subset, 'III'); // cold & dry
  assert.equal(forresterHemodynamic({ ci: 1.8, pcwp: 24 }).subset, 'IV');  // cold & wet
});

test('subset I is warm and dry and not flagged; II-IV are flagged', () => {
  assert.equal(forresterHemodynamic({ ci: 3.0, pcwp: 10 }).abnormal, false);
  for (const [ci, pcwp] of [[3.0, 24], [1.8, 10], [1.5, 25]]) {
    assert.equal(forresterHemodynamic({ ci, pcwp }).abnormal, true, `${ci}/${pcwp}`);
  }
});

test('the cutoffs are CI 2.2 (cold below) and PCWP 18 (wet above)', () => {
  // CI exactly 2.2 is warm (>=); PCWP exactly 18 is dry (<=).
  assert.equal(forresterHemodynamic({ ci: 2.2, pcwp: 18 }).subset, 'I');
  // Just below / above flips both.
  assert.equal(forresterHemodynamic({ ci: 2.1, pcwp: 19 }).subset, 'IV');
});

test('missing or implausible inputs are guarded', () => {
  assert.equal(forresterHemodynamic({}).valid, false);
  assert.equal(forresterHemodynamic({ ci: '3.0' }).valid, false);
  assert.equal(forresterHemodynamic({ ci: 'x', pcwp: 12 }).valid, false);
  assert.equal(forresterHemodynamic({ ci: 99, pcwp: 12 }).valid, false);
});
