#!/usr/bin/env node
// spec-v1202: the guard that is already in the file, one function away.
//
// `scripts/probe-half-guarded.mjs` (spec-v1101) asks this WITHIN one tile: does
// it refuse for one missing input and stay silent on another? Five times in one
// run the same thing was true a level up -- between EXPORTED FUNCTIONS OF THE
// SAME MODULE:
//
//   lib/acidbase-v129.js   stewartSidSig loops boundsAdvisory over its analytes
//                          and ends on the rule -- "Guard the set, not the field
//                          that was reported" -- while the four gas functions
//                          beside it had nothing (spec-v1198).
//   lib/scoring-v4.js      mews got the envelope guard in spec-v1181; news2 sits
//                          directly above it, and the comment INSIDE mews names
//                          news2 as sharing the defect (spec-v1199).
//
// A module is written by one hand at one sitting. When one of its functions calls
// a guard helper and its neighbours do not, that is almost never a considered
// difference -- it is the half somebody was fixing at the time.
//
// The question is static, so this is a grep, not a sweep: no calculator is run.
// A row is a SUSPECT. Some functions legitimately take no measurement at all, and
// the reach line below says how many were skipped for that reason.
//
// DRIVEN 2026-11-15 (spec-v1731): the 45 functions' tools were given 999999 in
// every number field. 65 fields answered; 16 now refuse through an existing
// lib/bounds.js envelope or a definitional bound. The other 49 need envelopes
// bounds.js does not have yet; docs/spec-v1731.md lists them by quantity.
//
// RE-DRIVEN 2026-11-26 (spec-v1820). The declaration programme of spec-v1793 to spec-v1819 has taken the
// residue from 49 to FIFTEEN, and the one of those fifteen that needed no source is fixed in spec-v1820:
// the four NIHSS fields in lib/neuro-v117.js now state the scale's own 0-42. The fourteen left are a
// quantity bounds.js does not have, and each needs its source rather than a wave (docs/spec-v1206.md):
//
//   a total cholesterol (framingham-cvd, reynolds-risk, non-hdl-remnant), a high-sensitivity CRP
//   (reynolds-risk) and a CRP in mg/L (lrinec), an FEV1 percent predicted (gold-spirometry), a net QRS
//   deflection in mm (ecg-axis, two fields), the three ABC/2 hematoma diameters in cm (ich-volume-abc2),
//   a lung-nodule diameter in mm (fleischner-2017), a chronological age in MONTHS (corrected-age) and a
//   spot urine creatinine (urine-calcium-cr).
//
// spec-v1823 took the first two quantities on that list: `cholesterol` and `crp` are envelopes now, and
// ten tools stopped scoring past them. What is left, with what each one needs:
//
//   fleischner-2017's nodule diameter is NOT an envelope question but a SCOPE one, and the most useful of
//   the remainder. The 2017 statement is guidance for incidental pulmonary NODULES, and the Fleischner
//   Society's glossary (Hansell DM et al, "Fleischner Society: glossary of terms for thoracic imaging",
//   Radiology 2008;246(3):697-722) is where the nodule/mass boundary is defined. The tool currently reads
//   a lesion of 999999 mm as "single solid, > 8 mm: consider CT at 3 months, PET/CT, or tissue sampling".
//   The boundary was NOT confirmed from either paper here, so it is not encoded: read the glossary, then
//   refuse past it the way `fittedAgeFault` refuses outside a model's fitted ages.
//
//   The age in months is the trap spec-v1797 named, below. spec-v1825 took the urine creatinine, fenced by
//   CDC's NHANES reportable range rather than by a case report.
//
// spec-v1826 went after the last three and got three different answers. The searches are recorded so the
// next reader does not repeat them:
//
//   FEV1 PERCENT PREDICTED IS CLOSED, and needed no fence. `gold-spirometry`, `bode-index`,
//   `bronchiectasis-bsi` and `faced-bronchiectasis` give the IDENTICAL reading at 80, 160 and 999999
//   percent, because every one of those instruments has an OPEN-ENDED top band (GOLD 1 is ">= 80%", BODE's
//   top band ">= 65%", FACED's "> 50%", BSI's ">= 50%"). There is no wrong answer to fix. No individual
//   maximum is published either: group means reach about 122% in swimmers and supra-normal values appear in
//   14% of an elite cohort against GLI, but no extreme.
//
//   THE QRS AMPLITUDE IS THE ONE EXPOSURE, and it has no source. `ecg-axis` reads a net lead-I deflection
//   of 999999 as "Mean QRS axis 0 deg: NORMAL axis" where the worked example reads 50.2 degrees -- the
//   arctangent is right for the numbers given, so a typo silently moves the axis toward normal. A fence
//   would need the highest R-wave amplitude the literature reports at standard calibration, which was not
//   found.
//
//   THE ABC/2 DIAMETERS print an impossible volume rather than a wrong band: `ich-volume-abc2` reads
//   "ICH volume 5,999,994 mL", where a head holds about 1,180 to 1,761 mL by MRI (a 19-subject validation
//   series, mean 1,504 +/- 169). The stroke literature reports ICH THRESHOLDS -- 25 mL life-threatening,
//   above 50 poor outcome, 60 with GCS under 8 over 90% 30-day mortality, 89.5 mL for lobar -- and no
//   maximum. So a ceiling here would be a number chosen rather than cited, which is what spec-v1206 and
//   spec-v1797 both forbid; the intracranial volume is the figure to start from when someone sources it.
//
// The last two are the trap spec-v1797 named: `ageYears` x 12 and `scr` are envelopes for a DIFFERENT
// quantity, and borrowing one for its ceiling is an obfuscated literal, not a bound.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-unguarded-sibling.mjs
//   node scripts/probe-unguarded-sibling.mjs --helper boundsAdvisory
//   node scripts/probe-unguarded-sibling.mjs --all   (include modules with one exported function)

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? (process.argv[i + 1] || true) : null;
};
const onlyHelper = arg('--helper');
const showAll = !!arg('--all');

