// spec-v675: Altman Self-Rating Mania Scale (ASRM).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { asrmMania } from '../../lib/asrm-mania-v675.js';

const Z = { mood: '0', confidence: '0', sleep: '0', speech: '0', activity: '0' };

test('all zero -> 0/20 negative screen', () => {
  const r = asrmMania(Z);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.positive, false);
  assert.equal(r.abnormal, false);
});

test('sums the five items', () => {
  const r = asrmMania({ mood: '4', confidence: '4', sleep: '4', speech: '4', activity: '4' });
  assert.equal(r.total, 20);
  assert.equal(r.positive, true);
});

test('threshold is exactly >= 6 (5 negative, 6 positive)', () => {
  assert.equal(asrmMania({ ...Z, mood: '3', confidence: '2' }).total, 5);
  assert.equal(asrmMania({ ...Z, mood: '3', confidence: '2' }).positive, false);
  assert.equal(asrmMania({ ...Z, mood: '3', confidence: '3' }).total, 6);
  assert.equal(asrmMania({ ...Z, mood: '3', confidence: '3' }).positive, true);
});

test('META example: mood 3, confidence 2, sleep 1, speech 1, activity 1 -> 8/20 positive', () => {
  const r = asrmMania({ mood: '3', confidence: '2', sleep: '1', speech: '1', activity: '1' });
  assert.equal(r.total, 8);
  assert.equal(r.positive, true);
  assert.match(r.band, /ASRM 8\/20/);
  assert.match(r.band, /positive screen/);
});

test('each item is a required integer 0-4', () => {
  assert.equal(asrmMania({}).valid, false);
  assert.equal(asrmMania({}).code, 'MISSING_INPUT');
  assert.equal(asrmMania({ ...Z, mood: '5' }).field, 'mood');
  assert.equal(asrmMania({ ...Z, sleep: '' }).field, 'sleep');
  assert.equal(asrmMania({ ...Z, activity: '2.5' }).valid, false);
});
