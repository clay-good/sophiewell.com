// spec-v796: EU-TIRADS.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { euTirads } from '../../lib/eu-tirads-v796.js';

const HIGH_RISK = ['tallerThanWide', 'irregularMargins', 'microcalcifications', 'markedHypoechogenicity'];

test('the basic appearances map to their categories', () => {
  assert.equal(euTirads({ appearance: 'no-nodule' }).category, 1);
  assert.equal(euTirads({ appearance: 'benign' }).category, 2);
  assert.equal(euTirads({ appearance: 'iso-hyperechoic' }).category, 3);
  assert.equal(euTirads({ appearance: 'mildly-hypoechoic' }).category, 4);
});

test('ANY single high-risk feature overrides the appearance to category 5', () => {
  for (const f of HIGH_RISK) {
    assert.equal(euTirads({ appearance: 'benign', [f]: true }).category, 5, f);
    assert.equal(euTirads({ appearance: 'iso-hyperechoic', [f]: true }).category, 5, f);
  }
});

test('the FNA thresholds shrink as suspicion rises', () => {
  assert.equal(euTirads({ appearance: 'benign' }).fnaThresholdMm, null);
  assert.equal(euTirads({ appearance: 'iso-hyperechoic' }).fnaThresholdMm, 20);
  assert.equal(euTirads({ appearance: 'mildly-hypoechoic' }).fnaThresholdMm, 15);
  assert.equal(euTirads({ appearance: 'benign', microcalcifications: true }).fnaThresholdMm, 10);
});

test('the threshold is ABOVE, so a nodule exactly at it is not indicated on size', () => {
  assert.equal(euTirads({ appearance: 'iso-hyperechoic', sizeMm: 20 }).fnaIndicated, false);
  assert.equal(euTirads({ appearance: 'iso-hyperechoic', sizeMm: 20.1 }).fnaIndicated, true);
  assert.equal(euTirads({ appearance: 'mildly-hypoechoic', sizeMm: 15 }).fnaIndicated, false);
  assert.equal(euTirads({ appearance: 'mildly-hypoechoic', sizeMm: 16 }).fnaIndicated, true);
});

test('worked example: a 12 mm nodule that is benign-looking but has microcalcifications', () => {
  const r = euTirads({ appearance: 'benign', microcalcifications: true, sizeMm: 12 });
  assert.equal(r.category, 5);
  assert.equal(r.fnaIndicated, true);
  assert.match(r.band, /EU-TIRADS 5/);
  // The same 12 mm nodule without that feature would need no needle at all.
  assert.equal(euTirads({ appearance: 'benign', sizeMm: 12 }).fnaIndicated, false);
});

test('a category 2 nodule never triggers FNA on size, however large', () => {
  const r = euTirads({ appearance: 'benign', sizeMm: 90 });
  assert.equal(r.fnaIndicated, false);
  assert.equal(r.fnaThresholdMm, null);
});

test('no nodule stays category 1 even if features are ticked by mistake', () => {
  assert.equal(euTirads({ appearance: 'no-nodule', microcalcifications: true }).category, 1);
});

test('an unknown appearance or an off-scale size is rejected', () => {
  assert.equal(euTirads({ appearance: 'spongy' }).field, 'appearance');
  assert.equal(euTirads({ appearance: 'benign', sizeMm: 500 }).field, 'sizeMm');
});
