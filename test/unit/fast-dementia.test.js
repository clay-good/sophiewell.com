// spec-v173 §2.6 (built as spec-v294): Functional Assessment Staging Tool (FAST) for
// dementia. Worked-example tests: each stage returns its verbatim descriptor,
// the substage ordering, the stage-7a hospice-eligibility threshold (7a+ flags
// the Medicare dementia hospice context, earlier stages do not), the case-
// insensitive stage code, the invalid-stage RangeError, and the empty-input
// guard. Descriptors cross-verified against the CAPC and hospice reproductions
// of Reisberg's FAST (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fastStage } from '../../lib/fast-dementia-v294.js';

test('early stages return their verbatim descriptor without hospice context', () => {
  const s1 = fastStage({ stage: '1' });
  assert.equal(s1.stage, '1');
  assert.equal(s1.hospiceContext, false);
  assert.equal(s1.abnormal, false);
  assert.match(s1.descriptor, /No difficulty/);

  const s3 = fastStage({ stage: '3' });
  assert.match(s3.descriptor, /Decreased job functioning evident to co-workers/);
  assert.equal(s3.hospiceContext, false);

  const s4 = fastStage({ stage: '4' });
  assert.match(s4.descriptor, /Decreased ability to perform complex tasks/);
});

test('stage 6 substages map to dressing/bathing/toileting/incontinence in order', () => {
  assert.match(fastStage({ stage: '6a' }).descriptor, /Difficulty putting on clothes/);
  assert.match(fastStage({ stage: '6b' }).descriptor, /Unable to bathe properly/);
  assert.match(fastStage({ stage: '6c' }).descriptor, /mechanics of toileting/);
  assert.match(fastStage({ stage: '6d' }).descriptor, /Urinary incontinence/);
  assert.match(fastStage({ stage: '6e' }).descriptor, /Fecal incontinence/);
  // Stage 6 is severe but below the 7a hospice-eligibility threshold.
  assert.equal(fastStage({ stage: '6e' }).hospiceContext, false);
});

test('stage 7a and beyond flag the Medicare dementia hospice-eligibility context', () => {
  const s7a = fastStage({ stage: '7a' });
  assert.equal(s7a.hospiceContext, true);
  assert.equal(s7a.abnormal, true);
  assert.match(s7a.descriptor, /half-dozen intelligible words/);
  assert.match(s7a.band, /hospice-eligibility guideline/);

  assert.equal(fastStage({ stage: '7c' }).hospiceContext, true);
  assert.match(fastStage({ stage: '7c' }).descriptor, /Ambulatory ability is lost/);
  assert.equal(fastStage({ stage: '7f' }).hospiceContext, true);
  assert.match(fastStage({ stage: '7f' }).descriptor, /hold head up/);
});

test('stage code is case-insensitive and trimmed', () => {
  assert.equal(fastStage({ stage: ' 7A ' }).stage, '7a');
  assert.equal(fastStage({ stage: '6D' }).stage, '6d');
});

test('an invalid stage throws RangeError; empty input is a guarded message', () => {
  assert.throws(() => fastStage({ stage: '8' }), RangeError);
  assert.throws(() => fastStage({ stage: '6f' }), RangeError);
  assert.equal(fastStage({ stage: '' }).valid, false);
  assert.equal(fastStage({}).valid, false);
});

test('the worked example (7a) matches the documented META expected output', () => {
  const r = fastStage({ stage: '7a' });
  assert.equal(r.stage, '7a');
  assert.equal(r.hospiceContext, true);
  assert.match(r.band, /FAST stage 7a/);
});
