// spec-v129 2.2: standard base excess (Siggaard-Andersen Van Slyke equation,
// NCCLS constants). BE = (1 - 0.0143*Hb) * (HCO3 - 24.8 + (9.5 + 1.63*Hb) *
// (pH - 7.4)), Hb in g/dL. Negative = base deficit; positive = base excess;
// sign flips at zero.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baseExcess } from '../../lib/acidbase-v129.js';

test('neutral gas (pH 7.4, HCO3 24.8) -> base excess 0', () => {
  const r = baseExcess({ ph: 7.4, bicarbonate: 24.8, hemoglobin: 15 });
  assert.equal(r.valid, true);
  assert.equal(r.be, 0);
  assert.match(r.band, /neutral/);
});

test('metabolic acidosis -> negative base deficit (sign below 0)', () => {
  const r = baseExcess({ ph: 7.2, bicarbonate: 15, hemoglobin: 15 });
  assert.equal(r.be, -13); // matches NCCLS worked value
  assert.equal(r.abnormal, true);
  assert.match(r.band, /base deficit/);
});

test('metabolic alkalosis -> positive base excess (sign above 0)', () => {
  const r = baseExcess({ ph: 7.55, bicarbonate: 34, hemoglobin: 14 });
  assert.equal(r.be, 11.2);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /base excess/);
});

test('any blank field -> valid:false; scalar -> valid:false', () => {
  assert.equal(baseExcess({ ph: 7.4, bicarbonate: 24 }).valid, false);
  assert.equal(baseExcess({ ph: 7.4, hemoglobin: 15 }).valid, false);
  assert.equal(baseExcess(0).valid, false);
});
