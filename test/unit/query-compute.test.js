// answer-shaped-results task 5.1: the pure inline-compute parser. Each template
// computes the documented value from a plain-language query; missing units and
// trigger-only queries return null (the parser never guesses).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { queryCompute, _testing } from '../../lib/query-compute.js';

const { parseMassKg, parseHeightM, parseBP } = _testing;

// --- unit parsers ----------------------------------------------------------

test('parseMassKg: explicit units convert; bare numbers reject', () => {
  assert.equal(Math.round(parseMassKg('180 lb')), 82);
  assert.equal(Math.round(parseMassKg('180lbs')), 82);
  assert.equal(parseMassKg('82 kg'), 82);
  assert.equal(parseMassKg('82kg'), 82);
  assert.equal(parseMassKg('82 kilograms'), 82);
  assert.equal(parseMassKg('180'), null, 'a bare number has no unit');
  assert.equal(parseMassKg('heavy'), null);
});

test('parseHeightM: feet-inches, inches, cm, m; bare numbers reject', () => {
  const approx = (a, b) => assert.ok(Math.abs(a - b) < 0.005, `${a} ~= ${b}`);
  approx(parseHeightM("5'10"), 1.778);
  approx(parseHeightM('5’10'), 1.778);       // smart apostrophe
  approx(parseHeightM('5 ft 10 in'), 1.778);
  approx(parseHeightM("5'10\""), 1.778);
  approx(parseHeightM("5'"), 1.524);              // feet only
  approx(parseHeightM('70 in'), 1.778);
  approx(parseHeightM('178 cm'), 1.78);
  approx(parseHeightM('1.78 m'), 1.78);
  assert.equal(parseHeightM('70'), null, 'a bare number has no unit');
});

test('parseBP: valid pair parses; implausible pairs reject', () => {
  assert.deepEqual(parseBP('120/80'), { sbp: 120, dbp: 80 });
  assert.deepEqual(parseBP('map 138 / 92 today'), { sbp: 138, dbp: 92 });
  assert.equal(parseBP('80/120'), null, 'dbp cannot exceed sbp');
  assert.equal(parseBP('12/8'), null, 'out of physiologic range');
});

// --- templates -------------------------------------------------------------

test('queryCompute: BMI from lb + feet-inches matches the lib compute', () => {
  const r = queryCompute("bmi 180 lb 5'10");
  assert.equal(r.tile, 'bmi');
  assert.equal(r.value, 25.8);                    // 81.6466 kg / 1.778^2
  assert.match(r.text, /25\.8 \(Overweight\)/);
  assert.equal(r.inputs.w, 81.65);
  assert.equal(r.inputs.h, 1.778);
});

test('queryCompute: BMI from metric matches the tile example (70 kg / 1.75 m)', () => {
  const r = queryCompute('bmi 70 kg 1.75 m');
  assert.equal(r.value, 22.9);
  assert.match(r.text, /Normal/);
});

test('queryCompute: BSA reports both formulas with weight + height', () => {
  const r = queryCompute('bsa 70 kg 175 cm');
  assert.equal(r.tile, 'bsa');
  assert.match(r.text, /Du Bois 1\.85 m\^2/);
  assert.match(r.text, /Mosteller 1\.84 m\^2/);
  assert.equal(r.inputs.w, 70);
  assert.equal(r.inputs.h, 175);
});

test('queryCompute: MAP from a BP pair', () => {
  const r = queryCompute('map 120/80');
  assert.equal(r.tile, 'map');
  assert.equal(r.value, 93.3);                    // (2*80 + 120) / 3
  assert.deepEqual(r.inputs, { s: 120, d: 80 });
});

test('queryCompute: incomplete or ambiguous queries return null (never guess)', () => {
  assert.equal(queryCompute('bmi'), null, 'trigger only');
  assert.equal(queryCompute('bmi 180 lb'), null, 'height missing');
  assert.equal(queryCompute("bmi 5'10"), null, 'weight missing');
  assert.equal(queryCompute('bmi 180 5 10'), null, 'no units');
  assert.equal(queryCompute('map'), null, 'no BP pair');
  assert.equal(queryCompute('what is stroke risk'), null, 'no template trigger');
  assert.equal(queryCompute(''), null);
});

// --- named-analyte templates (task 3.2 named-analyte parsing) --------------

test('parseAnalyte: matches name + value with optional separator', () => {
  const { parseAnalyte } = _testing;
  assert.equal(parseAnalyte('na 140', 'sodium|na'), 140);
  assert.equal(parseAnalyte('sodium: 138', 'sodium|na'), 138);
  assert.equal(parseAnalyte('hco3=24', 'bicarbonate|bicarb|hco3|tco2|co2'), 24);
  assert.equal(parseAnalyte('no sodium here', 'sodium|na'), null);
});

test('queryCompute: anion gap with and without albumin correction', () => {
  const a = queryCompute('anion gap na 140 cl 100 hco3 24');
  assert.equal(a.tile, 'anion-gap');
  assert.equal(a.value, 16);                         // 140 - (100 + 24)
  assert.deepEqual(a.inputs, { na: 140, cl: 100, hco3: 24 });

  const b = queryCompute('anion gap na 140 cl 104 hco3 20 alb 2');
  assert.equal(b.value, 16);
  assert.match(b.text, /albumin-corrected 21/);       // 16 + 2.5*(4-2)
  assert.equal(b.inputs.alb, 2);
});

test('queryCompute: corrected calcium from ca + albumin', () => {
  const r = queryCompute('corrected calcium ca 8 albumin 2');
  assert.equal(r.tile, 'corrected-calcium');
  assert.equal(r.value, 9.6);                         // 8 + 0.8*(4-2)
  assert.deepEqual(r.inputs, { ca: 8, alb: 2 });
});

test('queryCompute: analyte templates need every required value', () => {
  assert.equal(queryCompute('anion gap na 140 cl 104'), null, 'hco3 missing');
  assert.equal(queryCompute('corrected calcium ca 8'), null, 'albumin missing');
});

test('queryCompute: corrected sodium reports both correction factors', () => {
  const r = queryCompute('corrected sodium na 130 glucose 600');
  assert.equal(r.tile, 'corrected-sodium');
  assert.equal(r.value, 138);                         // 130 + (600-100)/100*1.6
  assert.match(r.text, /142 \(2\.4x\)/);              // 130 + (600-100)/100*2.4
  assert.deepEqual(r.inputs, { na: 130, g: 600 });
  assert.equal(queryCompute('corrected sodium na 130'), null, 'glucose missing');
});

test('queryCompute: Cockcroft-Gault creatinine clearance (age + weight + scr + sex)', () => {
  const r = queryCompute('creatinine clearance age 60 weight 80 kg creatinine 1.0 male');
  assert.equal(r.tile, 'cockcroft-gault');
  assert.equal(r.value, 88.89);                        // ((140-60)*80)/(72*1.0)
  assert.deepEqual(r.inputs, { age: 60, w: 80, scr: 1, sex: 'M' });
  // lb weight + female (x0.85) path.
  const f = queryCompute('crcl age 60 176 lb cr 1.0 female');
  assert.equal(f.inputs.sex, 'F');
  assert.ok(f.value < 88.89, 'female factor lowers CrCl');
  // every field required.
  assert.equal(queryCompute('crcl age 60 weight 80 kg cr 1.0'), null, 'sex missing');
  assert.equal(queryCompute('crcl weight 80 kg cr 1.0 male'), null, 'age missing');
});
