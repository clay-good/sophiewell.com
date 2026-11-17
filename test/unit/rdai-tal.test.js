// spec-v140 2.3: RDAI (Lowell 1987) 0-17 + optional Tal score (Tal 1983) 0-12.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rdaiTal } from '../../lib/peds-v140.js';

test('worked example -> RDAI 12/17, Tal 7/12 moderate', () => {
  const r = rdaiTal({ wheezeExp: 3, wheezeInsp: 2, wheezeLoc: 2, retSupraclav: 2, retIntercostal: 2, retSubcostal: 1, talRr: 2, talWheeze: 2, talCyanosis: 1, talAccessory: 2 });
  assert.equal(r.rdai, 12);
  assert.equal(r.tal, 7);
  assert.match(r.band, /Tal respiratory score 7\/12: moderate/);
});

test('RDAI max = 17', () => {
  const r = rdaiTal({ wheezeExp: 4, wheezeInsp: 2, wheezeLoc: 2, retSupraclav: 3, retIntercostal: 3, retSubcostal: 3 });
  assert.equal(r.rdai, 17);
  assert.equal(r.abnormal, true);
});

test('Tal omitted when no Tal input is entered', () => {
  const r = rdaiTal({ wheezeExp: 2, retSubcostal: 1 });
  assert.equal(r.rdai, 3);
  assert.equal(r.tal, null);
  assert.ok(!/Tal respiratory score/.test(r.band));
});

test('out-of-range sub-scores are refused (spec-v1755; once clamped to their ranges)', () => {
  assert.equal(rdaiTal({ wheezeExp: 9, wheezeInsp: 9, wheezeLoc: 9, retSupraclav: 9, retIntercostal: 9, retSubcostal: 9 }).valid, false);
  const r = rdaiTal({ wheezeExp: 4, wheezeInsp: 2, wheezeLoc: 2, retSupraclav: 3, retIntercostal: 3, retSubcostal: 3 });
  assert.equal(r.rdai, 17); // 4 + 2 + 2 + 3 + 3 + 3
});

test('Tal severe band at 9-12', () => {
  const r = rdaiTal({ talRr: 3, talWheeze: 3, talCyanosis: 3, talAccessory: 1 });
  assert.equal(r.tal, 10);
  assert.match(r.band, /severe/);
  assert.equal(r.abnormal, true);
});

test('empty input -> RDAI 0, no Tal', () => {
  const r = rdaiTal({});
  assert.equal(r.rdai, 0);
  assert.equal(r.tal, null);
});

test('spec-v1755: a half-step RDAI or Tal item is refused, not rounded', () => {
  const ex = { wheezeExp: 3, wheezeInsp: 2, wheezeLoc: 2, retSupraclav: 2, retIntercostal: 2, retSubcostal: 1, talRr: 2, talWheeze: 2, talCyanosis: 1, talAccessory: 2 };
  const base = rdaiTal(ex);
  assert.equal(base.rdai, 12); assert.equal(base.tal, 7);
  const r = rdaiTal({ ...ex, wheezeExp: 3.5 });
  assert.equal(r.valid, false);
  assert.match(r.message, /expiratory wheeze must be a whole number/);
  assert.equal(rdaiTal({ ...ex, talCyanosis: 1.5 }).valid, false);
  assert.equal(rdaiTal({ ...ex, wheezeExp: 4 }).rdai, 13);
});
