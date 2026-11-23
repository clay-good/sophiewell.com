#!/usr/bin/env node
// spec-v1771: the same quantity in the other unit must get the same answer.
//
// A tool with a unit toggle holds the conversion itself, written by hand in the lib. Nothing has ever
// checked that the two readings agree: enter 70 kg or 154.3 lb and the answer must not move. When it
// does, one of three things is wrong -- the factor is truncated (2.2 for 2.2046), the conversion runs on
// one branch and not another (a band compared in mg/dL after the value was converted to micromol/L), or
// the toggle is read for the printed label only and never applied.
//
// For every enum field whose values are a unit set this file knows -- weight, length, pressure, temperature,
// and the mg/dL <-> SI pair of a named analyte -- it converts the worked example's figures into each other
// unit with the canonical factor, re-asks, and prints the pair when the answers differ. Temperature is the
// one that is not a factor at all: Celsius to Fahrenheit is (v x 9/5) + 32, and a tool that scales it
// instead is the classic way to get this wrong.
//
// Two answers in different units are never byte-identical: each echoes the figure entered and names its
// unit. So the comparison is deliberately deaf to that. Numbers are compared with a 2% tolerance (the
// example's own rounding moves the last digit of a derived figure), and words with every digit and unit
// token stripped out, which leaves a changed verdict or list visible and an echoed input silent. Only a
// claim the first answer makes and the second does NOT counts, because entering a weight in pounds adds a
// line converting it, and an answer that says everything it said before plus "2.646 lb = 1.2 kg" has not
// changed its mind about anything.
//
// Five rows are known and benign. `otc-child-label-dose`, `epinephrine-device-weight-band`,
// `glasgow-blatchford` and `salicylate-toxicity` each REWRITE a line of their answer to convert the figure
// entered ("44.09 lb is 20 kg", "7.96 mmol/L entered"), which reads as a lost claim and is the tool doing
// the right thing. `storage-excursion-summary` prints the storage range the publisher states in the unit
// chosen -- 2 to 8 degrees Celsius, 36 to 46 Fahrenheit, which is CDC's own pair and not 35.6 to 46.4.
//
// A row is a suspect, not a defect. NOFACTOR and UNPAIRED rows are toggles this file did not drive -- it
// could not name the analyte, or the example left the governed figure blank -- and are printed because
// "clean" is a claim about reach.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-unit-equivalent.mjs
//   TOOLS=digoxin-label-dose node scripts/probe-unit-equivalent.mjs
//   VERBOSE=1 node scripts/probe-unit-equivalent.mjs    # every pair driven

import { META } from '../lib/meta.js';
import { computeCalculator } from '../mcp/tools.js';
import { allCalculators } from '../mcp/catalog.js';

// Each table converts one of its units into the group's canonical unit (kg, cm, mmHg). The factors are
// lib/unit-convert.js's own, which is this repository's statement of each conversion.
const WEIGHT = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523125 };
const LENGTH = { cm: 1, m: 100, mm: 0.1, in: 2.54, ft: 30.48 };
const PRESSURE = { mmhg: 1, kpa: 1 / 0.133322, cmh2o: 1 / 1.35951 };
// Celsius is canonical; the pair is affine, not a scale (lib/unit-convert.js: fToC, cToF).
const TEMPERATURE = {
  c: { to: (v) => v, from: (v) => v },
  celsius: { to: (v) => v, from: (v) => v },
  f: { to: (v) => (v - 32) * 5 / 9, from: (v) => v * 9 / 5 + 32 },
  fahrenheit: { to: (v) => (v - 32) * 5 / 9, from: (v) => v * 9 / 5 + 32 },
};

// mg/dL -> SI multipliers, by analyte. One analyte is matched per governed figure, longest name first
// ('phosphate' before 'urate' would be wrong, and 'cholesterol' must beat 'chol').
const ANALYTE = {
  creatinine: 88.4, bilirubin: 17.104, glucose: 1 / 18.0182, urea: 1 / 2.8, bun: 1 / 2.8,
  calcium: 1 / 4.008, phosphate: 1 / 3.097, phosphorus: 1 / 3.097, cholesterol: 1 / 38.67,
  chol: 1 / 38.67, hdl: 1 / 38.67, ldl: 1 / 38.67, triglyceride: 1 / 88.57, lactate: 1 / 9.008,
  albumin: 10, uricacid: 59.48, urate: 59.48, magnesium: 1 / 2.431, salicylate: 1 / 13.812,
};
const ANALYTE_NAMES = Object.keys(ANALYTE).sort((a, b) => b.length - a.length);
const SI_ALIASES = ['mmol', 'mmoll', 'mmol/l', 'mmol-l', 'umol', 'umol/l', 'micromol/l', 'g/l'];
const US_ALIASES = ['mg', 'mgdl', 'mg/dl', 'mg-dl', 'g/dl', 'bun-mgdl'];

