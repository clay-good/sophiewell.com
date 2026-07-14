// spec-v308: Graduated Return-to-Learn (RTL) strategy after concussion. Worked-
// example tests: each step's mental activity and goal, the final-step (4) note,
// the numeric/string step input, the out-of-range RangeError, and the empty-input
// guard. Summarised from Amsterdam 2022 Table 1 and cross-verified against the RTS
// strategy (spec-v298, spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { concussionRtlStep } from '../../lib/concussion-rtl-v308.js';

test('step 1 is symptom-limited daily activity', () => {
  const r = concussionRtlStep({ step: 1 });
  assert.equal(r.step, 1);
  assert.match(r.mental, /Symptom-limited daily activity/);
  assert.equal(r.finalStep, false);
  assert.match(r.goal, /typical activities/i);
});

test('steps 2 and 3 are the school-reintroduction steps', () => {
  assert.match(concussionRtlStep({ step: 2 }).mental, /School activities/);
  const r3 = concussionRtlStep({ step: 3 });
  assert.match(r3.mental, /part time/i);
  assert.match(r3.goal, /academic activities/i);
});

test('step 4 is full-time school with the pre-RTS note', () => {
  const r = concussionRtlStep({ step: 4 });
  assert.equal(r.step, 4);
  assert.equal(r.finalStep, true);
  assert.match(r.mental, /full time/i);
  assert.match(r.band, /before unrestricted return to sport/);
});

test('step accepts a number or a numeric string', () => {
  assert.equal(concussionRtlStep({ step: '3' }).step, 3);
  assert.equal(concussionRtlStep({ step: ' 4 ' }).step, 4);
});

test('an out-of-range step throws RangeError; empty input is a guarded message', () => {
  assert.throws(() => concussionRtlStep({ step: 0 }), RangeError);
  assert.throws(() => concussionRtlStep({ step: 5 }), RangeError);
  assert.throws(() => concussionRtlStep({ step: 'II' }), RangeError);
  assert.equal(concussionRtlStep({ step: '' }).valid, false);
  assert.equal(concussionRtlStep({}).valid, false);
});

test('the worked example (step 3) matches the documented META expected output', () => {
  const r = concussionRtlStep({ step: 3 });
  assert.equal(r.step, 3);
  assert.match(r.band, /Return-to-learn Step 3 of 4/);
  assert.match(r.mental, /Return to school part time/);
});
