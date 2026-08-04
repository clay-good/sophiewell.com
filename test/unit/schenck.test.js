// spec-v647: Schenck anatomic classification of knee dislocations.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { schenckKnee } from '../../lib/schenck-v647.js';

test('KD-I: one cruciate torn', () => {
  assert.equal(schenckKnee({ aclTorn: '1' }).gradeFull, 'KD-I');
  assert.equal(schenckKnee({ pclTorn: '1' }).gradeFull, 'KD-I');
  // Even with a collateral, a single cruciate is KD-I.
  assert.equal(schenckKnee({ aclTorn: '1', medialTorn: '1' }).gradeFull, 'KD-I');
});

test('KD-II: both cruciates, collaterals intact', () => {
  assert.equal(schenckKnee({ aclTorn: '1', pclTorn: '1' }).gradeFull, 'KD-II');
});

test('KD-III splits into IIIM (medial) and IIIL (lateral)', () => {
  assert.equal(schenckKnee({ aclTorn: '1', pclTorn: '1', medialTorn: '1' }).gradeFull, 'KD-IIIM');
  assert.equal(schenckKnee({ aclTorn: '1', pclTorn: '1', lateralTorn: '1' }).gradeFull, 'KD-IIIL');
});

test('KD-IV: both cruciates plus both collaterals', () => {
  assert.equal(schenckKnee({ aclTorn: '1', pclTorn: '1', medialTorn: '1', lateralTorn: '1' }).gradeFull, 'KD-IV');
});

test('KD-V: a periarticular fracture makes it KD-V regardless of ligaments', () => {
  assert.equal(schenckKnee({ fracture: '1' }).gradeFull, 'KD-V');
  assert.equal(schenckKnee({ aclTorn: '1', pclTorn: '1', lateralTorn: '1', fracture: '1' }).gradeFull, 'KD-V');
});

test('C and N modifiers append to the grade', () => {
  const r = schenckKnee({ aclTorn: '1', pclTorn: '1', lateralTorn: '1', arterial: '1', nerve: '1' });
  assert.equal(r.gradeFull, 'KD-IIIL-C-N');
  assert.equal(schenckKnee({ aclTorn: '1', pclTorn: '1', nerve: '1' }).gradeFull, 'KD-II-N');
});

test('no cruciate torn and no fracture is not a Schenck KD pattern', () => {
  assert.equal(schenckKnee({}).classified, false);
  assert.equal(schenckKnee({ medialTorn: '1', lateralTorn: '1' }).classified, false);
  assert.equal(schenckKnee({}).valid, true);
});
