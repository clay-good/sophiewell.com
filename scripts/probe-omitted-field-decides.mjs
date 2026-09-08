#!/usr/bin/env node
// spec-v1092: could the field nobody entered have changed the CONCLUSION?
//
// The probe beside this (scripts/probe-omitted-item.mjs) drops one field from a
// tile's worked example and asks whether the answer MOVED. That question is
// bounded by the example: it can only reach the readings the example's own
// values reach, and worked examples are written alarming, so dropping a field
// usually leaves an alarming reading standing -- which is the floor, and the
// safe direction.
//
// spec-v1091 was found by hand for exactly that reason. `mitral-stenosis-stage`
// and `aortic-regurgitation-stage` both graded from a subset of criteria and
// called it "no severe obstruction", and the older probe saw nothing wrong with
// either, because both examples are severe on every criterion. The defect lives
// on the REASSURING side of the threshold, where the example never goes.
//
// So this probe asks a question the example cannot bound. Drop one field, then
// try plausible values IN that field -- scaled from the example's own value, so
// each tile's range guards throw out the implausible ones -- and ask whether any
// of them would have changed the verdict. If one would, then omitting the field
// silently is a rule-out from a subset, and the tile owes the reader a word.
//
// Two sections, and the first is the one to read:
//
//   RULED OUT FROM A SUBSET -- the omitted reading is `abnormal: false` and some
//     value of the missing field makes it `abnormal: true`. This is the
//     spec-v1091 shape and it is the one that can hurt.
//   VERDICT COULD CHANGE -- the band or stage moves but `abnormal` does not, or
//     the tile does not carry `abnormal`. Weaker; read against the tile.
//   THE NUMBER IS THE VERDICT -- spec-v1142. 155 tiles carry neither a boolean
//     `abnormal` nor any of the strings `verdict()` reads, so the three sections
//     above could never print a row about one of them, and every one of the
//     catalog's converters, dosing and billing tiles is in that set. For those
//     the NUMBER is the conclusion, so the test is a finite output moving when a
//     field is dropped. It found "the patient owes $0.00" on `allowed-amount`
//     and `nsa-cost-share` from benefit terms nobody entered, and a secondary
//     payment of $0 on `cob-calc` under three methods defined by the missing
//     field (spec-v1142). Checkbox criteria dominate this section and are
//     correct by rule 4 -- an unticked box is a real "no".
//
// A row is a suspect, not a defect. A tile is right to answer from a subset when
// the criteria are genuinely independent tests of different things; what it owes
// is the footing, not a refusal (see docs/spec-v1091.md).
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-omitted-field-decides.mjs
//   node scripts/probe-omitted-field-decides.mjs --tile mitral-stenosis-stage

import { allCalculators } from '../mcp/catalog.js';
import { computeCalculator } from '../mcp/tools.js';
import { META } from '../lib/meta.js';
import { ASKING, DISCLOSING } from '../test/lib/asking-language.js';

const only = (() => {
  const i = process.argv.indexOf('--tile');
  return i > -1 ? process.argv[i + 1] : null;
})();

// Same rule as the older probe: a disclosure has to be in what the tile said
// about THESE inputs, not in its static explanatory prose.
function texts(v, out = [], top = true) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out, false));
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (top && k === 'note') continue;
      texts(x, out, false);
    }
  }
  return out;
}

// The conclusion, not the arithmetic. Raw numbers move on almost every call and
// say nothing about whether the reader would act differently; a band, a stage or
// a severity is what the reader takes away.
// The comparison strips digits. `band` embeds the score itself, so comparing the
// raw strings counted "SCORAD 37/103 -- moderate" against "SCORAD 38/103 --
// moderate" as a changed verdict: one point of arithmetic reported as if the
// reader's conclusion had moved. What matters is the category around the number.
function verdictKey(v) {
  return v === null ? null : v.replace(/[\d.]+/g, '');
}

function verdict(r) {
  if (!r || typeof r !== 'object') return null;
  const parts = [];
  for (const k of ['bandLabel', 'band', 'stage', 'severity', 'grade', 'risk', 'category', 'class']) {
    if (typeof r[k] === 'string' && r[k]) parts.push(`${k}=${r[k]}`);
  }
  return parts.length ? parts.join(' | ') : null;
}

// Values to try in the dropped field. Scaled from the example's own value so
// they stay in the right order of magnitude for that measurement, and each
// tile's own range guards reject whatever is still implausible.
function candidates(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n === 0) return [0, 1, 5, 10, 50, 100];
  const out = new Set([0, 1]);
  for (const m of [0.1, 0.25, 0.5, 0.75, 1.5, 2, 4, 10]) {
    const c = Number((n * m).toPrecision(4));
    if (Number.isFinite(c) && c >= 0) out.add(c);
  }
  return [...out];
}

