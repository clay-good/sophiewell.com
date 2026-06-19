// spec-v108 2.5: GCS-Pupils (Brennan 2018). GCS-P = GCS - pupil penalty, 1-15.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gcsPupils } from '../../lib/trauma-v108.js';

test('out-of-range / missing GCS -> fallback', () => {
  assert.equal(gcsPupils({}).valid, false);
  assert.equal(gcsPupils({ gcs: 2 }).valid, false);
  assert.equal(gcsPupils({ gcs: 16 }).valid, false);
});

test('both pupils reactive: GCS-P equals GCS', () => {
  const r = gcsPupils({ gcs: 14, pupils: 0 });
  assert.equal(r.index, 14);
  assert.equal(r.prs, 0);
});

test('band flip: one unreactive pupil drops the index by 1', () => {
  const zero = gcsPupils({ gcs: 6, pupils: 0 });
  assert.equal(zero.index, 6);
  const one = gcsPupils({ gcs: 6, pupils: 1 });
  assert.equal(one.index, 5);
  assert.match(one.band, /GCS-P 5/);
});

test('index bounded to 1: GCS 3 with both pupils unreactive -> 1', () => {
  const r = gcsPupils({ gcs: 3, pupils: 2 });
  assert.equal(r.index, 1); // 3 - 2 = 1, not below
});

test('severe range flag at <= 8', () => {
  assert.equal(gcsPupils({ gcs: 9, pupils: 0 }).severe, false);
  assert.equal(gcsPupils({ gcs: 8, pupils: 0 }).severe, true);
});

test('pupils default to 0 when not given', () => {
  const r = gcsPupils({ gcs: 15 });
  assert.equal(r.index, 15);
  assert.equal(r.prs, 0);
});
