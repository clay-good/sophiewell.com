// spec-v159 2.1: EDSS (Kurtzke 1983), 0-10 in 0.5 steps. Low range governed by
// the FS-count table; 4.0-9.5 governed by ambulation; the reported step is the
// HIGHER of the two (published precedence).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { edss } from '../../lib/neuro-disability-v159.js';

const FS0 = { pyramidal: 0, cerebellar: 0, brainstem: 0, sensory: 0, bowelBladder: 0, visual: 0, cerebral: 0, other: 0 };

test('tile example: unilateral assistance pins EDSS 6.0', () => {
  const r = edss({ ...FS0, pyramidal: 2, sensory: 1, ambulation: 'unilateral-100' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 6.0);
  assert.equal(r.abnormal, true);
});

test('FS table governs the low range when fully ambulatory', () => {
  assert.equal(edss({ ...FS0, ambulation: 'unrestricted' }).score, 0);
  assert.equal(edss({ ...FS0, pyramidal: 1, ambulation: 'unrestricted' }).score, 1.0); // one FS grade 1
  assert.equal(edss({ ...FS0, pyramidal: 1, sensory: 1, ambulation: 'unrestricted' }).score, 1.5); // >1 FS grade 1
  assert.equal(edss({ ...FS0, pyramidal: 2, ambulation: 'unrestricted' }).score, 2.0); // one FS grade 2
  assert.equal(edss({ ...FS0, pyramidal: 2, sensory: 2, ambulation: 'unrestricted' }).score, 2.5); // two FS grade 2
});

test('higher-of precedence: a wheelchair pins 7.0 even with low FS', () => {
  const r = edss({ ...FS0, pyramidal: 1, ambulation: 'wheelchair-5' });
  assert.equal(r.score, 7.0); // ambulation 7.0 > FS step 1.0
  assert.equal(r.ambulationStep, 7.0);
  assert.equal(r.fsStep, 1.0);
});

test('ambulation anchors map across the mid/high range', () => {
  assert.equal(edss({ ...FS0, ambulation: 'walk-300' }).score, 4.5);
  assert.equal(edss({ ...FS0, ambulation: 'bilateral-20' }).score, 6.5);
  assert.equal(edss({ ...FS0, ambulation: 'helpless-nocomm' }).score, 9.5);
  assert.equal(edss({ ...FS0, ambulation: 'death' }).score, 10);
});

test('missing ambulation or an FS grade falls back', () => {
  assert.equal(edss({ ...FS0 }).valid, false); // no ambulation
  assert.equal(edss({ ambulation: 'unrestricted', pyramidal: 1 }).valid, false); // FS grades incomplete
  assert.equal(edss({}).valid, false);
});
