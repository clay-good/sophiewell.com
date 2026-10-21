// spec-v1655 tool 4: outbreak attack rates, by exposure, overall, and secondary.
//
// Source: CDC, Principles of Epidemiology in Public Health Practice, 3rd ed., Lesson 3 "Measures of
// Risk", section 2 (morbidity frequency measures), read October 19, 2026:
//   attack rate (incidence proportion) = new cases ÷ population at risk at the start;
//   food-specific attack rate = persons who ate the food and became ill ÷ persons who ate it
//    (example: 30 ill of 99 who ate the potato salad, 30.3%);
//   overall attack rate (example: 18 ÷ 1,000 = 1.8%);
//   secondary attack rate = cases among contacts of primary cases ÷ total contacts
//    (example: 17 ÷ (86 - 18) = 25.0%).
// Section 5: the risk ratio is the attack rate in the exposed over the attack rate in the unexposed.
// Its 95% interval is the live two-by-two-effect computation (Deeks and Higgins, RevMan), so the two
// tools cannot disagree.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { twoByTwoEffect } from './two-by-two-effect-v1634.js';

const NOTE = 'Attack rates are proportions of the people at risk. A risk ratio points to which exposure to investigate; on its own it does not show that the exposure caused the illness.';
const pct = (n, d) => `${((n / d) * 100).toFixed(1)}%`;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

function count(label, raw, lo) {
  const f = inputFault([[label, raw, lo, 10000000, '']]);
  if (f) return { f };
  const n = Number(raw);
  if (!Number.isInteger(n)) return { f: `${label.charAt(0).toUpperCase()}${label.slice(1)} must be a whole number.` };
  return { n };
}

// "name, ill exposed, total exposed[, ill unexposed, total unexposed]" per line.
export function parseRows(text) {
  const rows = [];
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = line.split(/[,\t]/).map((c) => c.trim());
    const at = `Line ${i + 1}`;
    if (cells.length !== 3 && cells.length !== 5) return { error: `${at} needs a name and either 2 or 4 counts: ill exposed, total exposed, then optionally ill unexposed, total unexposed.` };
    const [name, ...nums] = cells;
    if (!name) return { error: `${at} has no exposure name.` };
    const vals = [];
    for (const v of nums) {
      if (!/^\d+$/.test(v)) return { error: `${at}: "${v}" is not a whole number.` };
      vals.push(Number(v));
    }
    if (vals[0] > vals[1]) return { error: `${at}: more ill than exposed.` };
    if (vals[1] === 0) return { error: `${at}: no one was exposed.` };
    if (vals.length === 4 && vals[2] > vals[3]) return { error: `${at}: more ill than unexposed.` };
    rows.push({ name, ill1: vals[0], n1: vals[1], ill2: vals.length === 4 ? vals[2] : null, n2: vals.length === 4 ? vals[3] : null });
  }
  return { rows };
}

export function outbreakAttackRates(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const parsed = parseRows(o.rows);
  if (parsed.error) return { valid: false, message: parsed.error };
  const notes = [];
  const out = { valid: true, flag: 'attack-rates', abnormal: false, exposures: [] };

  for (const r of parsed.rows) {
    const row = { name: r.name, attackRateExposed: r.ill1 / r.n1, attackRateUnexposed: null, riskRatio: null, riskRatioCi: null };
    let line = `${r.name}: ${pct(r.ill1, r.n1)} of those exposed (${r.ill1} of ${r.n1})`;
    if (r.n2 === null) line += '; no unexposed counts, so no risk ratio.';
    else if (r.n2 === 0) line += '; no one was unexposed, so no risk ratio.';
    else {
      row.attackRateUnexposed = r.ill2 / r.n2;
      line += ` and ${pct(r.ill2, r.n2)} of those not exposed (${r.ill2} of ${r.n2})`;
      const e = twoByTwoEffect({ events1: r.ill1, total1: r.n1, events2: r.ill2, total2: r.n2 });
      if (e.valid && e.riskRatio !== undefined) {
        row.riskRatio = e.riskRatio; row.riskRatioCi = e.riskRatioCi;
        line += `; risk ratio ${e.riskRatio.toFixed(2)} (95% CI ${e.riskRatioCi[0].toFixed(2)} to ${e.riskRatioCi[1].toFixed(2)}).`;
      } else line += '; no ill person in one of the groups, so no risk ratio.';
    }
    row.line = line;
    out.exposures.push(row);
  }
  out.exposures.sort((a, b) => (b.riskRatio ?? -1) - (a.riskRatio ?? -1) || b.attackRateExposed - a.attackRateExposed);

  let overall = null;
  if (!blank(o.totalIll) || !blank(o.totalPersons)) {
    const a = count('the total ill', o.totalIll, 0); if (a.f) return { valid: false, message: a.f };
    const b = count('the total persons at risk', o.totalPersons, null); if (b.f) return { valid: false, message: b.f };
    if (a.n > b.n) return { valid: false, message: 'The total ill cannot be more than the persons at risk.' };
    overall = a.n / b.n;
    out.overallAttackRate = overall;
    notes.push(`Overall attack rate: ${pct(a.n, b.n)} (${a.n.toLocaleString('en-US')} ÷ ${b.n.toLocaleString('en-US')}).`);
  }

  let secondary = null;
  if (!blank(o.householdMembers) || !blank(o.primaryCases) || !blank(o.secondaryCases)) {
    const m = count('the household members', o.householdMembers, null); if (m.f) return { valid: false, message: m.f };
    const p = count('the primary cases', o.primaryCases, 0); if (p.f) return { valid: false, message: p.f };
    const s = count('the secondary cases', o.secondaryCases, 0); if (s.f) return { valid: false, message: s.f };
    const contacts = m.n - p.n;
    if (contacts <= 0) return { valid: false, message: 'The household members must be more than the primary cases: the contacts at risk are the members minus the primary cases.' };
    if (s.n > contacts) return { valid: false, message: `The secondary cases (${s.n}) cannot be more than the contacts at risk (${contacts}).` };
    secondary = s.n / contacts;
    out.secondaryAttackRate = secondary;
    notes.push(`Secondary attack rate: ${pct(s.n, contacts)} (${s.n} ÷ (${m.n} - ${p.n}) = ${s.n} ÷ ${contacts} contacts).`);
  }

  if (!out.exposures.length && overall === null && secondary === null) {
    return { valid: false, message: 'Enter an exposure line (name, ill exposed, total exposed), the total ill and persons at risk, or the household counts.' };
  }
  const exposureLines = out.exposures.map((e) => e.line);
  const first = out.exposures[0];
  out.band = first ? first.line : notes[0];
  out.bandLabel = first ? pct(first.attackRateExposed, 1) : (overall !== null ? pct(overall, 1) : pct(secondary, 1));
  out.notes = [...exposureLines.slice(1), ...(first ? notes : notes.slice(1))];
  if (out.exposures.length > 1) out.notes.unshift('Exposures are listed by risk ratio, highest first.');
  out.note = NOTE;
  return out;
}
