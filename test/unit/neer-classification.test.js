// spec-v144 2.6: Neer proximal-humerus classification (Neer 1970). Part count
// = 1 + displaced segments; an undisplaced fracture is one-part.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { neerClassification } from '../../lib/ortho-v144.js';

test('no displaced segments -> one-part (regardless of fracture lines)', () => {
  const r = neerClassification({});
  assert.equal(r.valid, true);
  assert.equal(r.classification, 'one-part');
  assert.equal(r.parts, 1);
  assert.equal(r.abnormal, false);
});

test('one displaced segment -> two-part', () => {
  const r = neerClassification({ greaterTuberosity: 1 });
  assert.equal(r.classification, 'two-part');
  assert.equal(r.parts, 2);
});

test('two displaced segments -> three-part, abnormal', () => {
  const r = neerClassification({ greaterTuberosity: 1, shaft: 1 });
  assert.equal(r.classification, 'three-part');
  assert.equal(r.parts, 3);
  assert.equal(r.abnormal, true);
  assert.deepEqual(r.displaced, ['greater tuberosity', 'surgical neck / shaft']);
});

test('all four displaced -> four-part', () => {
  const r = neerClassification({ articular: 1, greaterTuberosity: 1, lesserTuberosity: 1, shaft: 1 });
  assert.equal(r.classification, 'four-part');
  assert.equal(r.parts, 4);
});

test('fracture-dislocation flips abnormal even at one-part', () => {
  const r = neerClassification({ dislocation: 1 });
  assert.equal(r.classification, 'one-part');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /dislocation/i);
});
