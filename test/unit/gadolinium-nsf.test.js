import test from 'node:test';
import assert from 'node:assert/strict';
import { gadoliniumNsf as g, AGENT_GROUPS, RENAL_STATES, LOW_EGFR } from '../../lib/gadolinium-nsf-v895.js';

test('gadolinium-nsf: the published vocabularies', () => {
  assert.deepEqual(AGENT_GROUPS.map((a) => a.value), ['group-2', 'group-1', 'group-3', 'unknown']);
  assert.deepEqual(RENAL_STATES.map((r) => r.value), ['normal', 'ckd-low', 'dialysis', 'aki']);
  assert.equal(LOW_EGFR, 30);
});

test('gadolinium-nsf: the group decides it, not the kidney state', () => {
  // The reason the tile exists: same kidneys, opposite readings.
  const two = g({ agentGroup: 'group-2', renalState: 'ckd-low' });
  const one = g({ agentGroup: 'group-1', renalState: 'ckd-low' });
  assert.equal(two.verdict, 'group-two-at-risk');
  assert.equal(two.abnormal, false);
  assert.match(two.band, /possibly not distinguishable from zero/);
  assert.equal(one.verdict, 'group-one-at-risk');
  assert.equal(one.abnormal, true);
  assert.match(one.band, /greatest number of cases/);
  for (const r of [two, one]) {
    assert.match(r.groupOverEgfrNote, /came from group I experience/);
    assert.match(r.groupOverEgfrNote, /has not applied to group II agents for years/);
  }
});

test('gadolinium-nsf: the group II reading holds at every at-risk kidney state', () => {
  for (const renal of ['ckd-low', 'dialysis', 'aki']) {
    assert.equal(g({ agentGroup: 'group-2', renalState: renal }).verdict, 'group-two-at-risk', renal);
    assert.equal(g({ agentGroup: 'group-2', renalState: renal }).abnormal, false, renal);
  }
});

test('gadolinium-nsf: normal function raises no group', () => {
  for (const group of ['group-1', 'group-2', 'group-3']) {
    assert.equal(g({ agentGroup: group, renalState: 'normal' }).verdict, 'no-heightened-risk', group);
  }
});

test('gadolinium-nsf: an unentered agent is named as the missing input', () => {
  const r = g({ renalState: 'ckd-low' });
  assert.equal(r.verdict, 'agent-unknown');
  assert.match(r.band, /The agent group decides this, and it is not entered/);
  assert.match(r.band, /differs sharply between a group I and a group II agent/);
});

test('gadolinium-nsf: dialysis is not a preventive measure, said either way', () => {
  assert.match(g({ agentGroup: 'group-2', renalState: 'dialysis' }).dialysisNote, /not a preventive measure/);
  assert.match(g({ agentGroup: 'group-2', renalState: 'dialysis' }).dialysisNote, /dialysed on that schedule/);
  assert.match(g({ agentGroup: 'group-2', renalState: 'normal' }).dialysisNote, /never been shown to prevent this/);
});

test('gadolinium-nsf: acute injury and group II screening each get their own note', () => {
  assert.match(g({ agentGroup: 'group-1', renalState: 'aki' }).akiNote, /its own category, not stable disease at the same number/);
  assert.equal(g({ agentGroup: 'group-1', renalState: 'ckd-low' }).akiNote, null);
  assert.match(g({ agentGroup: 'group-2', renalState: 'ckd-low' }).screeningNote, /not required by the manual/);
  assert.equal(g({ agentGroup: 'group-1', renalState: 'ckd-low' }).screeningNote, null);
});

test('gadolinium-nsf: it says what it does not cover, on a refusal too', () => {
  for (const input of [{}, { agentGroup: 'group-1', renalState: 'aki' }]) {
    assert.match(g(input).otherQuestionsNote, /Retention, pregnancy and prior reactions/);
    assert.match(g(input).scopeNote, /does not choose an agent/);
  }
});

// spec-v1193. The line this replaces read:
//
//   assert.equal(g({ renalState: 'made-up' }).renalState, 'normal');
//
// `normal` is the first row of the table -- "stable kidney function at an eGFR of
// 30 or above" -- so a kidney function nobody had entered cleared every agent
// group and the tile answered "No heightened concern". Nephrogenic systemic
// fibrosis is a risk OF impaired clearance, so that default does not soften the
// answer, it deletes it.
test('gadolinium-nsf: a blank kidney function is not a normal one', () => {
  for (const input of [{}, { agentGroup: 'group-1' }, { renalState: 'made-up', agentGroup: 'group-1' }]) {
    const r = g(input);
    assert.equal(r.valid, false, JSON.stringify(input));
    assert.match(r.message, /Choose the kidney function/);
    assert.match(r.message, /impaired clearance is the entire reason/);
    assert.equal(r.band, undefined);
  }
  // Entered, it answers as before.
  assert.equal(g({ agentGroup: 'group-1', renalState: 'normal' }).valid, true);
});

test('gadolinium-nsf: the agent group keeps its fallback, because "not known" is a real row', () => {
  // Unlike the renal state, the last row of the agent table means exactly what a
  // blank means, and it is the cautious end rather than the reassuring one.
  assert.equal(g({ renalState: 'aki' }).agentGroup, 'unknown');
  assert.equal(g({ renalState: 'aki', agentGroup: 'made-up' }).agentGroup, 'unknown');
});

test('gadolinium-nsf: the documented example', () => {
  const r = g({ agentGroup: 'group-2', renalState: 'ckd-low' });
  assert.equal(r.verdict, 'group-two-at-risk');
  assert.match(r.band, /eGFR below 30/);
});
