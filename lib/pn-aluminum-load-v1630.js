// spec-v1630 tool 8: aluminum in a parenteral nutrition order (21 CFR 201.323).
//
// 21 CFR 201.323, re-read in the eCFR as of October 7, 2026:
//   (a) "The aluminum content of large volume parenteral (LVP) drug products used in total parenteral
//       nutrition (TPN) therapy must not exceed 25 micrograms per liter".
//   (c) "the maximum level of aluminum present at expiry must be stated on the immediate container
//       label of all small volume parenteral (SVP) drug products and pharmacy bulk packages (PBPs)",
//       as "Contains no more than __ ug/L of aluminum."
//   (d) at 25 ug/L or less the label may say "Contains no more than 25 ug/L of aluminum."
//   (e) the required warning: "patients with impaired kidney function, including premature neonates,
//       who receive parenteral levels of aluminum at greater than 4 to 5 ug/kg/day accumulate aluminum
//       at levels associated with central nervous system and bone toxicity. Tissue loading may occur
//       at even lower rates of administration."
//
//   aluminum from a component = its volume in the daily bag (L) x its label figure (mcg/L)
//   total = the sum; per kilogram = total / weight
//
// Every label figure is the maximum at expiry, so the total is an upper bound and the result says "no
// more than". No label figure ships and none is defaulted: each line carries the number printed on
// the container in hand (a large-volume parenteral's is 25 or less under paragraph (a)). The result is
// placed against the 4 and 5 of the warning as cited text; it is not a rule for the reader's patient.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const WEIGHT_UNITS = [
  { value: 'kg', text: 'kg' },
  { value: 'lb', text: 'lb' },
  { value: 'g', text: 'g' },
];
const TO_KG = { kg: 1, lb: 0.45359237, g: 0.001 };
const WARNING = 'The labeling warning in 21 CFR 201.323(e): patients with impaired kidney function, including premature neonates, who receive parenteral aluminum at greater than 4 to 5 mcg/kg/day accumulate it at levels associated with central nervous system and bone toxicity, and tissue loading may occur at even lower rates.';
const NOTE = 'An upper bound: each label states the most aluminum the product may hold at expiry, so the true amount is no more than this. The tool adds up the labels; it does not say what to order or whether an order is safe.';

const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function pnAluminumLoad(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wu = String(o.weightUnit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(TO_KG, wu)) return { valid: false, message: 'Choose the weight unit: kg, lb or g.' };
  const wf = inputFault([['the weight', o.weight, null, wu === 'g' ? 500000 : wu === 'lb' ? 1100 : 500, wu]]);
  if (wf) return { valid: false, message: wf };
  const kg = Number(o.weight) * TO_KG[wu];
  if (kg < 0.2) return { valid: false, message: `A weight of ${show(Number(o.weight))} ${wu} is below the 0.2 kg this tool accepts. Check the weight and its unit.` };

  const lines = String(o.components ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { valid: false, message: 'Enter each component of the daily bag on its own line: its name, its volume in mL, and the aluminum figure on its container label in mcg/L.' };
  if (lines.length > 100) return { valid: false, message: `${lines.length} lines is more than the 100 this tool adds up.` };
  const rows = [];
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 3 || !p[0]) return { valid: false, message: `Component line ${i + 1}: enter the name, a comma, the volume in mL, a comma, then the label's aluminum figure in mcg/L.` };
    const f = inputFault([[`the volume on component line ${i + 1}`, p[1], null, 1e5, 'mL'], [`the aluminum figure on component line ${i + 1}`, p[2], 0, 1e6, 'mcg/L']]);
    if (f) return { valid: false, message: f };
    const name = p[0].slice(0, 60);
    rows.push({ name, mL: Number(p[1]), mcgL: Number(p[2]), mcg: (Number(p[1]) / 1000) * Number(p[2]) });
  }
  const total = rows.reduce((s, r) => s + r.mcg, 0);
  const perKg = total / kg;
  const where = sig(perKg) > 5 ? 'over 5' : sig(perKg) > 4 ? 'between 4 and 5' : 'at or under 4';
  const ranked = [...rows].sort((a, b) => b.mcg - a.mcg);
  const notes = [
    `Total: no more than ${show(total)} mcg/day; ÷ ${show(kg)} kg = no more than ${show(perKg)} mcg/kg/day.`,
    ...ranked.map((r) => `${r.name}: ${show(r.mL)} mL × ${show(r.mcgL)} mcg/L = ${show(r.mcg)} mcg${total > 0 ? ` (${show((r.mcg / total) * 100)}% of the total)` : ''}.`),
    WARNING,
  ];
  if (wu !== 'kg') notes.splice(1, 0, `Weight: ${show(Number(o.weight))} ${wu} = ${show(kg)} kg.`);
  return {
    valid: true, totalMcg: sig(total), mcgPerKgDay: sig(perKg), weightKg: sig(kg), band4to5: where,
    components: ranked.map((r) => ({ name: r.name, mcg: sig(r.mcg), share: total > 0 ? sig((r.mcg / total) * 100) : 0 })),
    abnormal: sig(perKg) > 4,
    band: `No more than ${show(perKg)} mcg/kg/day of aluminum (${show(total)} mcg/day): ${where} mcg/kg/day, against the 4 to 5 the labeling warning names.`,
    bandLabel: `≤ ${show(perKg)} mcg/kg/day`,
    notes, note: NOTE,
  };
}
