// spec-v1638 tool 18: the Medicaid federal upper limit for a multiple source drug, from CMS's published
// limits file by NDC, or by hand from the weighted average AMP and the survey cost.
//
// Source: 42 CFR 447.512, 447.514 and 447.502, read on eCFR as current October 8, 2026 (re-read
// October 12, 2026).
//   447.512(b)  for drugs with no specific limit, and certified brand-name drugs, payments "must
//     not exceed, in the aggregate, payment levels that the agency has determined by applying the
//     lower of the following: (1) AAC plus a professional dispensing fee established by the
//     agency; or (2) Providers' usual and customary charges to the general public."
//   447.512(a), 447.514(b)(1)  for a listed multiple source drug, "a professional dispensing fee
//     established by the state agency plus an amount established by CMS that is equal to 175
//     percent of the weighted average of the most recently reported monthly AMPs".
//   447.514(b)(2)  where that amount "is lower than the average retail community pharmacies'
//     acquisition cost for such drug product, as determined by the most current national survey",
//     CMS uses the survey acquisition cost instead.
//   447.514(a)(1)  the list covers multiple source drugs with at least three pharmaceutically and
//     therapeutically equivalent products.
//   447.512(c)  the limit "does not apply if a physician certifies ... that a specific brand is
//     medically necessary".
// The federal text sets AGGREGATE ceilings on a state's payments. Each state's plan turns them
// into a per-claim "lowest of" formula, and the state plan governs.
//
// File mode: an NDC is looked up in CMS's "ACA Federal Upper Limits" file (data/aca-ful, the newest
// month; lib/aca-ful-lookup.js). The caller passes `lookup`. The file's limit is shown as published; a
// limit the file flags as above 175% of the weighted average AMP is, under 447.514(b)(2), one the survey
// acquisition cost set. A file past its review date, or one that did not load, asks for the figures.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { normalizeNdc } from './nadac-margin.js';
import { EXPIRED_TEXT } from './data.js';
import { fulUnitWords } from './aca-ful-lookup.js';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const cents = (n) => Math.round(n * 100 + 1e-9) / 100;
// Six decimals, as CMS publishes the limits (0.384485 x 1.75 = 0.672849).
const r6 = (n) => Math.round(n * 1e6) / 1e6;

const dashed = (n) => `${n.slice(0, 5)}-${n.slice(5, 9)}-${n.slice(9)}`;
const AGGREGATE = 'This is an aggregate limit on a state\'s spending for listed multiple source drugs, not a per-claim payment rule. It applies only where FDA rates at least three products as equivalent, and not to a brand a prescriber certifies as medically necessary (447.514(a)(1), 447.512(c)).';

// The quantity and fee line, shared by both modes; null when neither was entered.
function forQuantity(o, ful, unit) {
  if (blank(o.quantity) && blank(o.dispensingFee)) return null;
  const g = inputFault([['the quantity', o.quantity, null, 1e7, 'units'], ['the state\'s professional dispensing fee', o.dispensingFee, 0, 10000, 'dollars']]);
  if (g) return { message: g };
  const total = cents(ful * Number(o.quantity) + Number(o.dispensingFee));
  return { total, note: `For ${Number(o.quantity)} ${unit || 'units'} plus a ${money(Number(o.dispensingFee))} professional dispensing fee: ${money(total)}.` };
}

