// spec-v1634 tool 10: AT-HARM10 (Kempen 2019).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { atHarm10 as d, QUESTIONS } from '../../lib/at-harm10-v1634.js';

const upTo = (code, last) => Object.fromEntries(QUESTIONS.slice(0, QUESTIONS.findIndex((q) => q.code === code) + 1).map((q) => [q.arg, q.code === code ? last : 'no']));

test('ten questions, three U and seven P', () => {
  assert.deepEqual(QUESTIONS.map((q) => q.code), ['U1', 'U2', 'U3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10']);
});

test('the first yes decides: U1 to U3 unlikely, P4 to P10 possibly', () => {
  for (const code of ['U1', 'U2', 'U3']) { const r = d(upTo(code, 'yes')); assert.deepEqual([r.classification, r.decidedBy, r.abnormal], ['U', code, false]); }
  for (const code of ['P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10']) { const r = d(upTo(code, 'yes')); assert.deepEqual([r.classification, r.decidedBy, r.abnormal], ['P', code, true]); }
  // A yes at U2 ends it: a later yes at P5 is not used.
  assert.equal(d({ u1: 'no', u2: 'yes', p5: 'yes' }).classification, 'U');
});

test('all no: the form says possibly, the text says indecisive, and both are reported', () => {
  const r = d(upTo('P10', 'no'));
  assert.deepEqual([r.classification, r.flag, r.decidedBy], ['P', 'all-no', null]);
  assert.match(r.notes[0], /disagree with themselves/);
  assert.match(r.notes[0], /expert panel/);
});

test('the validity figures are the table\'s', () => {
  assert.match(d({ u1: 'yes' }).notes.join(' '), /sensitivity 70% and 86% and specificity 74% and 70%/);
});

test('questions are asked in order', () => {
  assert.match(d({}).message, /^Choose yes or no for U1/);
  assert.match(d({ u1: 'no', u2: 'no', u3: 'no' }).message, /^Choose yes or no for P4/);
  assert.match(d({ u1: 'no', u3: 'yes' }).message, /^Choose yes or no for U2/);
  assert.equal(d({ u1: 'maybe' }).valid, false);
  assert.equal(d(null).valid, false);
});
