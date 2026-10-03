// spec-v1512 tool 1: dose rounding to whole vials.
//
// HOPA position statement (Fahrenbruch et al., J Oncol Pract 2018;14(3):e130-e136, PMID 29400987): rounding
// biologic and cytotoxic anticancer agents within 10% of the ordered dose is acceptable for routine care,
// and each institution sets its own policy, so the threshold is editable (default 10%).
// Every combination of up to three vial sizes is tried. Among totals within the threshold, the one closest
// to the ordered dose wins, then the cheaper (when costs are entered), then the fewer vials; giving whole
// vials leaves nothing to discard. The tool also shows the dose given exactly as ordered: the fewest-mg
// combination at or above it and the amount discarded (billed with the JW modifier; JZ when none is).
// The tool never changes an order; it shows what the policy entered permits.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const BASES = [
  { value: 'mg', text: 'mg (flat dose)' },
  { value: 'mgkg', text: 'mg/kg' },
  { value: 'mgm2', text: 'mg/m²' },
];
const fmt = (x) => String(Math.round(x * 100) / 100);
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// The two combinations the tool reports, found without listing every one.
//
// This used to build the full product of vial counts up to `cap` -- (dose /
// size) per vial size, multiplied -- and then sort it: 10,000 mg from 1, 5
// and 10 mg vials was about 2.6e10 combinations, and the tab (and the MCP
// server) froze. Two changes make it bounded:
//   - For any counts of the larger sizes, only the floor and the ceiling of
//     what is left, in the SMALLEST size, can give the total closest to the
//     dose or the smallest total at or above it (plus none, when the larger
//     vials already cover it). So the smallest size is solved for and only
//     the others are walked.
//   - Nothing is stored: the walk keeps the best combination within the
//     threshold and the best one at or above the dose as it goes.
// A walk still longer than MAX_STEPS is refused with a sentence.
export const MAX_STEPS = 5_000_000;

const smallestIndex = (vials) => vials.reduce((best, v, k) => (v.mg < vials[best].mg ? k : best), 0);

function searchSteps(vials, cap) {
  const s = smallestIndex(vials);
  return vials.reduce((prod, v, k) => (k === s ? prod : prod * (Math.ceil(cap / v.mg) + 1)), 1);
}

// search(vials, cap, dose, th) -> { best, exact }, each { counts, total, n, cost } or null.
function search(vials, cap, dose, th) {
  const s = smallestIndex(vials);
  const others = vials.map((_, k) => k).filter((k) => k !== s);
  const costed = vials.every((v) => v.cost !== null);
  const counts = new Array(vials.length).fill(0);
  // The last tie-break is the order the old full enumeration listed
  // combinations in (vial 1's count, then vial 2's, then vial 3's), so every
  // answer is the one it gave.
  const lexical = (a, b) => { for (let k = 0; k < a.counts.length; k += 1) if (a.counts[k] !== b.counts[k]) return a.counts[k] - b.counts[k]; return 0; };
  const tieBreak = (a, b) => (a.cost !== null && b.cost !== null ? a.cost - b.cost : 0) || a.n - b.n || lexical(a, b);
  const closer = (a, b) => Math.abs(a.total - dose) - Math.abs(b.total - dose) || tieBreak(a, b);
  const smaller = (a, b) => a.total - b.total || tieBreak(a, b);
  let best = null;
  let exact = null;
  // No object is made per combination: the counts are compared in place and copied only when they win
  // (the 10,000 mg case from 1, 5 and 10 mg vials went from about 0.7 s to about 0.15 s, with identical answers).
  const tol = (dose * th) / 100 + 1e-9;
  const consider = () => {
    let total = 0; let n = 0; let cost = costed ? 0 : null;
    for (let k = 0; k < vials.length; k += 1) {
      total += counts[k] * vials[k].mg; n += counts[k];
      if (costed) cost += counts[k] * vials[k].cost;
    }
    if (total <= 0) return;
    const near = Math.abs(total - dose) <= tol && (!best || Math.abs(total - dose) <= Math.abs(best.total - dose));
    const above = total >= dose - 1e-9 && (!exact || total <= exact.total);
    if (!near && !above) return;
    const c = { total, n, cost, counts };
    if (near && (!best || closer(c, best) < 0)) best = { total, n, cost, counts: [...counts] };
    if (above && (!exact || smaller(c, exact) < 0)) exact = { total, n, cost, counts: [...counts] };
  };
  const walk = (j, partial) => {
    if (j === others.length) {
      const rest = (dose - partial) / vials[s].mg;
      const lo = Math.max(0, Math.floor(rest));
      const hi = Math.max(0, Math.ceil(rest));
      counts[s] = 0; consider();
      if (lo !== 0) { counts[s] = lo; consider(); }
      if (hi !== 0 && hi !== lo) { counts[s] = hi; consider(); }
      counts[s] = 0;
      return;
    }
    const k = others[j];
    const max = Math.ceil(cap / vials[k].mg);
    // Past the cap no combination can win: the best is within the threshold, and the smallest total at or
    // above the dose is less than the dose plus the smallest vial, both inside the cap.
    for (let c = 0; c <= max && partial + c * vials[k].mg <= cap + 1e-9; c += 1) { counts[k] = c; walk(j + 1, partial + c * vials[k].mg); }
    counts[k] = 0;
  };
  walk(0, 0);
  return { best, exact };
}
const describe = (c, vials) => c.counts.map((n, k) => (n ? `${n} × ${fmt(vials[k].mg)} mg` : null)).filter(Boolean).join(' + ');