const norm = (v) => String(v).trim().toLowerCase();
// The field's OWN name first, then its label, and only then the tool's id. Reading the id first gave
// every figure of `calcium-phosphate-product` the phosphate factor, calcium included.
const analyteOf = (numField, tool) => {
  for (const hay of [norm(numField.arg), norm(numField.label || ''), norm(tool.id)]) {
    const hit = ANALYTE_NAMES.find((a) => hay.includes(a));
    if (hit) return hit;
  }
  return null;
};

// A plan for one toggle: how to convert ONE governed figure from one of the toggle's units to another.
// `scale(numField, unit)` is the multiplier into the group's canonical unit, or null when unknown.
function planFor(field, tool) {
  const vals = field.values.map(norm);
  const dimension = (table, anchors) => (vals.every((v) => v in table) && anchors.some((a) => vals.includes(a))
    ? Object.fromEntries(field.values.map((v) => [v, table[norm(v)]]))
    : null);
  const w = dimension(WEIGHT, ['kg', 'lb']); if (w) return { kind: 'weight', scale: (_n, u) => w[u] };
  const l = dimension(LENGTH, ['cm', 'in']); if (l) return { kind: 'length', scale: (_n, u) => l[u] };
  const p = dimension(PRESSURE, ['mmhg', 'kpa']); if (p) return { kind: 'pressure', scale: (_n, u) => p[u] };
  if (vals.length === 2 && vals.every((v) => v in TEMPERATURE) && vals.some((v) => v.startsWith('f'))) {
    const by = Object.fromEntries(field.values.map((v) => [v, TEMPERATURE[norm(v)]]));
    return { kind: 'temperature', affine: true, scale: () => 1, convert: (_n, v, from, to) => by[to].from(by[from].to(v)) };
  }
  if (vals.length === 2 && vals.some((v) => SI_ALIASES.includes(v)) && vals.some((v) => US_ALIASES.includes(v))) {
    return {
      kind: 'analyte',
      analyteNeeded: true,
      scale: (n, u) => {
        const a = analyteOf(n, tool);
        return a ? (SI_ALIASES.includes(norm(u)) ? 1 / ANALYTE[a] : 1) : null;
      },
    };
  }
  return null;
}

// The stem a unit field governs: 'weightUnit' -> 'weight', 'unit' -> ''.
const stemOf = (arg) => String(arg).replace(/_?[Uu]nits?$/, '').replace(/[^a-z]/gi, '').toLowerCase();

// With no stem ('unit'), the figures a DIMENSION toggle governs are the ones whose own name says so.
const DIMENSION_WORDS = { weight: /weight|mass/i, length: /height|length/i, pressure: /pressure/i, temperature: /temp/i };
// A line of readings carries its value last: "20" is the value, and so is the 5 in
// "2026-10-01 08:00, 5". Converting the last number on each line leaves dates and times alone.
const convertLines = (text, f) => String(text).split('\n').map((line) => {
  const m = [...line.matchAll(/-?\d+(?:\.\d+)?/g)].pop();
  if (!m) return line;
  const v = Number(Number(f(Number(m[0])).toPrecision(10)));
  return line.slice(0, m.index) + String(v) + line.slice(m.index + m[0].length);
}).join('\n');

// A plausible figure per dimension, for a governed field the worked example leaves blank.
const FILL = { weight: 70, length: 170, pressure: 100, analyte: 100 };

const ONLY = process.env.TOOLS ? new Set(process.env.TOOLS.split(',')) : null;