const ruledOut = [];
const unflagged = [];
const couldChange = [];
const numberIsVerdict = [];

// spec-v1099: how many tiles this probe's first section can see at all.
//
// The "ruled out from a subset" test is `abnormal` going false -> true, and 698
// of the 1,682 tiles with a worked example -- 41.5% -- never set a boolean
// `abnormal`. For those the test can NEVER fire, so `smart-cop` going from
// "SMART-COP 1: low risk" to "SMART-COP 3: moderate risk" landed in the weaker
// second section: demoted for lacking a flag, not for having a weaker defect.
//
// This is the failure spec-v1092 wrote down and then walked into anyway. The
// count is printed with the report now, because a finder's reach is part of its
// result.
let tilesWithFlag = 0;
let tilesWithoutFlag = 0;
let tilesWithNeither = 0;

// spec-v1142: the finite numbers a result carries, flattened. A tile with no
// flag and no band says its conclusion in these.
function numbersIn(r, prefix = '', out = {}) {
  if (!r || typeof r !== 'object') return out;
  for (const [k, v] of Object.entries(r)) {
    if (typeof v === 'number' && Number.isFinite(v)) out[prefix + k] = v;
    else if (v && typeof v === 'object') numbersIn(v, `${prefix}${k}.`, out);
  }
  return out;
}

// Reaching the reassuring side of the threshold.
//
// The first version of this probe started from the worked example and found
// NOTHING -- including on `mitral-stenosis-stage`, the tile it was written for.
// The example is severe on both measurements, so dropping one leaves a severe
// reading standing, and severe is the floor. The example bounds this probe the
// same way it bounds the older one.
//
// So before asking whether the dropped field could flip the verdict, push the
// REMAINING fields toward a reading that is not already alarming. Scaling them
// together is crude but it is enough: a tile that grades on a threshold has a
// reassuring side, and a uniform scale reaches it. Both directions are tried
// because "reassuring" is not always "smaller" -- a valve AREA is worse small.
const SCALES = [1, 0.5, 0.25, 0.1, 2, 4, 10];

function scaleOthers(ex, exclude, numericDoms, k) {
  const out = { ...ex };
  delete out[exclude];
  if (k === 1) return out;
  for (const d of numericDoms) {
    if (d === exclude) continue;
    const n = Number(ex[d]);
    if (Number.isFinite(n) && n !== 0) out[d] = Number((n * k).toPrecision(4));
  }
  return out;
}

