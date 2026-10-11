// spec-v1634 tool 1: Liverpool ADR causality assessment tool (Gallagher 2011, Figure 2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { liverpoolAdrCausality as d } from '../../lib/liverpool-adr-causality-v1634.js';

const start = { suspected: 'yes', afterDrug: 'yes', improved: 'yes' };

test('every exit of the flowchart', () => {
  const cases = [
    [{ suspected: 'no' }, 'Unlikely'],
    [{ suspected: 'yes', afterDrug: 'no', exacerbated: 'no' }, 'Unlikely'],
    [{ suspected: 'yes', afterDrug: 'yes', improved: 'no', disability: 'no' }, 'Possible'],
    [{ ...start, underlyingDisease: 'low', rechallenge: 'yes' }, 'Definite'],
    [{ ...start, underlyingDisease: 'low', rechallenge: 'no', pastHistory: 'yes' }, 'Definite'],
    [{ ...start, underlyingDisease: 'low', rechallenge: 'no', pastHistory: 'no', reportedBefore: 'yes' }, 'Probable'],
    [{ ...start, underlyingDisease: 'low', rechallenge: 'no', pastHistory: 'no', reportedBefore: 'no' }, 'Possible'],
    [{ ...start, underlyingDisease: 'high-or-unsure', objectiveEvidence: 'no' }, 'Possible'],
    [{ ...start, underlyingDisease: 'high-or-unsure', objectiveEvidence: 'yes', pastHistory: 'yes' }, 'Definite'],
    [{ ...start, underlyingDisease: 'high-or-unsure', objectiveEvidence: 'yes', pastHistory: 'no', reportedBefore: 'yes' }, 'Probable'],
    [{ ...start, underlyingDisease: 'high-or-unsure', objectiveEvidence: 'yes', pastHistory: 'no', reportedBefore: 'no' }, 'Possible'],
  ];
  for (const [input, cat] of cases) assert.equal(d(input).category, cat, JSON.stringify(input));
});

test('the side entries: exacerbation, unassessable dechallenge, and disability', () => {
  const tail = { underlyingDisease: 'low', rechallenge: 'yes' };
  assert.equal(d({ suspected: 'yes', afterDrug: 'no', exacerbated: 'yes', improved: 'yes', ...tail }).category, 'Definite');
  assert.equal(d({ suspected: 'yes', afterDrug: 'yes', improved: 'unassessable', ...tail }).category, 'Definite');
  assert.equal(d({ suspected: 'yes', afterDrug: 'yes', improved: 'no', disability: 'yes', ...tail }).category, 'Definite');
  assert.match(d({ suspected: 'yes', afterDrug: 'yes', improved: 'unassessable', ...tail }).notes.join(' '), /Unassessable refers to situations/);
});

test('only the questions the path reaches are asked', () => {
  assert.match(d({}).message, /^Choose an answer: Do you suspect/);
  assert.match(d({ suspected: 'yes' }).message, /after the drug was administered/);
  assert.match(d({ suspected: 'yes', afterDrug: 'no' }).message, /pre-existing symptoms/);
  assert.match(d({ suspected: 'yes', afterDrug: 'yes' }).message, /Did the event improve/);
  assert.match(d({ ...start }).message, /underlying disease/);
  assert.match(d({ ...start, underlyingDisease: 'low' }).message, /positive rechallenge/);
  assert.match(d({ ...start, underlyingDisease: 'high-or-unsure' }).message, /objective evidence/);
  assert.equal(d({ suspected: 'yes', afterDrug: 'yes', improved: 'maybe' }).valid, false);
  // "Unassessable" is offered only for the dechallenge question.
  assert.equal(d({ suspected: 'unassessable' }).valid, false);
  assert.equal(d({ suspected: 'no', afterDrug: 'yes', improved: 'yes', underlyingDisease: 'low', rechallenge: 'yes' }).category, 'Unlikely');
  assert.equal(d(null).valid, false);
});
