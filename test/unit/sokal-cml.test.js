// spec-v94 §2.5: Sokal relative risk + ELTS score for CML.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sokalCml } from '../../lib/hemonc-v94.js';

test('worked example: both intermediate', () => {
  const r = sokalCml({ age: 50, spleen: 5, platelets: 300, blasts: 2 });
  assert.equal(r.sokal, 0.91);
  assert.equal(r.sokalBand, 'intermediate');
  assert.equal(r.elts, 1.58);
  assert.equal(r.eltsBand, 'intermediate');
  assert.match(r.band, /Sokal relative risk 0.91 \(intermediate risk\); ELTS 1.58 \(intermediate risk\)\./);
});

test('Sokal band edges around 0.8 and 1.2', () => {
  // Young, no spleen, normal platelets, no blasts -> low Sokal (< 0.8).
  const low = sokalCml({ age: 30, spleen: 0, platelets: 300, blasts: 0 });
  assert.equal(low.sokalBand, 'low');
  assert.ok(low.sokal < 0.8);
  // Older, splenomegaly, high blasts -> high Sokal (> 1.2).
  const high = sokalCml({ age: 75, spleen: 15, platelets: 600, blasts: 10 });
  assert.equal(high.sokalBand, 'high');
  assert.ok(high.sokal > 1.2);
});

test('ELTS band edges around 1.5680 and 2.2185', () => {
  const low = sokalCml({ age: 30, spleen: 0, platelets: 400, blasts: 0 });
  assert.equal(low.eltsBand, 'low');
  const high = sokalCml({ age: 80, spleen: 20, platelets: 100, blasts: 15 });
  assert.equal(high.eltsBand, 'high');
});

test('guarded domains: zero/negative platelet returns a surfaced fallback', () => {
  assert.equal(sokalCml({ age: 50, spleen: 5, platelets: 0, blasts: 2 }).valid, false);
  assert.equal(sokalCml({ age: 50, spleen: 5, platelets: -10, blasts: 2 }).valid, false);
  assert.equal(sokalCml({}).valid, false);
});

test('extreme age does not leak a non-finite Sokal', () => {
  const r = sokalCml({ age: 1e9, spleen: 5, platelets: 300, blasts: 2 });
  // Sokal overflows -> null; ELTS still finite, so the result stays valid.
  assert.equal(r.sokal, null);
  assert.ok(Number.isFinite(r.elts));
});
