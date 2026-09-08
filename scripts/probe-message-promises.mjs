// spec-v1121: rule 23, made a check instead of a habit.
//
// Five tiles in six waves refused with a message that NAMED an input the guard
// beside it did not require:
//
//   ipss-r-mds      "Enter the cytogenetic risk group, marrow blast %, ..."
//   ckd-epi-cystatin "Enter age (years), sex, and serum cystatin C ..."
//   gap-ipf         "Enter sex, age, FVC %predicted, and DLCO %predicted ..."
//   cpis-vap        "... then select the remaining CPIS components ..."
//   truelove-witts  "Enter the number of stools per day and whether rectal
//                    bleeding is present."
//
// Each was found by reading one tile. The message is the author's own account of
// what the instrument needs; the guard is often a subset of it. That gap is
// mechanically detectable, and this is the check.
//
// THE METHOD. Take a tile's refusal message (what it says when called with
// nothing). For each field whose adapter LABEL is named in that message, fill
// the tile from its worked example, drop that one field, and see whether it
// still answers. If it does, the message promised something the guard does not
// keep.
//
// Matching is deliberately conservative: a field is "named" only if a
// distinctive word from its label appears in the message. That under-reports,
// which is the right direction for a finder whose rows are meant to be read.
//
//   node scripts/probe-message-promises.mjs

import { allCalculators } from '../mcp/catalog.js';
import { computeCalculator } from '../mcp/tools.js';
import { META } from '../lib/meta.js';

// Words too common to identify a field.
const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'to', 'for', 'per', 'by', 'with',
  'enter', 'select', 'choose', 'value', 'values', 'score', 'total', 'count',
  'level', 'levels', 'rate', 'grade', 'stage', 'class', 'test', 'result',
  'optional', 'units', 'unit', 'mg', 'dl', 'ml', 'mmol', 'kg', 'cm', 'years',
  'year', 'percent', 'ratio', 'index', 'number', 'if', 'is', 'are', 'not',
  'no', 'yes', 'any', 'all', 'each', 'this', 'that', 'from', 'at', 'on',
  // spec-v1121: added after the first run. `calcium-phosphate-product|capo4-unit`
  // matched on the single word "input", from a message about a DIFFERENT field
  // ("Missing required input \"capo4-ca\""). A word that appears in the
  // scaffolding of a refusal cannot identify the field it is about.
  'input', 'inputs', 'missing', 'required', 'measurement', 'measurements',
]);

// spec-v1121: a message that offers a CHOICE is not promising to require every
// option in it. `rifle-aki` says "Enter baseline and current creatinine, and/or
// the urine-output category"; `snappe-ii` says "Enter at least one SNAPPE-II
// measurement --" and then lists seven. Naming a field inside a disjunction is
// the opposite of requiring it, and reading those rows as promises is how a
// finder starts costing more than it saves.
const DISJUNCTIVE = /\bat least one\b|\band\/or\b|\bor mark\b|, or \b|\beither\b/i;

const words = (s) => String(s || '')
  .toLowerCase()
  .replace(/[^a-z0-9 ]+/g, ' ')
  .split(/\s+/)
  .filter((w) => w.length > 3 && !STOP.has(w));

const rows = [];
let tilesWithMessage = 0;
let fieldsNamed = 0;

for (const tool of allCalculators()) {
  const empty = computeCalculator({ id: tool.id, inputs: {} });
  const message = String(empty?.message || empty?.result?.band || '');
  if (empty?.valid === true || !message) continue;
  tilesWithMessage += 1;

  const ex = META[tool.id]?.example?.fields;
  if (!ex) continue;
  const full = computeCalculator({ id: tool.id, inputs: { ...ex } });
  if (full?.valid !== true) continue;

  if (DISJUNCTIVE.test(message)) continue;
  const msgWords = new Set(words(message));
  for (const f of tool.fields || []) {
    if (f.required) continue;                       // the guard already keeps it
    // Booleans are excluded on purpose, as in every other probe here: rule 4
    // says an unticked checkbox is a real "no", so a message naming one is
    // describing a criterion the reader HAS answered. `asas-axspa` was the first
    // row this probe printed and the first it had to drop -- its two entry
    // criteria are checkboxes, and "entry criterion not met" is a legitimate
    // reading of two boxes left unticked.
    if (f.kind === 'bool') continue;
    if (ex[f.dom] === undefined || String(ex[f.dom]).trim() === '') continue;
    const label = words(f.label);
    if (!label.length) continue;
    // Named if EVERY distinctive word of the label appears in the message. That
    // is strict on purpose: "sex" alone is not enough to claim a field is named.
    if (!label.every((w) => msgWords.has(w))) continue;
    fieldsNamed += 1;

    const partial = { ...ex };
    delete partial[f.dom];
    const got = computeCalculator({ id: tool.id, inputs: partial });
    if (got?.valid !== true) continue;              // it does refuse: promise kept
    rows.push({
      id: tool.id,
      dom: f.dom,
      label: String(f.label),
      message: message.slice(0, 110),
      answered: String(got.result?.band || got.result?.bandLabel || '').slice(0, 90),
    });
  }
}

console.log(`${rows.length} field(s) are NAMED in a tile's own refusal message and not required by it.\n`);
for (const r of rows) {
  console.log(`  ${r.id}|${r.dom}  (${r.label})`);
  console.log(`      says:     "${r.message}"`);
  console.log(`      answers:  ${r.answered}`);
}
// spec-v1099: a finder's reach is part of its result.
console.log(`\nReach: ${tilesWithMessage} tiles refuse an empty call with a message;`);
console.log('Messages offering a CHOICE ("at least one", "and/or", ", or") are skipped: naming a');
console.log('field inside a disjunction is the opposite of promising to require it.');
console.log(`${fieldsNamed} of their non-required, non-boolean fields are named in it by label.`);
console.log('A field is "named" only if every distinctive word of its label appears in the');
console.log('message, so this under-reports rather than over-reports.');
