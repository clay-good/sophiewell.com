// spec-v659: ISGPS grading of delayed gastric emptying.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isgpsDge } from '../../lib/isgps-dge-v659.js';

test('no criterion met = no DGE', () => {
  const r = isgpsDge({});
  assert.equal(r.valid, true);
  assert.equal(r.grade, 0);
  assert.equal(r.code, 'No DGE');
  assert.equal(isgpsDge({ ngtDays: '3', reinsertionPod: '3', unableSolidsPod: '6' }).grade, 0);
});

test('NGT duration binning: 4-7 = A, 8-14 = B, >14 = C', () => {
  assert.equal(isgpsDge({ ngtDays: '4' }).grade, 1);
  assert.equal(isgpsDge({ ngtDays: '7' }).grade, 1);
  assert.equal(isgpsDge({ ngtDays: '8' }).grade, 2);
  assert.equal(isgpsDge({ ngtDays: '14' }).grade, 2);
  assert.equal(isgpsDge({ ngtDays: '15' }).grade, 3);
});

test('NGT reinsertion binning: after POD 3 = A, after POD 7 = B, after POD 14 = C', () => {
  assert.equal(isgpsDge({ reinsertionPod: '3' }).grade, 0); // "after POD 3" means > 3
  assert.equal(isgpsDge({ reinsertionPod: '4' }).grade, 1);
  assert.equal(isgpsDge({ reinsertionPod: '8' }).grade, 2);
  assert.equal(isgpsDge({ reinsertionPod: '15' }).grade, 3);
});

test('unable-to-tolerate-solids binning: POD 7 = A, POD 14 = B, POD 21 = C', () => {
  assert.equal(isgpsDge({ unableSolidsPod: '6' }).grade, 0);
  assert.equal(isgpsDge({ unableSolidsPod: '7' }).grade, 1);
  assert.equal(isgpsDge({ unableSolidsPod: '14' }).grade, 2);
  assert.equal(isgpsDge({ unableSolidsPod: '21' }).grade, 3);
});

test('most severe grade across criteria wins', () => {
  const r = isgpsDge({ ngtDays: '5', reinsertionPod: '8', unableSolidsPod: '7' }); // A, B, A -> B
  assert.equal(r.grade, 2);
  assert.equal(r.code, 'Grade B');
  const r2 = isgpsDge({ ngtDays: '5', unableSolidsPod: '21' }); // A, C -> C
  assert.equal(r2.grade, 3);
});

test('META example: NGT 10 days = Grade B', () => {
  const r = isgpsDge({ ngtDays: '10' });
  assert.equal(r.grade, 2);
  assert.equal(r.code, 'Grade B');
  assert.match(r.bandLabel, /Grade B/);
});

test('negative or non-numeric entry is rejected', () => {
  assert.equal(isgpsDge({ ngtDays: '-1' }).valid, false);
  assert.equal(isgpsDge({ ngtDays: 'x' }).valid, false);
  assert.equal(isgpsDge({ ngtDays: '-1' }).code, 'OUT_OF_RANGE');
});
