// spec-v298: Graduated Return-to-Sport (RTS) strategy after sport-related
// concussion. Worked-example tests: each step's exercise strategy and goal, the
// symptom-resolution gate (Steps 4-6), the HCP-clearance gate (Steps 5-6), the
// numeric/string step input, the out-of-range RangeError, and the empty-input
// guard. Table transcribed verbatim from Amsterdam 2022 consensus Table 2 and
// cross-verified against independent reproductions (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { concussionRtsStep } from '../../lib/concussion-rts-v298.js';

test('step 1 is symptom-limited activity with no resolution/clearance gate', () => {
  const r = concussionRtsStep({ step: 1 });
  assert.equal(r.step, 1);
  assert.match(r.strategy, /Symptom-limited activity/);
  assert.equal(r.resolutionRequired, false);
  assert.equal(r.clearanceRequired, false);
  assert.equal(r.abnormal, false);
});

test('step 2 is the light-then-moderate aerobic stage', () => {
  const r = concussionRtsStep({ step: 2 });
  assert.match(r.strategy, /Aerobic exercise/);
  assert.match(r.strategy, /55% max HR/);
  assert.match(r.strategy, /70% max HR/);
  assert.equal(r.resolutionRequired, false);
});

test('steps 4-6 require full symptom resolution before starting', () => {
  for (const step of [4, 5, 6]) {
    const r = concussionRtsStep({ step });
    assert.equal(r.resolutionRequired, true);
    assert.equal(r.abnormal, true);
    assert.match(r.band, /full resolution of symptoms/);
  }
  assert.equal(concussionRtsStep({ step: 3 }).resolutionRequired, false);
});

test('steps 5-6 are the HCP-clearance-gated contact stages', () => {
  const s5 = concussionRtsStep({ step: 5 });
  assert.equal(s5.clearanceRequired, true);
  assert.match(s5.strategy, /Full contact practice/);
  assert.match(s5.band, /written HCP determination/);

  const s6 = concussionRtsStep({ step: 6 });
  assert.equal(s6.clearanceRequired, true);
  assert.match(s6.strategy, /Return to sport/);

  assert.equal(concussionRtsStep({ step: 4 }).clearanceRequired, false);
});

test('step accepts a number or a numeric string', () => {
  assert.equal(concussionRtsStep({ step: '4' }).step, 4);
  assert.equal(concussionRtsStep({ step: ' 6 ' }).step, 6);
});

test('an out-of-range step throws RangeError; empty input is a guarded message', () => {
  assert.throws(() => concussionRtsStep({ step: 0 }), RangeError);
  assert.throws(() => concussionRtsStep({ step: 7 }), RangeError);
  assert.throws(() => concussionRtsStep({ step: 'II' }), RangeError);
  assert.equal(concussionRtsStep({ step: '' }).valid, false);
  assert.equal(concussionRtsStep({}).valid, false);
});

test('the worked example (step 4) matches the documented META expected output', () => {
  const r = concussionRtsStep({ step: 4 });
  assert.equal(r.step, 4);
  assert.match(r.strategy, /Non-contact training drills/);
  assert.match(r.goal, /resume usual intensity/i);
  assert.equal(r.resolutionRequired, true);
});
