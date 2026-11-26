#!/usr/bin/env node
// spec-v1832: a BLANK field read as an entered 0, where that moves the answer and nothing says so.
//
// `scripts/probe-blank-coercions.mjs` is the grep half of this question: it finds the coercion shape
//
//   const n = Number(v); return Number.isFinite(n) ? n : null;
//
// which returns 0 rather than null for a value nobody entered, because `Number('')` is 0 and 0 is finite.
// It prints 162 source lines and its own header says to read them rather than fix them in bulk, because
// most are harmless -- a clamp on a rating item whose floor is 0 anyway.
//
// spec-v1733 answered the question properly by DRIVING it instead, and this is that drive, kept:
//
//   blank the field on the page's path, enter 0 in it, and compare. If the two readings are byte for byte
//   the same, the tool cannot tell them apart. That matters only when the reading also MOVED from the
//   worked example's -- otherwise nothing is at stake -- and only when nothing on screen owns the gap.
//
// WHAT IS LEFT IS NOT A DEFECT LIST. For most of these 0 IS the answer a blank means: no clots on a PBAC
// chart, no surfaces at that plaque score, no deductible remaining, an unburned body area, a drug not
// taken. The ledger below records each with the reason, so the report is empty until a field appears whose
// quantity CANNOT be zero -- an FiO2, a plasma sodium, a volume of distribution -- which is the shape
// spec-v1040 found four of.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-blank-as-zero.mjs
//   node scripts/probe-blank-as-zero.mjs --all

import { allCalculators } from '../mcp/catalog.js';
import { computeCalculator } from '../mcp/tools.js';
import { META } from '../lib/meta.js';
import { saysGap, ownsAGapKey } from '../test/lib/asking-language.js';

const ALL = process.argv.includes('--all');

// Each row, with the reason a zero is a real reading of that quantity. Grouped by the shape of the reason,
// because writing it out forty-one times would hide the three that are not like the others.
const COUNT = 'a COUNT of things present, where none is a real answer and the instrument sums the categories';
const AMOUNT = 'an AMOUNT in money or units, where zero is the ordinary reading of a blank line';
const AREA = 'a body AREA or fraction, where an unburned or untreated region is zero';
const DOSE = 'a DOSE of a drug not taken, which is zero by definition, and the reading itemises what it summed';
const LOSES = 'a reading that LOSES a clause rather than fabricating one (spec-v1196): the lines needing this '
  + 'value are absent, not wrong';
const NAMES = 'the reading NAMES what it assessed, so the system this value belongs to is visibly not in it';