// The guards worth asking about: each one is a house helper that turns an input
// nobody could have measured into a refusal. Add to this list, not to a copy of
// it -- the whole point of this probe is that lists like this drift.
// spec-v1209 added `gradeFault` and this line is why the instruction above it is
// worded that way: the new helper guarded two of this probe's own residue rows
// and the probe went on printing them, because the list did not know the name.
const GUARDS = ['boundsAdvisory', 'inputFault', 'gradeFault', 'negativeMeasurementFault', 'outsideEnvelope', 'outOfRange', 'outsideRange'];

// spec-v1237: ...and a guard does not have to be a HELPER CALL. Three functions
// were reported for not guarding a measurement they do guard, by comparing it
// against the table directly:
//
//   if (plt > BOUNDS.platelets.max) return { valid: false, message: `A platelet
//     count of ${plt} is above ~${BOUNDS.platelets.max}, beyond recorded
//     extremes. This field is in x10^9/L ...` };
//
// That is `fornsIndex` (spec-v1174), and `lokIndex` and `nafldFibrosis` beside
// it. It reads the same table, refuses the same values, and says more about the
// unit confusion it exists for than any helper's sentence does -- it is the
// better guard, and the probe called it absent.
//
// The lesson is the one in the comment above `GUARDS`, one level up: a list of
// NAMES drifts from the thing it is a list of. This probe watched six helper
// names and the question is "does this function refuse an impossible
// measurement", which a direct comparison answers too.
const DIRECT_GUARD = /\bBOUNDS\.\w+\.(?:max|min)\b/;

