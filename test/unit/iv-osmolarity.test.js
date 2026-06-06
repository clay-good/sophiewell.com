// spec-v61 §3.9: IV / PN osmolarity + central-line flag.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ivOsmolarity } from '../../lib/clinical-v7.js';

test('example: D5 / AA 2.5 / Na 30 / K 20 = 600 mOsm/L peripheral', () => {
  const r = ivOsmolarity({ dextrosePct: 5, aminoAcidPct: 2.5, naMeqL: 30, kMeqL: 20 });
  assert.equal(r.osmolarity, 600);
  assert.equal(r.central, false);
});
test('central threshold: D10 / AA 4.25 / Na 35 / K 30 = 1055 -> central', () => {
  const r = ivOsmolarity({ dextrosePct: 10, aminoAcidPct: 4.25, naMeqL: 35, kMeqL: 30 });
  assert.equal(r.osmolarity, 1055);
  assert.equal(r.central, true);
});
test('all-zero inputs -> 0 mOsm/L, peripheral (no throw, finite)', () => {
  assert.equal(ivOsmolarity({ dextrosePct: 0, aminoAcidPct: 0, naMeqL: 0, kMeqL: 0 }).osmolarity, 0);
});
