// spec-v274: worked examples for the albumin-to-globulin ratio (A/G). Definition spec-v97
// verified against standard clinical chemistry: A/G = albumin / (total protein - albumin).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agr } from '../../lib/proteins-v274.js';

test('agr: a normal worked example', () => {
  const r = agr({ albumin: 4.0, totalProtein: 7.0 });
  // globulin = 3.0; A/G = 4.0/3.0 = 1.333 -> r2 1.33.
  assert.equal(r.valid, true);
  assert.equal(r.score, 1.33);
  assert.equal(r.globulin, 3);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('Albumin-to-globulin ratio 1.33'));
  assert.ok(r.band.includes('globulin 3 g/dL'));
});

test('agr: a reversed (< 1) ratio is flagged', () => {
  const r = agr({ albumin: 3.0, totalProtein: 7.5 });
  // globulin = 4.5; A/G = 3.0/4.5 = 0.6667 -> r2 0.67.
  assert.equal(r.score, 0.67);
  assert.equal(r.abnormal, true);
});

test('agr: total protein must exceed albumin', () => {
  assert.equal(agr({ albumin: 5.0, totalProtein: 5.0 }).valid, false);
  assert.equal(agr({ albumin: 6.0, totalProtein: 5.0 }).valid, false);
});

test('agr: missing / out-of-range inputs are invalid', () => {
  assert.equal(agr({ albumin: 4.0 }).valid, false);
  assert.equal(agr({}).valid, false);
  assert.equal(agr().valid, false);
});
