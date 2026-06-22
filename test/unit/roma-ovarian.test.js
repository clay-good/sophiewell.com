// spec-v139 2.2: ROMA -- Risk of Ovarian Malignancy Algorithm (Moore 2009).
// Logistic predictive index with natural-log marker terms; pre/post cutoffs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { romaOvarian } from '../../lib/gyn-v139.js';

test('postmenopausal high case crosses the 27.7% cut-point', () => {
  const r = romaOvarian({ he4: 150, ca125: 100, postmenopausal: true });
  assert.equal(r.valid, true);
  assert.equal(r.roma, 62.1);
  assert.equal(r.cutoff, 27.7);
  assert.equal(r.abnormal, true);
});

test('premenopausal low case below the 13.1% cut-point', () => {
  const r = romaOvarian({ he4: 50, ca125: 20, postmenopausal: false });
  assert.equal(r.roma, 7.6);
  assert.equal(r.cutoff, 13.1);
  assert.equal(r.abnormal, false);
});

test('postmenopausal low case below its 27.7% cut-point', () => {
  const r = romaOvarian({ he4: 40, ca125: 15, postmenopausal: true });
  assert.equal(r.roma, 9.4);
  assert.equal(r.abnormal, false);
});

test('non-positive marker -> valid:false (ln guarded)', () => {
  assert.equal(romaOvarian({ he4: 0, ca125: 20 }).valid, false);
  assert.equal(romaOvarian({ he4: 50, ca125: -1 }).valid, false);
  assert.equal(romaOvarian({ he4: 50 }).valid, false);
});

test('extreme markers stay finite (overflow-clamped logistic)', () => {
  const r = romaOvarian({ he4: 1e9, ca125: 1e9, postmenopausal: true });
  assert.equal(r.valid, true);
  assert.ok(Number.isFinite(r.roma));
  assert.ok(r.roma >= 0 && r.roma <= 100);
});
