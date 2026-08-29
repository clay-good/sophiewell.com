import test from 'node:test';
import assert from 'node:assert/strict';
import { eatSleepConsole as e, ITEMS, CARE_MEASURES } from '../../lib/eat-sleep-console-v884.js';

const allCare = Object.fromEntries(CARE_MEASURES.map((m) => [m.key, true]));

test('eat-sleep-console: three items and five care measures', () => {
  assert.deepEqual(ITEMS.map((i) => i.key), ['eat', 'sleep', 'console']);
  assert.equal(CARE_MEASURES.length, 5);
});

test('eat-sleep-console: all three met is the good result', () => {
  const r = e({});
  assert.equal(r.status, 'all-three');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /Continue the non-pharmacologic care/);
});

test('eat-sleep-console: any one item failing escalates care, not medication', () => {
  for (const i of ITEMS) {
    const r = e({ [i.key]: true });
    assert.equal(r.status, 'escalate-care', i.key);
    assert.match(r.band, /escalate non-pharmacologic care first/);
  }
  assert.match(e({ console: true }).missingCareNote, /Not recorded as in place/);
  assert.match(e({ console: true }).parentNote, /largest effect in this approach/);
  assert.equal(e({ console: true, ...allCare }).parentNote, null);
});

test('eat-sleep-console: medication is considered only once every measure is in place', () => {
  // The whole shape of the approach.
  assert.equal(e({ console: true, ...allCare }).status, 'consider-medication');
  for (const m of CARE_MEASURES) {
    const short = { ...allCare, [m.key]: false };
    assert.equal(e({ console: true, ...short }).status, 'escalate-care', m.key);
  }
  assert.match(e({ console: true, ...allCare }).band, /considered, by the team caring for the infant/);
});

test('eat-sleep-console: another suspected cause changes the answer', () => {
  const r = e({ console: true, ...allCare, otherCauseSuspected: true });
  assert.equal(r.status, 'other-cause');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /attributable to withdrawal/);
  assert.match(r.band, /the other cause is what to pursue first/);
});

test('eat-sleep-console: it is not a score, and the care is the treatment', () => {
  // The reason the tile exists, so both print on every result.
  for (const input of [{}, { console: true }, { console: true, ...allCare }]) {
    assert.match(e(input).notAScoreNote, /not a score/);
    assert.match(e(input).notAScoreNote, /not interchangeable with a Finnegan score/);
    assert.match(e(input).careFirstNote, /the intervention, not a preliminary/);
    assert.match(e(input).attributionNote, /attributable to withdrawal/);
  }
});

test('eat-sleep-console: the counts are read back', () => {
  assert.equal(e({}).recordedNote, 'Recorded: 0 of 3 items not met, 0 of 5 care measures in place.');
  assert.equal(e({ eat: true, sleep: true, roomingIn: true }).recordedNote, 'Recorded: 2 of 3 items not met, 1 of 5 care measures in place.');
});

test('eat-sleep-console: the documented example', () => {
  const r = e({ console: true, roomingIn: true, holding: true });
  assert.equal(r.status, 'escalate-care');
  assert.equal(r.recordedNote, 'Recorded: 1 of 3 items not met, 2 of 5 care measures in place.');
});
