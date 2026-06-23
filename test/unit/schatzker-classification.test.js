// spec-v144 2.4: Schatzker tibial-plateau classification (Schatzker 1979).
// Types I-VI; low-energy I-III vs high-energy IV-VI.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schatzkerClassification } from '../../lib/ortho-v144.js';

test('blank -> complete-the-fields fallback', () => {
  assert.equal(schatzkerClassification({}).valid, false);
});

test('lateral split -> Type I, low-energy', () => {
  const r = schatzkerClassification({ pattern: 'lateralSplit' });
  assert.equal(r.classification, 'I');
  assert.equal(r.abnormal, false);
});

test('lateral split-depression -> Type II', () => {
  assert.equal(schatzkerClassification({ pattern: 'lateralSplitDepression' }).classification, 'II');
});

test('III -> IV low-energy -> high-energy boundary', () => {
  assert.equal(schatzkerClassification({ pattern: 'lateralDepression' }).abnormal, false); // III low
  assert.equal(schatzkerClassification({ pattern: 'medial' }).abnormal, true);             // IV high
});

test('bicondylar -> V and dissociation -> VI, both high-energy', () => {
  assert.equal(schatzkerClassification({ pattern: 'bicondylar' }).classification, 'V');
  const vi = schatzkerClassification({ pattern: 'dissociation' });
  assert.equal(vi.classification, 'VI');
  assert.equal(vi.abnormal, true);
});