export function vialRounding(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const basis = BASES.some((b) => b.value === o.basis) ? o.basis : null;
  if (!basis) return { valid: false, message: 'Choose how the dose is ordered: mg, mg/kg or mg/m².' };
  const f = inputFault([['the ordered dose', o.dose, 0.001, 1e6, basis === 'mg' ? 'mg' : basis === 'mgkg' ? 'mg/kg' : 'mg/m²']]);
  if (f) return { valid: false, message: f };
  let dose = Number(o.dose);
  const notes = [];
  if (basis === 'mgkg') {
    const wf = inputFault([['the weight', o.weight, 0.3, 350, 'kg']]);
    if (wf) return { valid: false, message: wf };
    dose *= Number(o.weight);
    notes.push(`Ordered dose: ${fmt(Number(o.dose))} mg/kg × ${fmt(Number(o.weight))} kg = ${fmt(dose)} mg.`);
  } else if (basis === 'mgm2') {
    const bf = inputFault([['the body surface area', o.bsa, 0.1, 4, 'm²']]);
    if (bf) return { valid: false, message: bf };
    dose *= Number(o.bsa);
    notes.push(`Ordered dose: ${fmt(Number(o.dose))} mg/m² × ${fmt(Number(o.bsa))} m² = ${fmt(dose)} mg.`);
  }
  const vials = [];
  for (const k of [1, 2, 3]) {
    const size = String(o[`vial${k}`] ?? '').trim();
    const cost = String(o[`cost${k}`] ?? '').trim();
    if (!size) { if (cost) return { valid: false, message: `Enter vial ${k}'s size for the cost entered.` }; continue; }
    const vf = inputFault([[`vial ${k}'s size`, size, 0.001, 1e6, 'mg']]);
    if (vf) return { valid: false, message: vf };
    let c = null;
    if (cost) { const cf = inputFault([[`vial ${k}'s cost`, cost, 0, 1e7, 'dollars']]); if (cf) return { valid: false, message: cf }; c = Number(cost); }
    vials.push({ mg: Number(size), cost: c });
  }
  if (!vials.length) return { valid: false, message: 'Enter at least one vial size in mg.' };
  let th = 10;
  if (String(o.threshold ?? '').trim()) {
    const tf = inputFault([['the rounding threshold', o.threshold, 0, 25, 'percent']]);
    if (tf) return { valid: false, message: tf };
    th = Number(o.threshold);
  } else notes.push('No threshold was entered, so 10% (the HOPA position statement) is used.');
  if (vials.some((v) => v.cost === null) && vials.some((v) => v.cost !== null)) notes.push('Costs were entered for some vial sizes only, so cost is not used to break ties.');
  const smallest = Math.min(...vials.map((v) => v.mg));
  const cap = dose * (1 + th / 100) + smallest;
  if (searchSteps(vials, cap) > MAX_STEPS) {
    return { valid: false, message: `These vial sizes are too small for a ${fmt(dose)} mg dose: comparing every whole-vial combination would take more than ${MAX_STEPS.toLocaleString('en-US')} steps. Check the dose and the vial sizes.` };
  }
  const { best, exact } = search(vials, cap, dose, th);
  const waste = exact.total - dose;
  const exactText = `As ordered, ${fmt(dose)} mg uses ${describe(exact, vials)}${waste > 1e-9 ? `, discarding ${fmt(waste)} mg (bill the discarded amount with the JW modifier)` : ' with nothing discarded (JZ modifier)'}${exact.cost !== null ? `, ${money(exact.cost)}` : ''}.`;
  if (!best) {
    notes.push('The JW and JZ modifiers apply to drugs from single-dose containers.');
    return { valid: true, rounded: null, band: `No whole-vial dose falls within ${th}% of ${fmt(dose)} mg, so rounding is not within this policy. ${exactText}`, bandLabel: 'Not within policy', notes, note: 'The tool never changes an order; the prescriber and the institution\'s policy decide.' };
  }
  notes.push('The JW and JZ modifiers apply to drugs from single-dose containers.');
  const change = Math.round(((best.total - dose) / dose) * 1000) / 10;
  return {
    valid: true,
    rounded: best.total,
    band: `Rounded dose ${fmt(best.total)} mg (${change > 0 ? '+' : ''}${change}% from ${fmt(dose)} mg): ${describe(best, vials)}, nothing discarded${best.cost !== null ? `, ${money(best.cost)}` : ''}. ${exactText}`,
    bandLabel: `${fmt(best.total)} mg (${change > 0 ? '+' : ''}${change}%)`,
    notes,
    note: 'The tool never changes an order; the prescriber and the institution\'s policy decide.',
  };
}
