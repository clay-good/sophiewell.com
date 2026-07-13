// spec-v295: Reisberg Global Deterioration Scale (GDS) for dementia. Worked-
// example tests: each stage returns its label + descriptor, the stage-5
// needs-assistance threshold (5+ flags "can no longer survive without
// assistance", earlier stages do not), the invalid-stage RangeError, and the
// empty-input guard. Descriptors cross-verified against two verbatim
// reproductions of Reisberg 1982 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gdsStage } from '../../lib/gds-v295.js';

test('pre-dementia stages 1-3 return their labels without the assistance flag', () => {
  const s1 = gdsStage({ stage: '1' });
  assert.equal(s1.stage, '1');
  assert.equal(s1.needsAssistance, false);
  assert.equal(s1.abnormal, false);
  assert.match(s1.stageLabel, /No cognitive decline/);

  assert.match(gdsStage({ stage: '2' }).stageLabel, /age-associated memory impairment/);
  const s3 = gdsStage({ stage: '3' });
  assert.match(s3.stageLabel, /mild cognitive impairment/);
  assert.match(s3.descriptor, /Earliest clear-cut deficits/);
  assert.equal(s3.needsAssistance, false);
});

test('stage 4 is mild dementia with no assistance flag; complex-task loss noted', () => {
  const s4 = gdsStage({ stage: '4' });
  assert.match(s4.stageLabel, /mild dementia/);
  assert.match(s4.descriptor, /Inability to perform complex tasks/);
  assert.equal(s4.needsAssistance, false);
});

test('stage 5 and beyond flag "can no longer survive without assistance"', () => {
  const s5 = gdsStage({ stage: '5' });
  assert.equal(s5.needsAssistance, true);
  assert.equal(s5.abnormal, true);
  assert.match(s5.band, /can no longer survive without some assistance/);
  assert.match(s5.stageLabel, /moderate dementia/);

  assert.equal(gdsStage({ stage: '6' }).needsAssistance, true);
  assert.match(gdsStage({ stage: '6' }).descriptor, /incontinent/);
  const s7 = gdsStage({ stage: '7' });
  assert.equal(s7.needsAssistance, true);
  assert.match(s7.descriptor, /verbal abilities are lost/);
  assert.match(s7.descriptor, /walking/);
});

test('an invalid stage throws RangeError; empty input is a guarded message', () => {
  assert.throws(() => gdsStage({ stage: '8' }), RangeError);
  assert.throws(() => gdsStage({ stage: '0' }), RangeError);
  assert.equal(gdsStage({ stage: '' }).valid, false);
  assert.equal(gdsStage({}).valid, false);
});

test('the worked example (stage 5) matches the documented META expected output', () => {
  const r = gdsStage({ stage: '5' });
  assert.equal(r.stage, '5');
  assert.equal(r.needsAssistance, true);
  assert.match(r.band, /GDS stage 5/);
});
