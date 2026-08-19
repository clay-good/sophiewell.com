// The one-line tile description on the hub and topic pages.
//
// Its predecessor cut every line at 110 characters and appended `...`, so
// 3,225 of the 3,329 rows on those pages ended mid-clause -- and a tile whose
// first sentence already fit got the cut mark anyway, because the length test
// was against the whole summary rather than against the sentence.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tileLine, fieldName, stripLegend, ledeParts } from '../../scripts/lib/tile-line.mjs';

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

// A legend is cut wherever it sits, and the label goes on around it. Anchoring
// to the end of the string was how `bilsky-escc` published a 477-character
// input row: it writes "...not a number [0 = ...; 3 = ...]. 1a, 1b and 1c are
// DISTINCT grades", so the legend has a sentence after it and nothing matched.
test('stripLegend cuts a legend that sits mid-label, keeping what follows', () => {
  assert.equal(
    stripLegend('Grade [0 = none; 1 = some] measured before the matrix lookup.'),
    'Grade measured before the matrix lookup.',
  );
});

// Two pairs make a legend; one is a parenthetical the label meant to say.
test('stripLegend leaves a bracket holding a single pair', () => {
  const s = 'Grade [0 = none] measured before the matrix lookup.';
  assert.equal(stripLegend(s), s);
});

// The pairs are divided by a semicolon on some tiles, a full stop on others,
// and the value is often hyphenated -- so neither the divider nor the value
// can be used to find a pair. 60 rows on 10 pages printed a whole rating scale
// on one line because only "value = text" was recognised.
test('stripLegend cuts a dash-separated legend', () => {
  assert.equal(
    stripLegend('Speech [4 - Normal speech; 3 - Detectable disturbance; 2 - Intelligible]'),
    'Speech',
  );
  assert.equal(
    stripLegend('Acuity [nlp = No light perception. pl-hm = Light perception or hand movements]'),
    'Acuity',
  );
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

// --- ledeParts: the hub and topic page opening paragraph.
//
// These pages opened by naming every tool on them and then listed those same
// tools underneath, each with its own line. One ran to 959 characters. The
// first sentence stays visible and the rest goes one click away -- nothing is
// deleted, and the <meta> description is written separately and untouched.
test('ledeParts leaves a short opening paragraph alone', () => {
  const short = 'Decision tools for triage and acuity.';
  assert.deepEqual(ledeParts(short), { lead: short, rest: '' });
});

test('ledeParts splits a long paragraph after its first sentence', () => {
  const text = 'Bedside cardiology math and rule-out scores with the primary citation under every result. QTc by Bazett, Fridericia, Framingham and Hodges; Wells PE and DVT with the Geneva alternative; CHA2DS2-VASc and HAS-BLED for atrial fibrillation.';
  const { lead, rest } = ledeParts(text);
  assert.equal(lead, 'Bedside cardiology math and rule-out scores with the primary citation under every result.');
  assert.ok(rest.startsWith('QTc by Bazett'), rest);
});

// Most of them are not several sentences at all -- they are one sentence that
// names the page, then a colon, then the name-dump, and never end a sentence.
test('ledeParts splits at the colon when there is no sentence break', () => {
  const text = 'Calculators that compute a deterministic billing or coding output: the MPFS reimbursement engine, the claim-edit decision engines, and the patient-responsibility engines that say what the patient actually owes.';
  const { lead, rest } = ledeParts(text);
  assert.equal(lead, 'Calculators that compute a deterministic billing or coding output.');
  // What followed a colon continued the clause, so it began in lower case and
  // has to open like a sentence now that it stands on its own.
  assert.ok(rest.startsWith('The MPFS reimbursement engine'), rest);
});

// Only the colon path recapitalizes. A sentence break hands back the author's
// own sentence, and "eGFR" is spelled that way on purpose.
test('ledeParts does not recapitalize text that already began a sentence', () => {
  const text = 'Deterministic bedside math and clinical scoring with the primary citation under every result. eGFR (CKD-EPI 2021), QTc, Wells PE and DVT, MME (CDC 2022), ABG interpretation and dozens more.';
  const { rest } = ledeParts(text);
  assert.ok(rest.startsWith('eGFR'), rest);
});

// Hiding two words behind a control costs more attention than it saves.
test('ledeParts does not split when there is almost nothing to hide', () => {
  // Over the length that triggers a split, but the only sentence break leaves
  // barely twenty characters on the other side of it.
  const text = 'A long opening sentence about what this page collects, why it exists, who it serves and how it happens to be organized for the reader who lands here. Short tail.';
  assert.ok(text.length > 150, 'the fixture has to be long enough to be considered');
  assert.deepEqual(ledeParts(text), { lead: text, rest: '' });
});