// The federal upper limit for an NDC from CMS's file. `lk` is a fulLookup result found for this NDC.
function fromFile(o, ndc, lk) {
  const g = lk.group;
  const [unit, units] = fulUnitWords(g.unit);
  const notes = [`NDC ${dashed(ndc)} is ${g.ingredient} ${g.strength} ${g.dosage}, ${g.route}, product group ${lk.rec.group}, on CMS's federal upper limits file for ${lk.edition}.`];
  const at175 = r6(g.weightedAmp * 1.75);
  if (g.over175) notes.push(`The file marks this limit as above 175% of the weighted average AMP of ${g.weightedAmp} a ${unit} (175% would be ${at175}). Under 447.514(b)(2) that is where the national survey acquisition cost is higher, and the limit is set at it.`);
  else notes.push(`175% of the weighted average AMP: 1.75 x ${g.weightedAmp} = ${at175} a ${unit} (42 CFR 447.514(b)(1)).`);
  if (!lk.rec.aRated) notes.push('The file lists this NDC as not A-rated.');
  if (!blank(o.weightedAmp) || !blank(o.surveyCost)) notes.push('The weighted average AMP or survey cost entered was not used; the file\'s figures were.');
  const out = { valid: true, fulPerUnit: g.ful, setBySurveyCost: g.over175, fromFile: true, productGroup: lk.rec.group, edition: lk.edition };
  const q = forQuantity(o, g.ful, units);
  if (q && q.message) return { valid: false, message: q.message };
  if (q) { out.limitForQuantity = q.total; notes.push(q.note); }
  return { ...out, flag: g.over175 ? 'set-by-survey-cost' : 'set-by-175-percent', abnormal: false, band: `Federal upper limit ${g.ful} a ${unit} (CMS file, ${lk.edition}).`, bandLabel: g.over175 ? 'Above 175% of the weighted average AMP' : '175% of the weighted average AMP', notes, note: AGGREGATE };
}

// The federal upper limit per unit: from CMS's file when an NDC is entered, otherwise by hand as 175% of
// the weighted average AMP, floored at the survey cost.
export function medicaidFulCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let fileNote = null;
  if (!blank(o.ndc)) {
    const n = normalizeNdc(typeof o.ndc === 'string' ? o.ndc : '');
    if (n.error) return { valid: false, message: n.error === 'blank' ? 'Enter the NDC.' : n.error };
    const lk = o.lookup && typeof o.lookup === 'object' ? o.lookup : { status: 'unavailable' };
    if (lk.status === 'found' && lk.group && lk.rec) return fromFile(o, n.ndc, lk);
    const why = lk.status === 'expired' ? `${EXPIRED_TEXT} The federal upper limits file was not used.`
      : lk.status === 'not-listed' ? `CMS's federal upper limits file for ${lk.edition} lists no limit for NDC ${dashed(n.ndc)}; the limits cover only listed multiple source drugs.`
      : 'The federal upper limits file could not be loaded.';
    if (blank(o.weightedAmp)) return { valid: false, message: `${why} Enter the weighted average of the monthly AMPs to compute a limit by hand.` };
    fileNote = `${why} The limit below is computed by hand from the figures entered.`;
  }
  const f = inputFault([['the weighted average of the monthly AMPs per unit', o.weightedAmp, 0, 1e6, 'dollars']]);
  if (f) return { valid: false, message: f };
  const amp = Number(o.weightedAmp);
  const byAmp = r6(amp * 1.75);
  let ful = byAmp; let floored = false; const notes = [`175% of the weighted average AMP: 1.75 x ${amp} = ${byAmp} a unit (42 CFR 447.514(b)(1)).`];
  if (!blank(o.surveyCost)) {
    const g = inputFault([['the national survey acquisition cost (NADAC) per unit', o.surveyCost, 0, 1e6, 'dollars']]);
    if (g) return { valid: false, message: g };
    const nadac = Number(o.surveyCost);
    if (byAmp < nadac) { ful = r6(nadac); floored = true; notes.push(`That is lower than the survey acquisition cost of ${nadac} a unit, so the limit is set at the survey cost instead (447.514(b)(2)).`); }
    else notes.push(`That is not lower than the survey acquisition cost of ${nadac} a unit, so the 175% figure stands.`);
  } else notes.push('No survey acquisition cost was entered, so the exception in 447.514(b)(2), which raises a limit that falls below it, was not tested.');
  const out = { valid: true, fulPerUnit: ful, setBySurveyCost: floored };
  if (fileNote) notes.unshift(fileNote);
  const q = forQuantity(o, ful, 'units');
  if (q && q.message) return { valid: false, message: q.message };
  if (q) { out.limitForQuantity = q.total; notes.push(q.note); }
  return { ...out, flag: floored ? 'set-by-survey-cost' : 'set-by-175-percent', abnormal: false, band: `Federal upper limit ${ful} a unit.`, bandLabel: floored ? 'Set at the survey acquisition cost' : '175% of the weighted average AMP', notes, note: `${AGGREGATE} CMS publishes the limits; this is the same arithmetic on figures the reader enters.` };
}