// A function that takes no measurement cannot be missing a measurement guard.
// This is deliberately generous: any read of a numeric-looking input counts.
// spec-v1203: `num(` is NOT on this list. lib/num.js's `num(name, v, {min,max})`
// guards an OUTPUT -- it is what keeps a NaN off the screen -- so a function that
// calls it may read no input at all. `nacseldAclf` counts four booleans and
// passes the total through it, and was reported for having no input guard.
// Every other name here is an input parser.
const READS_A_NUMBER = /\b(?:pos|nonneg|fin|inRange|optNum|positive|toNum|numOr)\s*\(/;

// spec-v1203: and it must be a CALL, not the same letters inside a sentence.
// The first version tested the raw source, so `sirs` -- whose inputs are four
// booleans -- was reported for the phrase "SIRS-positive (3 of 4 criteria)" in
// its own band. Comments and string literals are prose; only code is a call.
function codeOnly(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')          // block comments
    .replace(/^[ \t]*\/\/.*$/gm, ' ')             // line comments
    .replace(/`(?:\\[\s\S]|[^`\\])*`/g, '` `')    // template literals
    .replace(/'(?:\\.|[^'\\])*'/g, "' '")         // single-quoted
    .replace(/"(?:\\.|[^"\\])*"/g, '" "');        // double-quoted
}

// Brace-match from the `{` that opens the body -- which is the first `{` AFTER
// the parameter list closes, not the first `{` after `function`: a default
// parameter (`input = {}`) is a brace too, and matching that one returns the
// signature alone and reports every function as reading nothing.
function bodyOf(src, from) {
  const paren = src.indexOf('(', from);
  let pd = 0; let i = paren;
  for (; i < src.length; i += 1) {
    if (src[i] === '(') pd += 1;
    else if (src[i] === ')') { pd -= 1; if (pd === 0) break; }
  }
  const open = src.indexOf('{', i);
  if (open === -1) return src.slice(from);
  let depth = 0;
  for (let j = open; j < src.length; j += 1) {
    if (src[j] === '{') depth += 1;
    else if (src[j] === '}') { depth -= 1; if (depth === 0) return src.slice(from, j + 1); }
  }
  return src.slice(from);
}

const rows = [];
let modulesRead = 0;
let modulesWithAGuard = 0;
let skippedNoNumber = 0;

for (const file of readdirSync(`${ROOT}lib`).filter((f) => f.endsWith('.js')).sort()) {
  const src = readFileSync(`${ROOT}lib/${file}`, 'utf8');
  const helpers = GUARDS.filter((g) => (onlyHelper && onlyHelper !== true ? g === onlyHelper : true))
    .filter((g) => new RegExp(`\\b${g}\\s*\\(`).test(src));
  if (!helpers.length) continue;
  modulesRead += 1;

  // Split on top-level `export function name(`, keeping each body with its name.
  const parts = [...src.matchAll(/^export function ([A-Za-z0-9_$]+)\s*\(/gm)];
  if (parts.length < 2 && !showAll) continue;
  modulesWithAGuard += 1;

  // spec-v1210: the body ends at the function's OWN closing brace, not at the
  // next `export function`. Slicing to the next export swept up every
  // module-level constant, lookup table and private helper declared in between
  // and attributed them to the function above -- which is how `rutherfordFontaine`,
  // whose only input is a string key into a lookup, was reported for not guarding
  // a measurement. It reads no number; the `pos(` belonged to the code after it.
  const bodies = parts.map((m) => ({ name: m[1], body: bodyOf(src, m.index) }));

  // A function that IS one of the guards is not a function that calls one --
  // `lib/num.js` exports `inputFault` itself, and without this it reported its own
  // neighbours for not calling it.
  const guarded = bodies.filter((b) => !helpers.includes(b.name)
    && (helpers.some((g) => new RegExp(`\\b${g}\\s*\\(`).test(b.body))
      || DIRECT_GUARD.test(codeOnly(b.body))));
  if (!guarded.length) continue;   // the helper is used outside any export; not this question

  const unguarded = bodies.filter((b) => !guarded.includes(b));
  const candidates = unguarded.filter((b) => {
    if (!READS_A_NUMBER.test(codeOnly(b.body))) { skippedNoNumber += 1; return false; }
    return true;
  });
  if (!candidates.length) continue;

  rows.push({
    file, helpers,
    guarded: guarded.map((b) => b.name),
    unguarded: candidates.map((b) => b.name),
  });
}

console.log('Modules where one exported function calls a measurement guard and a');
console.log('sibling that also reads numbers does not. A module is written by one');
console.log('hand at one sitting, so this is rarely a considered difference.\n');
console.log(`${rows.length} module(s), ${rows.reduce((n, r) => n + r.unguarded.length, 0)} function(s).\n`);

for (const r of rows) {
  console.log(`  ${r.file}   [${r.helpers.join(', ')}]`);
  console.log(`      guards  : ${r.guarded.join(', ')}`);
  console.log(`      does not: ${r.unguarded.join(', ')}`);
}

console.log(`\nReach: ${modulesRead} of the modules in lib/ call one of ${GUARDS.length} watched guards;`);
console.log('a direct `BOUNDS.<key>.max` comparison counts as a guard too (spec-v1237).');
console.log(`${modulesWithAGuard} of those export more than one function and are comparable,`);
console.log(`and ${skippedNoNumber} sibling(s) were skipped for reading no numeric input at all.`);
