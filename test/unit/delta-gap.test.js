// spec-v200 2.4: delta-gap / delta-ratio band crossings and zero-denominator.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deltaGap } from '../../lib/critcare-severity-v200.js';

test('pure high-anion-gap acidosis: ratio in 1 to 2', () => {
  const r = deltaGap({ na: 140, cl: 100, hco3: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 1.29);
  assert.match(r.band, /pure high-anion-gap/);
  assert.equal(r.abnormal, false);
});

test('concurrent non-anion-gap acidosis: ratio below 0.4', () => {
  const r = deltaGap({ na: 140, cl: 115, hco3: 10 });
  assert.equal(r.score, 0.21);
  assert.match(r.band, /non-anion-gap/);
});

test('coexisting metabolic alkalosis: ratio above 2', () => {
  const r = deltaGap({ na: 145, cl: 85, hco3: 5 });
  assert.equal(r.score, 2.26);
  assert.match(r.band, /metabolic alkalosis/);
});

test('albumin correction raises the anion gap', () => {
  const uncorrected = deltaGap({ na: 140, cl: 100, hco3: 20 });
  const corrected = deltaGap({ na: 140, cl: 100, hco3: 20, albumin: 2.0 });
  assert.ok(corrected.score > uncorrected.score);
  assert.match(corrected.detail, /corrected anion gap/);
});

test('bicarbonate not depressed -> no delta ratio, finite output', () => {
  const r = deltaGap({ na: 140, cl: 100, hco3: 26 });
  assert.equal(r.valid, true);
  assert.match(r.band, /No delta ratio/);
  assert.ok(!/NaN|Infinity/.test(r.band));
});

test('missing electrolytes -> complete-the-fields', () => {
  const r = deltaGap({ na: 140 });
  assert.equal(r.valid, false);
  assert.match(r.message, /sodium/);
});
