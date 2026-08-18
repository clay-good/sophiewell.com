// The one-line tile description on the hub and topic pages.
//
// Its predecessor cut every line at 110 characters and appended `...`, so
// 3,225 of the 3,329 rows on those pages ended mid-clause -- and a tile whose
// first sentence already fit got the cut mark anyway, because the length test
// was against the whole summary rather than against the sentence.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tileLine, fieldName, stripLegend } from '../../scripts/lib/tile-line.mjs';

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
  // No colon, dash or semicolon anywhere, so there is no boundary to cut at
  // and the character clamp is what runs. (An input carrying a boundary now
  // takes the clause path instead -- see the tests at the bottom of this file.)
  const line = tileLine(`Modified NIH Stroke Scale scoring the eleven retained items covering level of consciousness, gaze, visual fields, motor function and the rest of the exam.`);
  assert.ok(line.endsWith('…'), line);
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

// --- stripLegend: the value list an agent-facing label carries inline.
//
// An MCP field label enumerates its legal values because an agent passes a raw
// token and never sees the picklist. On a page that list is the select the
// reader is about to use, and its inline periods ended the first-sentence trim
// *inside* the brackets: every OSDI item printed as "... 0 = None of the
// time." with the bracket never closed.
test('stripLegend drops a bracketed value legend', () => {
  assert.equal(
    stripLegend('Item 1. Light sensitivity [4 = All of the time; 3 = Most of the time; 0 = None of the time. This item does NOT accept "not applicable"]'),
    'Item 1. Light sensitivity',
  );
  assert.equal(
    stripLegend('Liver stage by bilirubin [0 = Bilirubin under 2 mg/dL; 4 = Bilirubin over 15 mg/dL]'),
    'Liver stage by bilirubin',
  );
});

test('stripLegend leaves a bracket that is not a value legend', () => {
  assert.equal(stripLegend('Total kidney volume [mL]'), 'Total kidney volume [mL]');
  assert.equal(stripLegend('S wave in V1'), 'S wave in V1');
  assert.equal(stripLegend('Bicarbonate [HCO3-]'), 'Bicarbonate [HCO3-]');
});

// A legend mid-string is left alone: the label goes on after it, and cutting
// there would drop text the reader needs.
test('stripLegend only cuts a legend that runs to the end', () => {
  const s = 'Grade [0 = none; 1 = some] measured before the matrix lookup.';
  assert.equal(stripLegend(s), s);
});

// The last resort before a blunt character clamp. These labels qualify the
// name with an appositive rather than a separator, so the comma is the
// boundary and cutting there names the field.
test('fieldName cuts an over-long label at its appositive comma', () => {
  assert.equal(
    fieldName('Cellularity, counted in cells per unit area at a specified magnification and therefore operator-dependent'),
    'Cellularity',
  );
});

test('fieldName leaves a comma inside a label that already fits', () => {
  assert.equal(fieldName('Skin stage, active erythema only'), 'Skin stage, active erythema only');
  assert.equal(fieldName('Age, in years'), 'Age, in years');
});

// --- The clause boundary a long tile line already carries.
//
// 2,482 of the 3,329 rows on the hub and topic pages ended in a cut mark: the
// first sentence of most tiles runs past the line budget, so the row was
// clamped at a word boundary and stopped just before the part that said what
// the tool does. These sentences are built the same way -- a clause naming the
// tool, then a colon or a dash, then the definition -- so the boundary is
// already written into the text.
test('tileLine cuts a long line at the boundary the sentence already has', () => {
  assert.equal(
    tileLine('E&M level by medical decision making: the level from the two-of-three highest of problems, data, and risk, with the audit trail for each.'),
    'E&M level by medical decision making.',
  );
  assert.equal(
    tileLine('Medicare PFS payment from RVUs: (work x workGPCI + PE x peGPCI + MP x mpGPCI) x the conversion factor x units, rounded to the cent and shown per line.'),
    'Medicare PFS payment from RVUs.',
  );
});

// A row printed under a heading that already says the name gains nothing by
// repeating it. Fifteen rows did.
test('tileLine refuses a clause cut that only restates the tile name', () => {
  const text = 'MELD 3.0 liver allocation score: the current OPTN score, adding female sex and albumin and refitting every coefficient from MELD-Na.';
  assert.equal(tileLine(text, { name: 'MELD 3.0 Liver Allocation Score' }).endsWith('…'), true);
  assert.equal(tileLine(text, { name: 'Something Else' }), 'MELD 3.0 liver allocation score.');
  assert.equal(tileLine(text), 'MELD 3.0 liver allocation score.');
});

// A sentence that fits is still printed whole, boundary or not.
test('tileLine leaves a short sentence alone even when it has a colon', () => {
  assert.equal(tileLine('Wells score: pulmonary embolism.'), 'Wells score: pulmonary embolism.');
});
