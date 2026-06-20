// spec-v122 2.1: Hachinski Ischemic Score (Hachinski 1975). 13 weighted items
// (five score 2, eight score 1), max 18; <= 4 degenerative, 5-6 indeterminate,
// >= 7 vascular.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hachinski } from '../../lib/neuro-v122.js';

test('no features -> 0/18, degenerative band', () => {
  const r = hachinski({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /favors a primary degenerative/);
});

test('stepwise deterioration scores 1 (source correction, not 2)', () => {
  assert.equal(hachinski({ stepwise: true }).total, 1);
});

test('a single 2-point item scores 2', () => {
  assert.equal(hachinski({ abruptOnset: true }).total, 2);
});

test('degenerative-vs-vascular band-flip at the 4/7 boundary', () => {
  // four 1-point items -> 4, still degenerative
  const four = hachinski({ stepwise: true, nocturnal: true, depression: true, somatic: true });
  assert.equal(four.total, 4);
  assert.equal(four.abnormal, false);
  // four 2-point items -> 8, vascular
  const eight = hachinski({ abruptOnset: true, fluctuating: true, strokeHistory: true, focalSymptoms: true });
  assert.equal(eight.total, 8);
  assert.equal(eight.abnormal, true);
  assert.match(eight.band, /favors a vascular/);
});

test('indeterminate band 5-6', () => {
  const r = hachinski({ abruptOnset: true, fluctuating: true, depression: true }); // 2+2+1 = 5
  assert.equal(r.total, 5);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /indeterminate or mixed/);
});

test('all 13 items -> maximum 18', () => {
  const all = {};
  for (const k of ['abruptOnset', 'stepwise', 'fluctuating', 'nocturnal', 'preservedPersonality', 'depression', 'somatic', 'emotionalIncontinence', 'hypertension', 'strokeHistory', 'atherosclerosis', 'focalSymptoms', 'focalSigns']) all[k] = true;
  assert.equal(hachinski(all).total, 18);
});

test('scalar / non-object fuzz arg yields a valid 0/18, never NaN', () => {
  const r = hachinski(9);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(Number.isFinite(r.total), true);
});
