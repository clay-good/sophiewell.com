// spec-v1659 tool 3: years of potential life lost (YPLL) and the YPLL rate.
//
// Source: CDC, Principles of Epidemiology in Public Health Practice, 3rd ed., Lesson 3 §3, "Years of
// potential life lost" (archive.cdc.gov), read October 19, 2026. From a frequency table: groups break at
// the end point and older groups are dropped; midpoint = (youngest age + oldest age + 1) ÷ 2; each group's
// YPLL = deaths × (end point − midpoint); YPLL rate = YPLL ÷ population under the end point × 10^n. From
// individual ages: the sum of (end point − age at death) for deaths before the end point. Example: leukemia,
// US 2002, Table 3.10: 117,033 YPLL; 117,033 ÷ 252,755,000 × 1,000 = 0.5 per 1,000 under 65.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const loc = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

// "0, 4, 125" per line (youngest, oldest, deaths), or one age at death per line.
export function parseDeaths(text) {
  const groups = [];
  const ages = [];
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const c = line.split(/[,\t]/).map((x) => x.trim().replace(/,/g, ''));
    if (!c.every((x) => /^\d*\.?\d+$/.test(x))) return { error: `Line ${i + 1}: enter numbers only.` };
    if (c.length === 3) {
      const [lo, hi, n] = c.map(Number);
      if (hi < lo) return { error: `Line ${i + 1}: the oldest age is below the youngest.` };
      groups.push({ lo, hi, n });
    } else if (c.length === 1) ages.push(Number(c[0]));
    else return { error: `Line ${i + 1} needs one age at death, or a group: youngest age, oldest age, deaths.` };
  }
  if (groups.length && ages.length) return { error: 'Enter either age groups or single ages at death, not both.' };
  return { groups, ages };
}

export function ypll(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the end point', o.endPoint, 1, 120, 'years']]);
  if (f) return { valid: false, message: f };
  const e = Number(o.endPoint);
  const p = parseDeaths(o.deaths);
  if (p.error) return { valid: false, message: p.error };
  if (!p.groups.length && !p.ages.length) return { valid: false, message: 'Enter the deaths: age groups with counts, or one age at death per line.' };
  let total = 0;
  const notes = [];
  if (p.groups.length) {
    for (const g of p.groups) {
      if (g.lo >= e) continue;
      if (g.hi + 1 > e) return { valid: false, message: `The ${g.lo}-${g.hi} group straddles the end point of ${e}. Split it at ${e}.` };
      const mid = (g.lo + g.hi + 1) / 2;
      const y = g.n * (e - mid);
      total += y;
      notes.push(`${g.lo}-${g.hi}: ${loc(g.n)} deaths × (${e} − ${mid}) = ${loc(y)}.`);
    }
  } else {
    const before = p.ages.filter((a) => a < e);
    total = before.reduce((s, a) => s + (e - a), 0);
    notes.push(`${before.length} of ${p.ages.length} deaths were before age ${e}.`);
  }
  let band = `YPLL to age ${e}: ${loc(Math.round(total))} years.`;
  let rate = null;
  if (!blank(o.population)) {
    const g = inputFault([[`the population under ${e}`, o.population, null, 1e11, '']]);
    if (g) return { valid: false, message: g };
    const k = ['100', '1000', '10000', '100000'].includes(String(o.multiplier)) ? Number(o.multiplier) : 1000;
    rate = (total / Number(o.population)) * k;
    band += ` YPLL rate ${Math.round(rate * 100) / 100} per ${loc(k)} under age ${e}.`;
  } else {
    notes.push(`Enter the population under age ${e} for the YPLL rate.`);
  }
  return {
    valid: true, ypll: Math.round(total * 10) / 10, rate: rate === null ? null : Math.round(rate * 100) / 100, abnormal: false,
    band, bandLabel: `${loc(Math.round(total))} YPLL`, notes,
    note: 'Group midpoint = (youngest + oldest + 1) ÷ 2, as CDC\'s Principles of Epidemiology, Lesson 3 §3, computes it. Deaths at or after the end point count zero.',
  };
}