const JUDGED = {
  'modified-marshall|mm-fio2': NAMES, 'modified-marshall|mm-creat': NAMES,
  'midas|mi-freq': COUNT,
  'pk-suite|pk-vd': LOSES, 'pk-suite|pk-cl': LOSES, 'pk-suite|pk-cp': LOSES, 'pk-suite|pk-tau': LOSES,
  'pbac-hmb|pb-mp': COUNT, 'pbac-hmb|pb-lc': COUNT,
  'fena-feurea|fn-una': LOSES, 'fena-feurea|fn-pna': LOSES, 'fena-feurea|fu-uu': LOSES,
  'fena-feurea|fu-pu': LOSES,
  'o2-cylinder-duration|o2-flow': 'an owner decision of 2026-11-17 (spec-v1759) keeps this reading; four '
    + 'finders carry the same row',
  'insulin-correction|ic-carbs': 'the field is labelled "omit for a correction dose", so a blank IS the '
    + 'correction-only case and zero carbohydrate is what it means',
  'vent-sbt-peep|vs-lf': LOSES,
  'lund-browder|lb-head': AREA, 'lund-browder|lb-ant-trunk': AREA,
  'era-balance|era-co': AMOUNT, 'era-balance|era-pr': AMOUNT, 'drg-payment|drg-cap': AMOUNT,
  'sequestration-adjust|seq-patient': AMOUNT, 'anesthesia-units|an-mod': COUNT,
  'medicare-cost-share|mc-ded': AMOUNT, 'cob-calc|cob-sec-would': AMOUNT, 'allowed-amount|aa-ded': AMOUNT,
  'nsa-cost-share|nsa-charge': AMOUNT,
  'peds-weight-conv|pw-lb': 'a pounds-and-ounces pair: a blank pounds beside an entered ounces is zero '
    + 'pounds, which is the conversion asked for',
  'peds-weight-conv|pw-oz': 'the ounces half of the same pair',
  'systemic-mastocytosis|sm-copies': 'EXTRA alpha-tryptase gene copies: none is the common genotype and the '
    + 'reading says which WHO criteria were met',
  'topical-quantity-ftu|ftu-arms': COUNT, 'topical-quantity-ftu|ftu-hands': COUNT,
  'levodopa-equivalent-dose|led-pramipexole-salt': DOSE,
  'loe-silness-gingival-index|gi-0': COUNT, 'loe-silness-gingival-index|gi-1': COUNT,
  'loe-silness-gingival-index|gi-2': COUNT, 'loe-silness-gingival-index|gi-3': COUNT,
  'silness-loe-plaque-index|pli-0': COUNT, 'silness-loe-plaque-index|pli-1': COUNT,
  'silness-loe-plaque-index|pli-2': COUNT, 'silness-loe-plaque-index|pli-3': COUNT,
};
const judgedSeen = new Set();

// The top-level `note` is standing prose about the instrument and cannot be a statement about this gap.
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

const rows = [];
let identical = 0;
let driven = 0;
for (const tool of allCalculators()) {
  const ex = META[tool.id]?.example?.fields;
  if (!ex) continue;
  const base = computeCalculator({ id: tool.id, inputs: { ...ex } });
  if (base?.valid !== true) continue;
  for (const f of (tool.fields || [])) {
    if (f.kind !== 'number' || Array.isArray(f.values)) continue;
    if (ex[f.dom] === undefined || String(ex[f.dom]).trim() === '') continue;
    driven += 1;
    const blank = computeCalculator({ id: tool.id, inputs: { ...ex, [f.dom]: '' } });
    const zero = computeCalculator({ id: tool.id, inputs: { ...ex, [f.dom]: '0' } });
    if (blank?.valid !== true) continue;                       // a blank is refused: nothing to confuse
    if (JSON.stringify(blank.result) !== JSON.stringify(zero?.result)) continue;
    identical += 1;
    if (JSON.stringify(blank.result) === JSON.stringify(base.result)) continue;  // nothing at stake
    if (saysGap(texts(blank.result)) || ownsAGapKey(blank.result, base.result)) continue;
    rows.push({ id: tool.id, dom: f.dom, label: String(f.label || '').slice(0, 40),
      say: String(blank.result.bandLabel || blank.result.band || '(a number, no band)').slice(0, 56) });
  }
}

const unjudged = rows.filter((r) => {
  const k = `${r.id}|${r.dom}`;
  if (!JUDGED[k]) return true;
  judgedSeen.add(k);
  if (ALL) console.log(`JUDGED\t${k}\t${JUDGED[k]}`);
  return false;
});
const stale = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
if (stale.length) {
  console.log(`STALE-LEDGER: ${stale.length} judged row(s) this run no longer reaches: ${stale.join(', ')}.`);
  console.log('A reason cannot outlive what it describes -- re-read the field and remove the row.');
}

console.log(`${unjudged.length} field(s) where a BLANK reads exactly as an entered 0, the answer moves from`);
console.log('the worked example, and nothing on screen says the value was not given.\n');
for (const r of unjudged) console.log(`  ${r.id}|${r.dom}  (${r.label})  -> ${r.say}`);
console.log(`\nReach: ${driven} filled number field(s) driven; ${identical} read a blank exactly as an entered 0.`);
