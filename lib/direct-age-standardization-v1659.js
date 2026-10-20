// spec-v1659 tool 8: directly age-standardized rate.
//
// Sources, read October 19, 2026:
//   CDC, Principles of Epidemiology in Public Health Practice, 3rd ed., Lesson 3 §3, "Age-adjusted
//     mortality rates": the techniques "take a weighted average of the age-specific mortality rates", and
//     Table 3.6 (Alaska and Florida, 2002, age-adjusted 794.1 and 787.8 per 100,000).
//   NCI SEER, "Standard Populations - 19 Age Groups" (seer.cancer.gov/stdpopulations/stdpop.19ages.html,
//     page sha256 4b834ce6...0d1733): the 2000 U.S. standard population (Census P25-1130), 274,633,642 in
//     19 groups, transcribed below by script from the page, never typed.
// Rate = Σ (stratum rate × the standard population's share in that stratum). With the 2000 standard,
// Table 3.6 gives Florida 787.7 (CDC prints 787.8) and Alaska 794.5 (CDC prints 794.1); CDC's figures come
// from WISQARS, whose handling of unknown ages and rounding was not read.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// [lower age, population] for 0, 1-4, 5-9, ..., 80-84, 85+.
export const US2000 = [[0, 3794901], [1, 15191619], [5, 19919840], [10, 20056779], [15, 19819518], [20, 18257225], [25, 17722067], [30, 19511370], [35, 22179956], [40, 22479229], [45, 19805793], [50, 17224359], [55, 13307234], [60, 10654272], [65, 9409940], [70, 8725574], [75, 7414559], [80, 4900234], [85, 4259173]];
const EDGES = US2000.map(([a]) => a);
const loc = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 });

export const STANDARDS = [
  { value: 'us2000', text: '2000 U.S. standard population (19 age groups)' },
  { value: 'own', text: 'My own standard population, per stratum' },
];

// us2000: "25, 34, 120, 84112" (youngest, oldest or + for 85+, events, population). own: "label, events,
// population, standard population".
export function directAgeStandardization(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const std = STANDARDS.find((s) => s.value === o.standard);
  if (!std) return { valid: false, message: 'Choose the standard population.' };
  const k = ['1000', '10000', '100000'].includes(String(o.multiplier)) ? Number(o.multiplier) : 100000;
  const rows = [];
  const lines = String(o.strata ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const c = line.split(/[,\t]/).map((x) => x.trim());
    const at = `Line ${i + 1}`;
    if (std.value === 'us2000') {
      if (c.length !== 4) return { valid: false, message: `${at} needs youngest age, oldest age (or + for 85 and over), events and population, such as 25, 34, 120, 84112.` };
      const lo = Number(c[0]);
      const hi = c[1] === '+' ? Infinity : Number(c[1]);
      if (!EDGES.includes(lo) || !(hi === Infinity || EDGES.includes(hi + 1))) return { valid: false, message: `${at}: ${c[0]} to ${c[1]} does not line up with the standard's groups (0, 1-4, 5-9 … 80-84, 85+). Use group edges at 0, 1, 5, 10 … 85.` };
      const w = US2000.filter(([a]) => a >= lo && a <= hi).reduce((s, [, p]) => s + p, 0);
      rows.push({ label: `${lo}${hi === Infinity ? '+' : `-${hi}`}`, lo, hi, ev: Number(c[2]), pop: Number(c[3]), w, line: at });
    } else {
      if (c.length !== 4) return { valid: false, message: `${at} needs a label, events, population and standard population.` };
      rows.push({ label: c[0], ev: Number(c[1]), pop: Number(c[2]), w: Number(c[3]), line: at });
    }
  }
  if (rows.length < 2) return { valid: false, message: 'Enter at least two age strata.' };
  for (const x of rows) {
    const f = inputFault([[`${x.line}'s events`, x.ev, 0, 1e10, ''], [`${x.line}'s population`, x.pop, null, 1e11, ''], [`${x.line}'s standard population`, x.w, null, 1e11, '']]);
    if (f) return { valid: false, message: f };
    if (x.ev > x.pop) return { valid: false, message: `${x.line} has more events than population. Check the counts.` };
  }
  if (std.value === 'us2000') {
    const sorted = [...rows].sort((a, b) => a.lo - b.lo);
    for (let i = 1; i < sorted.length; i += 1) {
      if (sorted[i].lo <= sorted[i - 1].hi) return { valid: false, message: `The ${sorted[i - 1].label} and ${sorted[i].label} groups overlap.` };
    }
  }
  const wTotal = rows.reduce((s, x) => s + x.w, 0);
  const adj = rows.reduce((s, x) => s + (x.ev / x.pop) * (x.w / wTotal), 0) * k;
  const crude = (rows.reduce((s, x) => s + x.ev, 0) / rows.reduce((s, x) => s + x.pop, 0)) * k;
  const multNote = ['1000', '10000', '100000'].includes(String(o.multiplier)) ? [] : ['Choose a multiplier to change it; until then the rate is per 100,000.'];
  const notes = rows.map((x) => `${x.label}: rate ${loc((x.ev / x.pop) * k)}, weight ${(x.w / wTotal).toFixed(6)}, contributes ${loc((x.ev / x.pop) * (x.w / wTotal) * k)}.`);
  if (std.value === 'us2000') {
    const covered = rows.reduce((s, x) => s + x.w, 0);
    if (covered < 274633642) notes.push('The strata entered do not cover every age, so the weights are the standard\'s shares among the ages entered.');
  }
  notes.push(...multNote);
  return {
    valid: true, adjusted: Math.round(adj * 10) / 10, crude: Math.round(crude * 10) / 10, abnormal: false,
    band: `Age-standardized rate ${loc(adj)} per ${loc(k)} (crude ${loc(crude)}), weighted to the ${std.value === 'us2000' ? '2000 U.S. standard population' : 'standard population entered'}.`,
    bandLabel: `${loc(adj)} per ${loc(k)}`,
    notes,
    note: 'Compare standardized rates only when they use the same standard population and the same age groups.',
  };
}
