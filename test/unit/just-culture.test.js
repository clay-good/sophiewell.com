// spec-v919: Just Culture. The test that matters is that the outcome changes nothing.

import test from 'node:test';
import assert from 'node:assert/strict';
import { justCulture, JUST_CULTURE_NOTE, BEHAVIOR_OPTIONS, OUTCOME_OPTIONS } from '../../lib/just-culture-v919.js';

test('just-culture: the behavior has to be characterized first', () => {
  assert.equal(justCulture({}).valid, false);
  assert.match(justCulture({ outcome: 'death' }).message, /Characterize the behavior first/);
  assert.equal(justCulture({ behavior: 'something-else' }).valid, false);
});

test('just-culture: the same behavior gets the same response whatever the outcome', () => {
  const unharmed = justCulture({ behavior: 'human-error', outcome: 'none' });
  const died = justCulture({ behavior: 'human-error', outcome: 'death' });
  assert.equal(unharmed.bandLabel, died.bandLabel);
  assert.equal(unharmed.band, died.band);
  assert.match(died.outcomeNote, /did not change the answer above/);
});

test('just-culture: reckless is disciplined even when no harm reached the patient', () => {
  const r = justCulture({ behavior: 'reckless', outcome: 'none' });
  assert.equal(r.bandLabel, 'Disciplinary action');
  assert.match(r.band, /does not depend on how this turned out/);
});

test('just-culture: human error is consoled even after a death', () => {
  const r = justCulture({ behavior: 'human-error', outcome: 'death' });
  assert.equal(r.bandLabel, 'Console, and examine the system');
  assert.match(r.consoleNote, /a response, not the absence of one/);
});

test('just-culture: at-risk behavior is coached', () => {
  const r = justCulture({ behavior: 'at-risk' });
  assert.equal(r.bandLabel, 'Coach');
  assert.match(r.band, /Remove the incentives/);
});

test('just-culture: a repeat after coaching questions the coaching before escalating', () => {
  const r = justCulture({ behavior: 'at-risk', repeatedAfterCoaching: true });
  assert.match(r.repeatNote, /before escalating/);
  assert.match(r.repeatNote, /outcome-based judgment under another name/);
  assert.equal(r.bandLabel, 'Coach');
});

test('just-culture: the repeat flag does not move any other behavior', () => {
  for (const behavior of ['human-error', 'reckless', 'knowing-harm']) {
    const plain = justCulture({ behavior });
    const repeat = justCulture({ behavior, repeatedAfterCoaching: true });
    assert.equal(plain.bandLabel, repeat.bandLabel);
    assert.match(repeat.repeatNote, /belongs to at-risk behavior/);
  }
});

test('just-culture: knowingly causing harm is outside the model, not the top of it', () => {
  const r = justCulture({ behavior: 'knowing-harm' });
  assert.equal(r.bandLabel, 'Outside this model');
  assert.match(r.band, /local policy and, where it applies, to the law/);
});

test('just-culture: with no outcome recorded it says none is needed', () => {
  assert.match(justCulture({ behavior: 'at-risk' }).outcomeNote, /none is needed/);
  assert.match(justCulture({ behavior: 'at-risk', outcome: 'nonsense' }).outcomeNote, /none is needed/);
});

test('just-culture: the option lists and the scope line are stable', () => {
  assert.deepEqual(BEHAVIOR_OPTIONS.map((o) => o.value), ['unset', 'human-error', 'at-risk', 'reckless', 'knowing-harm']);
  assert.deepEqual(OUTCOME_OPTIONS.map((o) => o.value), ['unset', 'none', 'minor', 'serious', 'death']);
  assert.match(justCulture({ behavior: 'at-risk' }).scopeNote, /not a disciplinary decision/);
  assert.match(JUST_CULTURE_NOTE, /judging by outcome is the thing this model exists to replace/);
});
