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
// SECTION 3 FILTERED FOR THE DANGEROUS DIRECTION (spec-v1824, 2026-11-26). Sections 1 and 2 are gated at
// zero behind judged ledgers, and section 3's 108 rows are a prioritised reading list. They were filtered
// for the one shape that can hurt -- the OMITTED reading reassuring and the filled one not -- and four
// rows came back. Three are false positives of that filter: `posas-observer-scar` and
// `posas-patient-scar` carry "6 = normal skin" as the SCALE's explanation rather than a verdict, and
// `yellow-fever-case-def` is a case definition sitting at the tier its entered criteria support.
//
// The fourth was read in full and is correct, for a reason only the field's own wording gives:
// `congenital-syphilis-scenario` reads an omitted darkfield/PCR as not meeting the Scenario 1 criterion,
// and that option is labelled "Negative or NOT DONE". CDC's Scenario 1 needs a POSITIVE test, so a test
// nobody did does not meet it, and the field says so where the reader chooses. An omitted select reading
// as "no" is the same answer the page's own default gives.
//
// So the reassuring-direction filter is spent on this section. What is left in it has no signal to sort by
// and is a judgement per tile.
//
// SECTION 4 READ (spec-v1834, 2026-11-26), and it is the blank-as-zero question wearing another hat. All
// five rows are a field whose BLANK reads as an entered 0, and four of them are already judged with their
// reason in `scripts/probe-blank-as-zero.mjs` (spec-v1832): `insulin-correction`'s carbohydrate, labelled
// "omit for a correction-only dose"; `anesthesia-units`' modifying units, a count; and the pounds and
// ounces of `peds-weight-conv`, where a blank pounds beside an entered ounces IS zero pounds.
//
// The fifth, `lab-interpret`'s A1C, is spec-v1196's shape: the `count` is how many labs were interpreted,
// so dropping one interprets one fewer. A reading that lost a clause has fabricated nothing.
//
// So all four sections of this report are now sorted or explained: 1 and 2 are gated at zero behind judged
// ledgers, 3 is filtered for the dangerous direction and spent (above), and 4 is this.
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
import { ASKING, DISCLOSING, saysGap, ownsAGapKey } from '../test/lib/asking-language.js';

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
        // The numeric arm reads the top-level `note` that `texts()` skips.
        // That exclusion is spec-v1075's -- a tile's static explanatory prose is
        // not a disclosure about THESE inputs -- and it is right for the three
        // sections above, which grade a band. Here there is no band and no flag,
        // so `note` is the only place a reading can live at all, and excluding
        // it means the arm can never see a disclosure.
        //
        // Measured before changing it, as the house rule requires: across every
        // tile and every non-bool field, reading the note moves exactly FOUR
        // rows from flagged to exempt -- `drg-payment` and
        // `sequestration-adjust`, whose disclosures spec-v1143 wrote, and
        // `era-balance`'s two adjustment groups, whose reading when one is
        // dropped IS "OUT OF BALANCE ... a posting line is missing".
        // spec-v1812: each string on its own, because two of the vocabulary's phrases are anchored.
        const said = [...texts(got.result), String(got.result?.note || '')];
        if (!saysGap(said)) {
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

      const parts = texts(base.result);
      // spec-v1821: a structured `unanswered` / `missing` list that gained the dropped field says so too.
      if (saysGap(parts) || ownsAGapKey(base.result, full.result)) continue;
      const said = parts.join(' ');

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

// spec-v1813: the FIRST section's rows, read, with the reason each one is right.
//
// Section 1 is the one that can hurt -- the omitted reading is `abnormal: false` and some value of the
// missing field makes it true -- and it is small enough to hold at zero. The other three sections are a
// prioritised reading list of 150-odd rows and stay that way; this ledger covers section 1 only, keyed by
// the tile and the field, and `test/unit/finder-ledgers.test.js` drives `--only-ruled-out` so an unjudged
// row fails in one direction and a judged row the probe no longer reaches fails in the other.
//
// Four of the fifteen are a UNIT select, and they are judged for one reason: each names in its answer the
// unit it read the value as. That is the whole of what a tile owes here -- an agent that omits the key gets
// the house default, and the reading says which one it used, so the figure can be checked against it.
const JUDGED_RULED_OUT = {
  'homa-ir|hir-unit': 'The band states the unit it read: "HOMA-IR 0.74 (insulin 6 uU/mL, glucose 50 mg/dL)"',
  'calcium-phosphate-product|capo4-unit': 'It names the assumption AND the factor: "(no unit given; the '
    + 'calcium and phosphate were read as mg/dL, and the same pair in mmol/L would be about 12.4 times '
    + 'this)". The vocabulary does not match it because `given` is deliberately out of the disclosing list '
    + '-- "No dose is given" is a tool withholding an output, not a reader leaving an input blank',
  'rmi-ovarian|rm-var': 'The band names the variant it used in its first three characters: "RMI 1 = U(3) x '
    + 'M(3) x CA-125(20) = 180", so a reader who wanted RMI 2 can see they did not get it',
  'vitamin-d-level|vd-unit': 'It prints BOTH units for the level it read: "50 ng/mL (124.8 nmol/L)"',
  'newborn-hypoglycemia-who|nh-unit': 'The band carries the unit it read the glucose in: "glucose 4.8 mmol/L '
    + '(2.6 or more)", so a value entered in mg/dL is visibly not the one being judged',
  'osha-lead-airborne-pel-shift|olp-measured': 'It reports the day\'s limit and ASKS for the measurement '
    + 'rather than claiming compliance -- "Enter the measured TWA for the day to compare it with the limit '
    + 'and the 30 µg/m³ action level". The ask is in the top-level note, which this probe skips',
  'ischemia-time-clock|itc-limit': 'The limit is an optional extra: without it the tool gives the interval it '
    + 'was asked for and makes no statement about any threshold',
  'herd-immunity-threshold|hit-cov': 'The coverage reached is the optional comparison; without it the tool '
    + 'gives the threshold and the coverage needed and compares nothing',
  'rasburicase-dose|rbd-day': 'The day is optional and the dose does not depend on it. The course limit is '
    + 'stated unconditionally in the first note -- "once daily for up to 5 days" -- so the warning the day '
    + 'triggers is a restatement for a reader who entered one, not a fact withheld from a reader who did not',
  'occupational-dose-limit-check|odl-tede': 'The band says how many doses the comparison is over -- "None of '
    + 'the 1 entered is at its limit" -- so a reader who entered one of several sees the count they gave',
  'occupational-dose-limit-check|odl-lens': 'The same count in the same sentence',
  'iv-phosphate-order-check|ip-k': 'Its verdict is scoped to what it checked in the words of the band: "within '
    + 'the label rows checked", and the potassium row is simply not among them when it is blank',
  'cleanroom-class-check|cr-air': 'The particle-count verdict is the one asked for and is complete without the '
    + 'air sample; with a sample the tool adds a second clause about it rather than changing the first',
  'isotonicity-e-value|ie-vol': 'The final volume is optional for the sodium-chloride-equivalent reading the '
    + 'tool gives, and its own label says so',
  'loe-silness-gingival-index|gi-2': 'An index over counted surfaces: a surface count left out is zero '
    + 'surfaces at that score, which is a real answer, and it leaves the denominator as the surfaces counted',
};
// spec-v1813: and the SECOND section's rows, read the same way. It is the first section's question asked of
// a tile that carries no boolean `abnormal`, so the verdict moving is the only signal there is -- and 19
// rows is small enough to hold at zero too. Two reasons dominate: a reading that LOSES a clause has
// fabricated nothing (spec-v1196), which is every `pk-suite` row; and a criteria list that says which
// criteria were met names its own gap.
const JUDGED_UNFLAGGED = {
  'salicylate-toxicity|sal-unit': 'The reading names the unit it assumed and the factor to the other: "(no '
    + 'unit given; mg/dL assumed, and a level in mmol/L is 13.81 times this)"',
  'truelove-witts|tw-hr': 'The band ENUMERATES the systemic criteria met, and any one of them is enough for '
    + 'severe, so the grade cannot move: this is the case spec-v1239 named when it narrowed the vocabulary',
  'truelove-witts|tw-hgb': 'The same enumerated criteria list, and the same grade either way',
  'truelove-witts|tw-esr': 'The same enumerated criteria list, and the same grade either way',
  'mayo-uc|mu-en': 'It names WHICH instrument it computed: "Partial Mayo score 6 (0-9)" without the endoscopy '
    + 'subscore and "Full Mayo score 6 (0-12)" with it, each with its own range and its own band',
  'iol-power|iol-target': 'It states the target it assumed in the band: "Emmetropic IOL power 20.05 D '
    + '(A-constant adjusted +0 for AL 23.5 mm)", and emmetropia is what the field\'s own label calls 0',
  'spetzler-martin|sm-age': 'The age band is supplementary by definition and the band says what it summed: '
    + '"grade V (core sum 5)". With the age it ADDS the supplemented Spetzler-Martin-Lawton grade beside it',
  'calvert-carboplatin|cv-cap': 'The default is the FDA recommendation and the band states it was applied: '
    + '"Estimated GFR 140 mL/min capped at 125 mL/min (FDA, October 2010)". Omitting the field cannot give '
    + 'a larger dose than entering it, because the cap is the safe direction',
  'pk-suite|pk-vd': 'A reading that LOSES a clause has fabricated nothing (spec-v1196): without the volume '
    + 'of distribution the tool prints the one line it can still compute and no half-life or loading dose',
  'pk-suite|pk-cl': 'The same: the clauses that need the clearance are absent, not wrong',
  'pk-suite|pk-cp': 'The same: no target concentration, so no loading or maintenance dose is printed',
  'pk-suite|pk-tau': 'The same: no dosing interval, so no maintenance dose is printed',
  'smart-cop|sc-spo2': 'The oxygenation term takes PaO2, SpO2 OR the P/F ratio, any one of which serves, and '
    + 'the example carries all three -- so dropping the SpO2 leaves the criterion measured. spec-v1020 '
    + 'already refuses the low-risk reading when NONE of the three is entered',
  'palm-coein|pc-leiomyomaType': 'spec-v1788: the tertiary type is left out of the notation the tool prints '
    + '(L1(SM) rather than L1(SM type 0)), so its absence is on screen in the answer itself',
  'days-supply|ds-discard': 'The field is the label\'s in-use discard limit "if the label gives one", and no '
    + 'limit entered is the label having none -- a cap that does not exist cannot shorten the supply',
  'cyp2d6-activity-score|cas-dup': 'A duplication not reported is no duplication, which is what the field '
    + 'asks; reporting one without the allele is the ambiguity the tool then refuses to resolve',
  'dropper-calibration|dc-dose': 'The dose is optional and feeds a second, separate line; without it the '
    + 'tool gives the drops-per-mL identity it was asked for and says nothing about a dose',
};
const JUDGED_ALL = process.argv.includes('--all');
const ONLY_RULED_OUT = process.argv.includes('--only-ruled-out');
const judgedSeen = new Set();

function report(title, rows) {
  const tiles = new Set(rows.map((r) => r.id));
  console.log(`\n${title}: ${rows.length} field(s) across ${tiles.size} calculator(s)\n`);
  for (const r of rows) {
    console.log(`  ${r.id}|${r.field}  (${r.label})`);
    console.log(`      omitted -> ${r.base}${r.scale !== 1 ? `   [others x${r.scale}]` : ''}`);
    console.log(`      but ${r.field}=${r.value} -> ${String(r.verdict).slice(0, 110)}`);
  }
}

const sift = (rows, ledger) => rows.filter((r) => {
  const key = `${r.id}|${r.field}`;
  if (!ledger[key]) return true;
  judgedSeen.add(key);
  if (JUDGED_ALL) console.log(`JUDGED\t${key}\t${ledger[key]}`);
  return false;
});
const unjudged = sift(ruledOut, JUDGED_RULED_OUT);
const unjudgedUnflagged = sift(unflagged, JUDGED_UNFLAGGED);
const stale = [...Object.keys(JUDGED_RULED_OUT), ...Object.keys(JUDGED_UNFLAGGED)]
  .filter((k) => !judgedSeen.has(k));
if (stale.length) {
  console.log(`STALE-LEDGER: ${stale.length} judged row(s) this run no longer reaches: ${stale.join(', ')}.`);
  console.log('A reason cannot outlive what it describes -- re-read the tile and remove the row.');
}
if (ONLY_RULED_OUT) {
  report('RULED OUT FROM A SUBSET (read these first)', unjudged);
  report('NO SEVERITY FLAG, AND THE VERDICT MOVED (read these next)', unjudgedUnflagged);
  process.exit(0);
}
console.log('Dropping one field from each worked example, then asking whether any plausible');
console.log('value of that field would have changed the verdict -- without the tile saying so.');
report('RULED OUT FROM A SUBSET (read these first)', unjudged);
report('NO SEVERITY FLAG, AND THE VERDICT MOVED (read these next)', unjudgedUnflagged);
report('VERDICT COULD CHANGE', couldChange);
report('THE NUMBER IS THE VERDICT (no flag, no band -- read by rule 4 first)', numberIsVerdict);
console.log(`\nReach: ${tilesWithFlag} tiles set a boolean \`abnormal\` and ${tilesWithoutFlag} do not.`);
console.log('The first section can only fire on the former; the second exists because of the latter.');
console.log(`Of those, ${tilesWithNeither} carry no band/stage/severity string either -- invisible to all`);
console.log('three sections until spec-v1142 added the fourth, where the number IS the conclusion.');
