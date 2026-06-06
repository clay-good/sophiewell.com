// spec-v57 §2.2: WHO AUDIT 10-item.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auditFull } from '../../lib/scoring-v5.js';

test('hazardous zone II (8-15)', () => {
  const r = auditFull({ items: [4, 4, 2, 0, 0, 0, 0, 0, 0, 0] });
  assert.equal(r.total, 10); assert.match(r.band, /Zone II/);
});
test('low-risk zone I', () => {
  const r = auditFull({ items: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0] });
  assert.equal(r.total, 2); assert.match(r.band, /Zone I /);
});
test('boundary 8 is hazardous, 7 is low-risk', () => {
  assert.match(auditFull({ items: [4, 4, 0, 0, 0, 0, 0, 0, 0, 0] }).band, /Zone II/);
  assert.match(auditFull({ items: [4, 3, 0, 0, 0, 0, 0, 0, 0, 0] }).band, /Zone I /);
});
test('dependence zone IV at >=20', () => {
  assert.match(auditFull({ items: [4, 4, 4, 4, 4, 0, 0, 0, 0, 0] }).band, /Zone IV/);
});
test('rejects wrong length and out-of-range', () => {
  assert.throws(() => auditFull({ items: [0, 0, 0] }), /array of 10/);
  assert.throws(() => auditFull({ items: [5, 0, 0, 0, 0, 0, 0, 0, 0, 0] }), /item1/);
});
