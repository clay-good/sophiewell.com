// find_calculator strips numbers from a query so values do not compete with names (spec-v765). That also
// stripped identifiers that are the curated phrase itself -- "usp 797 bud", "sb 1164", "texas 10 day rule"
// -- and 28 phrases could not reach their own tool (found October 16, 2026). Every curated phrase that
// contains a digit must put its tool in the top 3.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findCalculator, answerQuery } from '../../mcp/tools.js';
import { REGISTRY } from '../../mcp/catalog.js';

const entries = JSON.parse(readFileSync(new URL('../../data/synonyms.json', import.meta.url), 'utf8')).entries;

test('every curated phrase with a number in it reaches its own tool', () => {
  const misses = [];
  let n = 0;
  for (const e of entries) {
    if (!REGISTRY.has(e.tile)) continue;
    for (const p of e.phrases) {
      if (!/\d/.test(p)) continue;
      n += 1;
      const ids = (findCalculator({ query: p, limit: 3 }).candidates || []).map((c) => c.id);
      if (!ids.includes(e.tile)) misses.push(`${p} -> ${ids.join(', ') || '(nothing)'} [${e.tile}]`);
    }
  }
  assert.ok(n > 300, `only ${n} numbered phrases`);
  assert.deepEqual(misses, []);
});

test('a value in an ordinary question is still stripped', () => {
  const r = findCalculator({ query: 'crcl for a 72 year old woman 68 kg creatinine 1.4', limit: 3 });
  assert.ok(r.candidates.some((c) => /cockcroft|crcl|creatinine/i.test(c.id + c.name)), JSON.stringify(r.candidates.map((c) => c.id)));
});

test('answer_query: a curated phrase with no values points to its tool; a weak guess is still a miss', () => {
  for (const [q, tile] of [['usp 797 bud', 'compounding-bud'], ['kidney function', 'egfr']]) {
    const r = answerQuery({ query: q });
    assert.deepEqual([r.code, r.tile], ['NO_VALUES', tile], q);
  }
  assert.equal(answerQuery({ query: 'what is the meaning of life' }).code, 'NO_MATCH');
  assert.equal(answerQuery({ query: 'index' }).code, 'NO_MATCH', 'one word of the phrase "lee index" is not the phrase');
});

test('answer_query: a calculator named in full is the one answered, never a neighbour', () => {
  // Found October 16, 2026 by asking answer_query for every calculator's own name: four did not come back.
  for (const [q, tile] of [
    ["Hy's Law (drug-induced liver injury)", 'hys-law'],
    ['HOMA-B (Steady-State β-Cell Function)', 'homa-beta'],
    ['Assistant / Co- / Team-Surgeon Payment', 'multi-surgeon-pay'],
    ['DIPSS-Plus (myelofibrosis survival score)', 'dipss-plus-mf'],
  ]) assert.equal(answerQuery({ query: q }).tile, tile, q);
});

test('answer_query: the calculator named first wins over a template or a label that names another', () => {
  // Found October 16, 2026 by writing every all-numeric page example as "name, label value, ...": nine went
  // to another calculator (a template for BMI or the anion gap answered first, or a value's label was
  // another calculator's name, or the named one fell outside the ranker's top five).
  for (const [q, tile] of [
    ['Fatty Liver Index (steatosis probability) Triglycerides 150 mg/dL, BMI 30 kg/m^2, GGT 60 U/L, Waist circumference 100 cm', 'fatty-liver-index'],
    ['Anion Gap & Delta-Delta Sodium 140 mEq/L, Chloride 100 mEq/L, HCO3 14 mEq/L, Albumin 4 g/dL', 'anion-gap-dd'],
    ['Cardiac Power Output (CPO) Mean arterial pressure 80 mmHg, Cardiac output 5 L/min', 'cardiac-power-output'],
    ['Subaxial Cervical Spine Injury Classification (SLIC)', 'slic-score'],
  ]) assert.equal(answerQuery({ query: q }).tile, tile, q);
  assert.equal(answerQuery({ query: 'bmi 80 kg 180 cm' }).tile, 'bmi', 'a template still answers when nothing else is named');
  assert.equal(answerQuery({ query: 'wells score for DVT, previous DVT' }).tile, 'wells-dvt', 'PE is a word of the PE name');
  assert.equal(answerQuery({ query: 'wells score for PE, heart rate 110, previous DVT' }).tile, 'wells-pe');
  assert.equal(answerQuery({ query: 'Waist-to-Height Ratio (WHtR) Waist circumference 90 cm, Height 170 cm' }).tile, 'whtr', '"ratio" alone does not name P/F Ratio');
});

test('answer_query: a curated phrase the question opens with outranks a calculator a value label names', () => {
  // Found October 17, 2026 by sending each curated phrase plus its tool's example values: 27 went elsewhere.
  for (const [q, tile] of [
    ['liver disease severity, Total bilirubin 2 mg/dL, INR 1.5, Creatinine 1.5 mg/dL, Sodium 130 mmol/L', 'meld-na'],
    ['pediatric gfr, Height 100 cm, Serum creatinine 0.5 mg/dL', 'schwartz-egfr'],
    ['corrected phenytoin, Measured total phenytoin 8 ug/mL, Serum albumin 2.0 g/dL', 'corrected-phenytoin'],
  ]) assert.equal(answerQuery({ query: q }).tile, tile, q);
  // A phrase inside a named calculator's own name is that name, not a route elsewhere.
  assert.equal(answerQuery({ query: 'Shock Index, Pediatric Age-Adjusted (SIPA) Age 5 years, Heart rate 140 bpm, Systolic BP 100 mmHg' }).tile, 'sipa');
});
