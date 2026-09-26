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

function combos(vials, cap) {
  const out = [];
  const walk = (i, counts) => {
    if (i === vials.length) {
      const total = counts.reduce((s, n, k) => s + n * vials[k].mg, 0);
      if (total > 0) out.push({ counts: [...counts], total, n: counts.reduce((a, b) => a + b, 0), cost: vials.every((v) => v.cost !== null) ? counts.reduce((s, n, k) => s + n * vials[k].cost, 0) : null });
      return;
    }
    const max = Math.ceil(cap / vials[i].mg);
    for (let c = 0; c <= max; c += 1) { counts.push(c); walk(i + 1, counts); counts.pop(); }
  };
  walk(0, []);
  return out;
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
  const all = combos(vials, dose * (1 + th / 100) + smallest);
  const within = all.filter((c) => Math.abs(c.total - dose) <= (dose * th) / 100 + 1e-9);
  const cmp = (a, b) => Math.abs(a.total - dose) - Math.abs(b.total - dose) || (a.cost !== null && b.cost !== null ? a.cost - b.cost : 0) || a.n - b.n;
  within.sort(cmp);
  const exact = all.filter((c) => c.total >= dose - 1e-9).sort((a, b) => a.total - b.total || (a.cost !== null && b.cost !== null ? a.cost - b.cost : 0) || a.n - b.n)[0];
  const waste = exact.total - dose;
  const exactText = `As ordered, ${fmt(dose)} mg uses ${describe(exact, vials)}${waste > 1e-9 ? `, discarding ${fmt(waste)} mg (bill the discarded amount with the JW modifier)` : ' with nothing discarded (JZ modifier)'}${exact.cost !== null ? `, ${money(exact.cost)}` : ''}.`;
  if (!within.length) {
    notes.push('The JW and JZ modifiers apply to drugs from single-dose containers.');
    return { valid: true, rounded: null, band: `No whole-vial dose falls within ${th}% of ${fmt(dose)} mg, so rounding is not within this policy. ${exactText}`, bandLabel: 'Not within policy', notes, note: 'The tool never changes an order; the prescriber and the institution\'s policy decide.' };
  }
  notes.push('The JW and JZ modifiers apply to drugs from single-dose containers.');
  const best = within[0];
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