for (const tool of allCalculators()) {
  if (only && tool.id !== only) continue;
  const ex = META[tool.id]?.example?.fields;
  if (!ex) continue;
  const full = computeCalculator({ id: tool.id, inputs: { ...ex } });
  if (full?.valid !== true) continue;

  const hasFlag = typeof full.result?.abnormal === 'boolean';
  if (hasFlag) tilesWithFlag += 1;
  else tilesWithoutFlag += 1;
  // Neither a flag nor a band: this tile is invisible to all three sections
  // above, and the number it prints is the whole of what it says.
  const numericOnly = !hasFlag && verdict(full.result) === null;
  if (numericOnly) tilesWithNeither += 1;
  const fullNumbers = numericOnly ? numbersIn(full.result) : null;

  const numericDoms = (tool.fields || [])
    .filter((f) => f.kind === 'number' && ex[f.dom] !== undefined && String(ex[f.dom]).trim() !== '')
    .map((f) => f.dom);

  // spec-v1136: this probe filtered `kind === 'number'` and had therefore never
  // examined a single ENUM -- and every defect spec-v1134 and spec-v1135 fixed
  // was on an enum select: the HEAR history and ECG, the MASCC burden of
  // illness, the modified-Fisher cisternal blood, the MG-ADL items. It is the
  // fifth check in this programme found narrowed the same way (spec-v1106 lists
  // the others), each written beside a fix expressed in number fields and
  // inheriting that scope.
  //
  // An enum needs no scaling: its plausible values are the ones it declares.
  const valuesFor = (f) => {
    if (f.kind === 'number') return null;
    const vals = Array.isArray(f.values) ? f.values.filter((x) => String(x).trim() !== '') : [];
    return vals.length ? vals : null;
  };

  for (const f of tool.fields || []) {
    const enumValues = valuesFor(f);
    const v = ex[f.dom];
    if (v === undefined || String(v).trim() === '') continue;

    // spec-v1142: the numeric arm runs BEFORE the number/enum gate below,
    // because that gate was written for the candidate-value sections and
    // narrowing this one by inheritance is how five checks in this programme
    // went blind (spec-v1106). What it deliberately skips is `boolean`: rule 4
    // says an unticked checkbox is a real "no" (the kind is `bool`, not
    // `boolean` -- checked against the catalog, not assumed), so a criterion
    // changing a total when dropped is the instrument working. Say it here
    // rather than letting a filter say it silently.
    if (numericOnly && f.kind !== 'bool') {
      const dropped = { ...ex };
      delete dropped[f.dom];
      const got = computeCalculator({ id: tool.id, inputs: dropped });
      if (got?.valid === true) {
        const said = texts(got.result).join(' ');
        if (!ASKING.test(said) && !DISCLOSING.test(said)) {
          const after = numbersIn(got.result);
          const moved = Object.keys(fullNumbers).filter((k) => after[k] !== undefined && after[k] !== fullNumbers[k]);
          if (moved.length) {
            numberIsVerdict.push({
              id: tool.id,
              field: f.dom,
              label: String(f.label || '').slice(0, 46),
              scale: 1,
              base: moved.slice(0, 3).map((k) => `${k}: ${fullNumbers[k]}`).join(', ').slice(0, 110),
              value: '(omitted)',
              verdict: moved.slice(0, 3).map((k) => `${k}: ${after[k]}`).join(', '),
            });
          }
        }
      }
    }

    if (f.kind !== 'number' && !enumValues) continue;

    let hit = null;
    // Scaling the OTHER fields is what reaches readings the example does not; an
    // enum's own candidates are fixed, but the surrounding numbers still need to
    // move, so both kinds walk the same scale list.
    for (const k of SCALES) {
      const partial = scaleOthers(ex, f.dom, numericDoms, k);
      const base = computeCalculator({ id: tool.id, inputs: partial });
      if (base?.valid !== true) continue;                    // refused: correct

      const said = texts(base.result).join(' ');
      if (ASKING.test(said) || DISCLOSING.test(said)) continue;  // said so

      const baseVerdict = verdict(base.result);
      const baseAbnormal = base.result?.abnormal;

      for (const c of (enumValues || candidates(v))) {
        const got = computeCalculator({ id: tool.id, inputs: { ...partial, [f.dom]: c } });
        if (got?.valid !== true) continue;
        const gotVerdict = verdict(got.result);
        const flip = baseAbnormal === false && got.result?.abnormal === true;
        const moved = baseVerdict && gotVerdict && verdictKey(gotVerdict) !== verdictKey(baseVerdict);
        // No flag on either side: the verdict moving is the ONLY signal there
        // is, so it carries the weight `flip` carries elsewhere.
        const noFlag = typeof baseAbnormal !== 'boolean' && typeof got.result?.abnormal !== 'boolean';
        if (!flip && !moved) continue;
        const row = {
          id: tool.id,
          field: f.dom,
          label: String(f.label || '').slice(0, 46),
          scale: k,
          base: (baseVerdict || said).slice(0, 110),
          value: c,
          verdict: gotVerdict,
          flip,
          noFlag: noFlag && moved,
        };
        if (flip) { hit = row; break; }
        if (!hit) hit = row;
      }
      if (hit && hit.flip) break;
    }
    if (hit && hit.flip) ruledOut.push(hit);
    else if (hit && hit.noFlag) unflagged.push(hit);
    else if (hit) couldChange.push(hit);

  }
}

function report(title, rows) {
  const tiles = new Set(rows.map((r) => r.id));
  console.log(`\n${title}: ${rows.length} field(s) across ${tiles.size} calculator(s)\n`);
  for (const r of rows) {
    console.log(`  ${r.id}|${r.field}  (${r.label})`);
    console.log(`      omitted -> ${r.base}${r.scale !== 1 ? `   [others x${r.scale}]` : ''}`);
    console.log(`      but ${r.field}=${r.value} -> ${String(r.verdict).slice(0, 110)}`);
  }
}

console.log('Dropping one field from each worked example, then asking whether any plausible');
console.log('value of that field would have changed the verdict -- without the tile saying so.');
report('RULED OUT FROM A SUBSET (read these first)', ruledOut);
report('NO SEVERITY FLAG, AND THE VERDICT MOVED (read these next)', unflagged);
report('VERDICT COULD CHANGE', couldChange);
report('THE NUMBER IS THE VERDICT (no flag, no band -- read by rule 4 first)', numberIsVerdict);
console.log(`\nReach: ${tilesWithFlag} tiles set a boolean \`abnormal\` and ${tilesWithoutFlag} do not.`);
console.log('The first section can only fire on the former; the second exists because of the latter.');
console.log(`Of those, ${tilesWithNeither} carry no band/stage/severity string either -- invisible to all`);
console.log('three sections until spec-v1142 added the fourth, where the number IS the conclusion.');
