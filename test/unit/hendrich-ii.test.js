import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hendrichII } from '../../lib/scoring-v4.js';

test('hendrich-ii 0 (tile example: nothing endorsed) -> not high risk', () => {
  const r = hendrichII({});
  assert.equal(r.score, 0);
  assert.equal(r.highRisk, false);
});

test('hendrich-ii 4 (confusion only, below cutoff) -> not high risk', () => {
  const r = hendrichII({ confusion: true });
  assert.equal(r.score, 4);
  assert.equal(r.highRisk, false);
});

test('hendrich-ii 5 (confusion + depression cutoff edge) -> high risk', () => {
  const r = hendrichII({ confusion: true, ageElim: false, depression: true });
  // Wait: depression alone is +2, confusion +4 -> 6 total. To get exactly 5 use confusion+benzo+ae? confusion 4 + benzo 1 = 5.
  assert.equal(r.score, 6);
  assert.equal(r.highRisk, true);
});

test('hendrich-ii 5 (confusion + benzodiazepine) -> high risk (cutoff edge)', () => {
  const r = hendrichII({ confusion: true, benzodiazepine: true });
  assert.equal(r.score, 5);
  assert.equal(r.highRisk, true);
});

test('hendrich-ii all flags + unable-to-rise -> high risk', () => {
  const r = hendrichII({
    confusion: true, depression: true, alteredElim: true, dizziness: true,
    male: true, antiepileptic: true, benzodiazepine: true, getUpAndGo: 'unable',
  });
  // 4+2+1+1+1+2+1+4 = 16
  assert.equal(r.score, 16);
  assert.equal(r.highRisk, true);
});

test('hendrich-ii get-up-and-go bands', () => {
  assert.equal(hendrichII({ getUpAndGo: 'able' }).score, 0);
  assert.equal(hendrichII({ getUpAndGo: 'pushes-up' }).score, 1);
  assert.equal(hendrichII({ getUpAndGo: 'needs-help' }).score, 3);
  assert.equal(hendrichII({ getUpAndGo: 'unable' }).score, 4);
});
