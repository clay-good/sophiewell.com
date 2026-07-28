// spec-v551: iRECIST time-point response.
//
// The load-bearing tests are the four rules that invert or extend RECIST 1.1 knowledge: iCPD is unreachable
// without a prior iUPD, the bar resets on shrinkage, no change from iUPD stays iUPD, and new lesions produce
// iUPD rather than progression.

import test from 'node:test';
import assert from 'node:assert/strict';
import { irecist, TARGET_RESPONSES, NON_TARGET_RESPONSES, CONFIRMATION_WINDOW } from '../../lib/irecist-v551.js';

const noPrior = { newLesions: 'no', priorIupd: 'no' };
const confirmNothing = {
  targetIncrease: 'no', nonTargetIncrease: 'no', newLesionIncrease: 'no', newCategoryProgression: 'no',
};

test('the category vocabularies are the published ones', () => {
  assert.deepEqual(TARGET_RESPONSES.map((r) => r.value), ['iCR', 'iPR', 'iSD', 'iUPD']);
  assert.deepEqual(NON_TARGET_RESPONSES.map((r) => r.value), ['iCR', 'non-iCR-non-iUPD', 'iUPD']);
});

test('the confirmation window is 4 to 8 weeks', () => {
  assert.match(CONFIRMATION_WINDOW, /at least 4 weeks and no more than 8 weeks/i);
});

// The RECIST 1.1 category combinations.
test('the response combinations assign iCR, iPR and iSD', () => {
  assert.equal(irecist({ ...noPrior, target: 'iCR', nonTarget: 'iCR' }).response, 'iCR');
  assert.equal(irecist({ ...noPrior, target: 'iCR', nonTarget: 'non-iCR-non-iUPD' }).response, 'iPR');
  assert.equal(irecist({ ...noPrior, target: 'iPR', nonTarget: 'non-iCR-non-iUPD' }).response, 'iPR');
  assert.equal(irecist({ ...noPrior, target: 'iSD', nonTarget: 'non-iCR-non-iUPD' }).response, 'iSD');
});

// Rule 1: iCPD is structurally unreachable on a single scan.
test('iCPD is not reachable without a prior iUPD, whatever the categories', () => {
  for (const target of ['iCR', 'iPR', 'iSD', 'iUPD']) {
    for (const nonTarget of ['iCR', 'non-iCR-non-iUPD', 'iUPD']) {
      for (const newLesions of ['no', 'yes']) {
        const r = irecist({ target, nonTarget, newLesions, priorIupd: 'no', ...confirmNothing });
        assert.notEqual(r.response, 'iCPD', `${target}/${nonTarget}/NL=${newLesions}`);
      }
    }
  }
});

test('progression on a first scan is iUPD and says it is unconfirmed', () => {
  const r = irecist({ ...noPrior, target: 'iUPD', nonTarget: 'non-iCR-non-iUPD' });
  assert.equal(r.response, 'iUPD');
  assert.equal(r.confirmable, false);
  assert.match(r.band, /UNCONFIRMED/);
  assert.match(r.band, /cannot be assigned from a single scan/);
});

// Rule 2: new lesions produce iUPD, not progression.
test('a new lesion produces iUPD even when every other category is a response', () => {
  const r = irecist({ target: 'iCR', nonTarget: 'iCR', newLesions: 'yes', priorIupd: 'no' });
  assert.equal(r.response, 'iUPD');
});

test('a new lesion with a prior iUPD and no further increase stays iUPD', () => {
  const r = irecist({ target: 'iSD', nonTarget: 'non-iCR-non-iUPD', newLesions: 'yes', priorIupd: 'yes', ...confirmNothing });
  assert.equal(r.response, 'iUPD');
});

// Rule 3: THE BAR RESETS.
test('shrinkage after a prior iUPD resets the bar and assigns the response', () => {
  const r = irecist({ target: 'iPR', nonTarget: 'non-iCR-non-iUPD', newLesions: 'no', priorIupd: 'yes', ...confirmNothing });
  assert.equal(r.response, 'iPR');
  assert.equal(r.resetApplied, true);
  assert.match(r.band, /RESET/);
  assert.match(r.band, /unlike RECIST 1\.1/i);
});

test('the reset reaches iCR, the category RECIST 1.1 would forbid after progression', () => {
  const r = irecist({ target: 'iCR', nonTarget: 'iCR', newLesions: 'no', priorIupd: 'yes', ...confirmNothing });
  assert.equal(r.response, 'iCR');
  assert.equal(r.resetApplied, true);
});

