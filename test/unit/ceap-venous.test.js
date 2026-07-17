// spec-v356: CEAP clinical classification (C0-C6) of chronic venous disease. Worked-example tests: each
// class and its description, the advanced flag on C4a-C6, the C4a/C4b split, numeric + bare-C4 +
// case-insensitive input, and the invalid-class guard. Classes transcribed from Eklof 2004 (JVS) + the
// 2020 update, cross-verified against StatPearls (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ceapVenous } from '../../lib/ceap-venous-v356.js';

test('C3: edema, not flagged (the META example)', () => {
  const r = ceapVenous({ cls: 'C3' });
  assert.equal(r.valid, true);
  assert.equal(r.ceapClass, 'C3');
  assert.equal(r.advanced, false);
  assert.match(r.band, /edema/);
});

test('C0-C3 are the non-advanced classes', () => {
  for (const c of ['C0', 'C1', 'C2', 'C3']) {
    assert.equal(ceapVenous({ cls: c }).advanced, false, c);
  }
  assert.match(ceapVenous({ cls: 'C1' }).band, /telangiectasias or reticular veins/);
  assert.match(ceapVenous({ cls: 'C2' }).band, /varicose veins/);
});

test('C4a-C6 are the advanced (skin-change / ulcer) classes and flagged', () => {
  for (const c of ['C4a', 'C4b', 'C5', 'C6']) {
    assert.equal(ceapVenous({ cls: c }).advanced, true, c);
  }
  assert.match(ceapVenous({ cls: 'C4a' }).band, /pigmentation or eczema/);
  assert.match(ceapVenous({ cls: 'C4b' }).band, /lipodermatosclerosis/);
  assert.match(ceapVenous({ cls: 'C6' }).band, /active venous ulcer/);
});

test('numeric, bare-C4, and case-insensitive input map to the classes', () => {
  assert.equal(ceapVenous({ cls: 3 }).ceapClass, 'C3');
  assert.equal(ceapVenous({ cls: '6' }).ceapClass, 'C6');
  assert.equal(ceapVenous({ cls: 'c4' }).ceapClass, 'C4a');
  assert.equal(ceapVenous({ cls: 'c4b' }).ceapClass, 'C4b');
});

test('a missing or out-of-range class is invalid', () => {
  assert.equal(ceapVenous({}).valid, false);
  assert.equal(ceapVenous({ cls: 'C7' }).valid, false);
  assert.equal(ceapVenous({ cls: 'C4c' }).valid, false);
});
