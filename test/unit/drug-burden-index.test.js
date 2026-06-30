// spec-v179 §2.3: DBI = sum D/(D + delta); delta>0-guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drugBurdenIndex as dbi } from '../../lib/ltcga-v179.js';

test('DBI sums D/(D + delta) across drugs', () => {
  const r = dbi({ drugs: [{ dose: '10', minDose: '5' }, { dose: '4', minDose: '4' }] });
  assert.equal(r.valid, true);
  assert.equal(r.value, 1.17); // 0.667 + 0.5 rounded
  assert.equal(r.drugs, 2);
});

test('DBI single drug D=delta contributes 0.5', () => {
  assert.equal(dbi({ drugs: [{ dose: '5', minDose: '5' }] }).value, 0.5);
});

test('DBI blank rows skipped; needs at least one complete drug', () => {
  assert.equal(dbi({ drugs: [{ dose: '', minDose: '' }, { dose: '8', minDose: '4' }] }).value, 0.67);
  assert.equal(dbi({ drugs: [{ dose: '', minDose: '' }] }).valid, false);
  assert.equal(dbi({ drugs: [] }).valid, false);
});

test('DBI guards a partial row and a non-positive delta (never Infinity/NaN)', () => {
  assert.equal(dbi({ drugs: [{ dose: '10', minDose: '' }] }).valid, false);
  assert.equal(dbi({ drugs: [{ dose: '10', minDose: '0' }] }).valid, false);
  assert.equal(dbi({ drugs: [{ dose: '10', minDose: '-2' }] }).valid, false);
});
