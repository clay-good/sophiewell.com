// spec-v161 2.1: Aldosterone-Renin Ratio (Endocrine Society 2016). Unit
// discipline is the dominant concern: the cutoff differs by renin unit and is
// never compared across unit systems. Renin guarded > 0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arr } from '../../lib/endo-metab-v161.js';

test('tile example: PRA unit, positive screen', () => {
  // 22 / 0.5 = 44 ; >= 30 cutoff and aldosterone >= 15 -> positive
  const r = arr({ aldosterone: 22, renin: 0.5, reninUnit: 'pra' });
  assert.equal(r.valid, true);
  assert.equal(r.ratio, 44);
  assert.equal(r.positive, true);
});

test('a high ratio with low aldosterone is NOT a positive screen', () => {
  // 12 / 0.3 = 40 (ratio high) but aldosterone 12 < 15 -> not positive
  const r = arr({ aldosterone: 12, renin: 0.3, reninUnit: 'pra' });
  assert.equal(r.ratio, 40);
  assert.equal(r.positive, false);
});

test('DRC unit uses its own cutoff (~3.7), not the PRA cutoff', () => {
  // 20 / 4 = 5 ; >= 3.7 DRC cutoff and aldosterone >= 15 -> positive
  const r = arr({ aldosterone: 20, renin: 4, reninUnit: 'drc' });
  assert.equal(r.ratio, 5);
  assert.equal(r.positive, true);
  // The same ratio of 5 under the PRA cutoff of 30 would NOT be positive.
  const pra = arr({ aldosterone: 20, renin: 4, reninUnit: 'pra' });
  assert.equal(pra.positive, false);
});

test('guards: renin > 0; unit required; blanks fall back', () => {
  assert.equal(arr({ aldosterone: 22, renin: 0, reninUnit: 'pra' }).valid, false);
  assert.equal(arr({ aldosterone: 22, renin: 0.5 }).valid, false); // no unit
  assert.equal(arr({}).valid, false);
});
