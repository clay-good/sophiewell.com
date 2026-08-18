// The one-line tile description on the hub and topic pages.
//
// Its predecessor cut every line at 110 characters and appended `...`, so
// 3,225 of the 3,329 rows on those pages ended mid-clause -- and a tile whose
// first sentence already fit got the cut mark anyway, because the length test
// was against the whole summary rather than against the sentence.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tileLine, fieldName } from '../../scripts/lib/tile-line.mjs';

test('a first sentence that fits is printed whole, with no cut mark', () => {
  const line = tileLine('Score the Wells criteria for pulmonary embolism. Higher totals move the patient into the PE-likely group.');
  assert.equal(line, 'Score the Wells criteria for pulmonary embolism.');
});

test('a lead with no closing period gets one', () => {
  assert.equal(tileLine('Compute body mass index'), 'Compute body mass index.');
});

test('a sentence too long to print is clamped at a word boundary and marked', () => {
  const long = `Ottawa Ankle and Foot Rules ${'x'.repeat(40)} plus a much longer trailing clause that runs well past the budget and keeps going.`;
  const line = tileLine(long);
  assert.ok(line.endsWith('…'), line);
  assert.ok(line.length <= 111, `${line.length} chars`);
  assert.ok(!/[\s,;:-]…$/.test(line), `dangling punctuation before the ellipsis: ${line}`);
});

test('a clamped line never ends mid-word', () => {
  const line = tileLine(`Modified NIH Stroke Scale (Meyer 2002): the eleven retained items covering level of consciousness, gaze, visual fields, and the rest of the exam.`);
  assert.ok(line.endsWith('…'));
  const lastWord = line.slice(0, -1).trim().split(' ').pop();
  assert.ok(/^[\w()/-]+$/.test(lastWord), lastWord);
});

test('empty prose gives an empty line, not a bare ellipsis', () => {
  assert.equal(tileLine(''), '');
  assert.equal(tileLine(undefined), '');
});

// --- fieldName: the left column of a worked example.

test('a label that carries its own definition is cut at the separator', () => {
  assert.equal(fieldName('Tissue type (worst present): 0 closed, 1 epithelial, 2 granulation'), 'Tissue type (worst present)');
  assert.equal(fieldName('Age and sex band for the hematocrit threshold - there is no single value'), 'Age and sex band for the hematocrit threshold');
});

test('a label that is already just a name is left alone', () => {
  assert.equal(fieldName('Wound length'), 'Wound length');
  assert.equal(fieldName('S wave in V1'), 'S wave in V1');
});

test('a separator too early to be a name is not a cut point', () => {
  // "0 = none" style labels lead with the value, not a name.
  assert.equal(fieldName('Sex: male or female'), 'Sex: male or female');
});

test('a label with no separator is clamped at a word boundary', () => {
  const long = 'At least one glomerulus with segmental or global collapse AND overlying podocyte hypertrophy and hyperplasia present';
  const out = fieldName(long);
  assert.ok(out.endsWith('…'));
  assert.ok(out.length <= 80, `${out.length} chars`);
  assert.ok(!out.includes('  '));
});
