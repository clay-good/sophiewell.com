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

test('sub-scores clamp to their ranges (out-of-range values do not over-count)', () => {
  const r = rdaiTal({ wheezeExp: 9, wheezeInsp: 9, wheezeLoc: 9, retSupraclav: 9, retIntercostal: 9, retSubcostal: 9 });
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
