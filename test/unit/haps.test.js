// spec-v126 2.4: HAPS (Lankisch 2009). 3-criterion gate; all normal -> harmless.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haps } from '../../lib/gi-v126.js';

test('all normal -> harmless', () => {
  const r = haps({ peritonitis: false, female: false, hct: 40, creatinine: 1.0 });
  assert.equal(r.valid, true);
  assert.equal(r.harmless, true);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /harmless/);
});

test('peritonitis present -> not harmless', () => {
  const r = haps({ peritonitis: true, hct: 40, creatinine: 1.0 });
  assert.equal(r.harmless, false);
  assert.match(r.band, /rebound\/guarding/);
});

test('strict < thresholds: Hct 43 (male) is abnormal', () => {
  assert.equal(haps({ hct: 43, creatinine: 1.0 }).harmless, false);
  assert.equal(haps({ hct: 42.9, creatinine: 1.0 }).harmless, true);
});

test('female Hct threshold is 39.6', () => {
  assert.equal(haps({ female: true, hct: 40, creatinine: 1.0 }).harmless, false);
  assert.equal(haps({ female: true, hct: 39, creatinine: 1.0 }).harmless, true);
});

test('creatinine >= 2 is abnormal; missing -> valid:false', () => {
  assert.equal(haps({ hct: 40, creatinine: 2.0 }).harmless, false);
  assert.equal(haps({ hct: 40 }).valid, false);
  assert.equal(haps(9).valid, false);
});