// Every number a converted answer prints, in order, so two answers can be compared loosely.
function numbersOf(x, out = []) {
  if (typeof x === 'number') out.push(x);
  else if (Array.isArray(x)) x.forEach((v) => numbersOf(v, out));
  else if (x && typeof x === 'object') Object.keys(x).sort().forEach((k) => numbersOf(x[k], out));
  return out;
}
function wordsOf(x, out = []) {
  if (typeof x === 'string') out.push(x);
  else if (Array.isArray(x)) x.forEach((v) => wordsOf(v, out));
  else if (x && typeof x === 'object') Object.keys(x).sort().forEach((k) => wordsOf(x[k], out));
  return out;
}
// Every digit group and every unit word taken out: what is left is the answer's claim, not its arithmetic.
const UNIT_WORDS = /\b(kg|kgs|g|mg|mcg|lb|lbs|pound|pounds|oz|cm|mm|m|in|inch|inches|ft|feet|mmhg|kpa|cmh2o|mmol|micromol|umol|mol|l|dl|ml)\b/gi;
const claim = (s) => s.replace(/\u00b0\s*[CF]/g, '').replace(/[\d.,]+/g, '#').replace(UNIT_WORDS, '').replace(/[^a-z#]+/gi, ' ').trim();

let rows = 0; let skipped = 0; let checked = 0;
for (const t of allCalculators()) {
  if (ONLY && !ONLY.has(t.id)) continue;
  // A COPY: the fill below writes into it, and META's example is shared with every other reader.
  const example = META[t.id]?.example?.fields;
  if (!example) continue;
  const ex = { ...example };
  const nums = (t.fields || []).filter((f) => f.kind === 'number' && !Array.isArray(f.values));
  for (const f of (t.fields || [])) {
    if (f.kind !== 'enum' || !Array.isArray(f.values) || f.values.length < 2) continue;
    const plan = planFor(f, t);
    if (!plan) continue;
    // The figures this toggle governs. A named stem ('weightUnit') claims the fields carrying it; a bare
    // 'unit' claims every figure whose own analyte this file knows, and each is converted by ITS OWN
    // factor -- the calcium-phosphate product reads two figures through one toggle, 4.008 and 3.097.
    const stem = stemOf(f.arg);
    let governed = stem ? nums.filter((n) => norm(n.arg).includes(stem) || norm(n.label || '').includes(stem)) : [];
    // A bare 'unit' on a dimension toggle: the figures whose own name says what they measure, plus a
    // readings box, which is where a temperature tool keeps its series.
    if (!governed.length && DIMENSION_WORDS[plan.kind]) {
      const word = DIMENSION_WORDS[plan.kind];
      governed = nums.filter((n) => word.test(`${n.arg} ${n.label || ''}`));
      if (plan.kind === 'temperature') {
        const series = (t.fields || []).filter((n) => n.kind === 'string' && /reading/i.test(`${n.arg} ${n.label || ''}`));
        governed = [...governed, ...series];
      }
    }
    if (!governed.length && plan.analyteNeeded) {
      governed = nums.filter((n) => plan.scale(n, f.values[0]) !== null);
      if (!governed.length && nums.length === 1) governed = nums;
    }
    if (!governed.length || governed.some((n) => plan.scale(n, f.values[0]) === null)) {
      skipped++;
      const why = plan.analyteNeeded ? `no mg/dL-to-SI factor here for ${governed.map((n) => n.arg).join(',') || 'any figure'}` : 'no figure carries this toggle\'s name';
      console.log(`NOFACTOR\t${t.id}\t${f.arg}\t${f.values.join('|')}\t(${why})`);
      continue;
    }
    const from = ex[f.dom] ?? f.values.find((v) => v === f.default) ?? f.values[0];
    if (!f.values.includes(from)) continue;
    let have = governed.filter((n) => ex[n.dom] !== '' && ex[n.dom] !== undefined
      && (n.kind === 'string' ? /\d/.test(String(ex[n.dom])) : Number.isFinite(Number(ex[n.dom]))));
    // spec-v1759's lesson: a figure the worked example leaves blank was never driven. Fill it with a value
    // in the toggle's current unit that the tool answers from, so an optional weight behind a unit toggle
    // is asked the same question as a required one.
    if (!have.length) {
      const filled = [];
      for (const n of governed) {
        const mid = Number.isFinite(n.min) && Number.isFinite(n.max) ? (n.min + n.max) / 2 : null;
        const v = [mid, FILL[plan.kind], 10, 1].find((x) => x !== null && x > 0
          && computeCalculator({ id: t.id, inputs: { ...ex, [f.dom]: from, [n.dom]: String(x) } }).valid !== false);
        if (v !== undefined) { ex[n.dom] = String(v); filled.push(n); }
      }
      have = filled;
      if (!have.length) { skipped++; console.log(`UNPAIRED\t${t.id}\t${f.arg}\t(the example leaves ${governed.map((g) => g.arg).join(',')} blank, and no value this file tried was answered)`); continue; }
      console.log(`FILLED\t${t.id}\t${f.arg}\t${have.map((n) => `${n.arg}=${ex[n.dom]} ${from}`).join(' ')}`);
    }
    // The unit is written in explicitly: an example that leaves the toggle to its default is still asking
    // its question in `from`, and a filled figure without its unit is refused.
    ex[f.dom] = from;
    const base = computeCalculator({ id: t.id, inputs: { ...ex } });
    if (base.valid === false) continue;
    for (const to of f.values) {
      if (to === from) continue;
      const inputs = { ...ex, [f.dom]: to };
      for (const n of have) {
        const one = (x) => (plan.convert ? plan.convert(n, x, from, to) : x * plan.scale(n, from) / plan.scale(n, to));
        inputs[n.dom] = n.kind === 'string'
          ? convertLines(ex[n.dom], one)
          : String(Number(one(Number(ex[n.dom])).toPrecision(10)));
      }
      const other = computeCalculator({ id: t.id, inputs });
      checked++;
      if (process.env.VERBOSE) console.log(`DRIVEN\t${t.id}\t${f.arg}\t${from}->${to}\t${plan.kind}\t${have.map((n) => n.arg).join(',')}`);
      if (other.valid === false) { rows++; console.log(`REFUSED\t${t.id}\t${f.arg}\t${from}->${to}\t${plan.kind}\t${String(other.message || other.error || '').slice(0, 80)}`); continue; }
      const a = numbersOf(base.result ?? base); const b = numbersOf(other.result ?? other);
      // A figure an answer states IN THE UNIT ENTERED must move, and move by exactly the conversion: a
      // non-HDL cholesterol of 150 mg/dL is 3.879 mmol/L, and that is the same answer. So a changed
      // number is accepted when its ratio is one the conversion itself explains -- one governed factor,
      // its reciprocal, or a product of two (the calcium-phosphate product is a figure in mg2/dL2) --
      // within 0.1%, which is tight enough to leave a truncated factor (2.2 for 2.2046) visible.
      const factors = plan.affine ? [] : have.map((n) => plan.scale(n, from) / plan.scale(n, to));
      const explained = new Set([1]);
      for (const r of factors) for (const q of [1, ...factors]) { explained.add(r * q); explained.add(1 / (r * q)); explained.add(r / q); }
      // The converted figure is compared at the precision it is PRINTED to: a non-HDL of 130 mg/dL shown
      // as 3.4 mmol/L is 3.3617 rounded to one decimal, which is right, while a truncated factor is off
      // by more than half of that last digit and stays visible.
      const halfDigit = (y) => { const d = (String(y).split('.')[1] || '').length; return 0.5 * 10 ** -Math.min(d, 6); };
      const moved = (x, y) => {
        if (Math.abs(x - y) <= Math.max(0.02 * Math.abs(x), 1e-9)) return false;
        // A temperature an answer restates in the unit entered moves by the affine conversion, and a
        // DIFFERENCE between two temperatures moves by the scale alone (9/5), which is why both are here.
        if (plan.affine) {
          return ![plan.convert(have[0], x, from, to), x * 9 / 5, x * 5 / 9]
            .some((want) => Math.abs(y - want) <= Math.max(halfDigit(y), 1e-9));
        }
        if (x === 0) return true;
        return ![...explained].some((r) => Math.abs(y - x * r) <= Math.max(halfDigit(y), 1e-9));
      };
      const numMoved = a.length !== b.length || a.some((x, i) => moved(x, b[i]));
      const bag = new Map();
      for (const w of wordsOf(other.result ?? other).map(claim)) bag.set(w, (bag.get(w) || 0) + 1);
      const dropped = [];
      for (const w of wordsOf(base.result ?? base).map(claim)) {
        if (bag.get(w)) bag.set(w, bag.get(w) - 1); else dropped.push(w);
      }
      if (!numMoved && !dropped.length) continue;
      rows++;
      console.log(`${dropped.length ? 'WORDS' : 'NUMBER'}\t${t.id}\t${f.arg}\t${from}->${to}\t${plan.kind}\t${have.map((n) => `${n.arg}=${String(ex[n.dom]).replace(/\n/g, ';').slice(0, 30)}->${String(inputs[n.dom]).replace(/\n/g, ';').slice(0, 30)}`).join(' ')}`);
      if (dropped.length) {
        const said = wordsOf(base.result ?? base);
        console.log(`\t\t${dropped.map((w) => said.find((s) => claim(s) === w) || w).slice(0, 2).join(' ;; ').slice(0, 300)}`);
      } else {
        const d = a.map((x, i) => (moved(x, b[i]) ? `${x} => ${b[i]}` : null)).filter(Boolean);
        console.log(`\t\t${d.slice(0, 6).join(' ; ')}`);
      }
    }
  }
}
console.error(`${checked} unit pair(s) driven, ${rows} suspect(s), ${skipped} toggle(s) not driven. VERBOSE=1 lists every pair driven.`);
