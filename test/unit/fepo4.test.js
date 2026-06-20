// spec-v128 2.1: FEPO4 (Walton-Bijvoet 1975). FEPO4 (%) = (urine PO4 x plasma Cr)
// / (plasma PO4 x urine Cr) x 100. In hypophosphatemia, > ~5% suggests renal
// phosphate wasting; <= 5% an extra-renal / redistributive cause.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fepo4 } from '../../lib/renal-v128.js';

test('worked example crossing the renal-wasting threshold', () => {
  const r = fepo4({ urinePhos: 30, plasmaPhos: 1.5, urineCr: 60, plasmaCr: 1.0 });
  assert.equal(r.valid, true);
  assert.equal(r.fe, 33.3);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /renal phosphate wasting/);
});

test('low FE -> appropriate conservation (extra-renal loss)', () => {
  const r = fepo4({ urinePhos: 2, plasmaPhos: 3.0, urineCr: 80, plasmaCr: 1.0 });
  assert.equal(r.fe, 0.8);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /renal conservation/);
});

test('exactly at 5% does not flip (strict greater-than)', () => {
  // (5 x 1) / (1 x 100) x 100 = 5.0
  const r = fepo4({ urinePhos: 5, plasmaPhos: 1.0, urineCr: 100, plasmaCr: 1.0 });
  assert.equal(r.fe, 5);
  assert.equal(r.abnormal, false);
});

test('zero / missing denominator term -> valid:false (no divide-by-zero)', () => {
  assert.equal(fepo4({ urinePhos: 30, plasmaPhos: 0, urineCr: 60, plasmaCr: 1.0 }).valid, false);
  assert.equal(fepo4({ urinePhos: 30, plasmaPhos: 1.5, urineCr: 0, plasmaCr: 1.0 }).valid, false);
  assert.equal(fepo4({}).valid, false);
  assert.equal(fepo4(7).valid, false);
});
