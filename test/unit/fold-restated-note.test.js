// The one judgement in `foldRestatedNote`: does this paragraph say what an
// earlier one already said? The fold itself is DOM work and is covered by
// test/integration/restated-note.spec.js against a real page.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { restatesEarlier } from '../../lib/long-note.js';

// The real pair off /#ahlback-knee-oa: written by two hands, never the same
// string, and the reason the verbatim pass never caught 420 tiles of this.
const INTRO = 'The Ahlback classification of knee osteoarthritis, by radiographic joint-space loss and bone attrition.';
const HOISTED = 'The Ahlback classification (Ahlback 1968) grades knee osteoarthritis by radiographic joint-space loss and bone attrition.';

test('a paraphrase of an earlier paragraph counts as a restatement', () => {
  assert.equal(restatesEarlier(HOISTED, INTRO), true);
});

test('a citation and a scope sentence do not stop it counting', () => {
  const longer = `${HOISTED} It reports the grade a clinician has assigned and does not diagnose.`;
  assert.equal(restatesEarlier(longer, INTRO), true);
});

test('two different explanations are left alone', () => {
  const other = 'Enter the serum sodium and the measured serum osmolality; the osmolal gap is the difference from the calculated value.';
  assert.equal(restatesEarlier(other, INTRO), false);
});

test('a paragraph sharing only its subject is not a restatement', () => {
  const sibling = 'The Kellgren-Lawrence system grades the same knee radiograph on a different five-point scale and is not interchangeable.';
  assert.equal(restatesEarlier(sibling, INTRO), false);
});

test('too few distinct words to score is never a restatement', () => {
  assert.equal(restatesEarlier('Pick the grade.', 'Pick the grade.'), false);
  assert.equal(restatesEarlier('', INTRO), false);
});