test('a reset is never reported when there was no prior iUPD', () => {
  assert.equal(irecist({ ...noPrior, target: 'iPR', nonTarget: 'non-iCR-non-iUPD' }).resetApplied, false);
});

// Rule 4: no change from iUPD remains iUPD.
test('persistence without further increase remains iUPD, not iCPD', () => {
  const r = irecist({ target: 'iUPD', nonTarget: 'non-iCR-non-iUPD', newLesions: 'no', priorIupd: 'yes', ...confirmNothing });
  assert.equal(r.response, 'iUPD');
  assert.deepEqual(r.confirmedBy, []);
  assert.match(r.band, /FURTHER increase, not persistence/);
});

// Confirmation, per category.
test('each confirmation route alone confirms iCPD', () => {
  const base = { target: 'iUPD', nonTarget: 'non-iCR-non-iUPD', newLesions: 'no', priorIupd: 'yes', ...confirmNothing };
  for (const key of ['targetIncrease', 'nonTargetIncrease', 'newLesionIncrease', 'newCategoryProgression']) {
    const r = irecist({ ...base, [key]: 'yes' });
    assert.equal(r.response, 'iCPD', key);
    assert.deepEqual(r.confirmedBy, [key]);
  }
});

test('the confirmed band states the 4 to 8 week window', () => {
  const r = irecist({
    target: 'iUPD', nonTarget: 'non-iCR-non-iUPD', newLesions: 'no', priorIupd: 'yes',
    ...confirmNothing, targetIncrease: 'yes',
  });
  assert.match(r.band, /at least 4 weeks and no more than 8 weeks/i);
});

test('the non-target route states that unequivocal progression is not required', () => {
  const r = irecist({
    target: 'iUPD', nonTarget: 'iUPD', newLesions: 'no', priorIupd: 'yes',
    ...confirmNothing, nonTargetIncrease: 'yes',
  });
  assert.equal(r.response, 'iCPD');
  assert.match(r.band, /need NOT meet RECIST 1\.1 criteria for unequivocal progression/i);
});

test('the target route carries the 5 mm threshold and the non-target route does not', () => {
  const base = { target: 'iUPD', nonTarget: 'iUPD', newLesions: 'no', priorIupd: 'yes', ...confirmNothing };
  assert.match(irecist({ ...base, targetIncrease: 'yes' }).band, /at least 5 mm/);
  assert.doesNotMatch(irecist({ ...base, nonTargetIncrease: 'yes' }).band, /at least 5 mm/);
});

test('several routes at once are all reported', () => {
  const r = irecist({
    target: 'iUPD', nonTarget: 'iUPD', newLesions: 'yes', priorIupd: 'yes',
    targetIncrease: 'yes', nonTargetIncrease: 'yes', newLesionIncrease: 'yes', newCategoryProgression: 'no',
  });
  assert.equal(r.response, 'iCPD');
  assert.deepEqual(r.confirmedBy, ['targetIncrease', 'nonTargetIncrease', 'newLesionIncrease']);
});

// Input handling.
test('missing categories are refused', () => {
  assert.equal(irecist({}).valid, false);
  assert.equal(irecist({ target: 'iSD' }).valid, false);
  assert.equal(irecist({ target: 'iSD', nonTarget: 'iCR' }).valid, false);
});

test('an unknown category is refused', () => {
  assert.equal(irecist({ ...noPrior, target: 'PD', nonTarget: 'iCR' }).valid, false);
  assert.equal(irecist({ ...noPrior, target: 'iSD', nonTarget: 'SD' }).valid, false);
});

test('the prior-iUPD answer is required, and the message says why', () => {
  const r = irecist({ target: 'iUPD', nonTarget: 'iCR', newLesions: 'no' });
  assert.equal(r.valid, false);
  assert.match(r.message, /never confirmed on a single scan/);
});

test('the confirmation answers are required only when they can change the result', () => {
  const needed = irecist({ target: 'iUPD', nonTarget: 'non-iCR-non-iUPD', newLesions: 'no', priorIupd: 'yes' });
  assert.equal(needed.valid, false);
  assert.match(needed.message, /FURTHER increase/);

  const notNeeded = irecist({ target: 'iPR', nonTarget: 'non-iCR-non-iUPD', newLesions: 'no', priorIupd: 'yes' });
  assert.equal(notNeeded.valid, true);
  assert.equal(notNeeded.response, 'iPR');
});

test('the scope note states that it is a trial data standard, not a treatment decision', () => {
  const r = irecist({ ...noPrior, target: 'iSD', nonTarget: 'non-iCR-non-iUPD' });
  assert.match(r.note, /does not decide whether to continue treatment past iUPD/);
  assert.match(r.note, /clinically stable/);
});
