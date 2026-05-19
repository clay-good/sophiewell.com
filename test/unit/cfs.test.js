// spec-v12 §3.7.2 wave 12-7: Clinical Frailty Scale boundary examples
// per Rockwood K, et al. CMAJ. 2005;173(5):489-495; Dalhousie 2020 v2
// descriptors.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cfs } from '../../lib/scoring-v4.js';

test('cfs low: level 1 -> Very fit / not frail', () => {
  const r = cfs({ level: 1 });
  assert.equal(r.level, 1);
  assert.equal(r.descriptor, 'Very fit');
  assert.match(r.band, /not frail/);
});

test('cfs level 4 -> vulnerable / pre-frail', () => {
  const r = cfs({ level: 4 });
  assert.match(r.band, /vulnerable/);
});

test('cfs level 6 -> mild-to-moderate frailty', () => {
  const r = cfs({ level: 6 });
  assert.match(r.band, /mild-to-moderate/);
});

test('cfs level 8 -> severe frailty', () => {
  const r = cfs({ level: 8 });
  assert.match(r.band, /severe/);
});

test('cfs level 9 -> approaching end of life', () => {
  const r = cfs({ level: 9 });
  assert.match(r.band, /end of life/);
});

test('cfs clamps out-of-range inputs to 1-9', () => {
  assert.equal(cfs({ level: 0 }).level, 1);
  assert.equal(cfs({ level: 99 }).level, 9);
  assert.equal(cfs({ level: -3 }).level, 1);
});
