// spec-v1634 tool 14: pediatric unfractionated heparin protocol (CHEST 2012).
//
// Source: Monagle P, Chan AKC, Goldenberg NA, et al. Antithrombotic therapy in neonates and
// children: Antithrombotic Therapy and Prevention of Thrombosis, 9th ed: American College of Chest
// Physicians Evidence-Based Clinical Practice Guidelines. Chest 2012;141(2 Suppl):e737S-e801S
// (PMC3278066), Table 3, "Protocol for Systemic Heparin Administration and Adjustment for Pediatric
// Patients", re-read on October 11, 2026:
//   I.   Loading dose: 75 units/kg IV over 10 min.
//   II.  Initial maintenance: 28 units/kg per h for infants under 1 year; 20 units/kg per h for
//        children over 1 year.
//   III. Adjust to an aPTT of 60-85 s "(assuming this reflects an anti-Xa level of 0.35-0.70)":
//          aPTT, s   bolus, units/kg   hold, min   rate change   repeat aPTT
//          <50            50              0          +10%          4 h
//          50-59           0              0          +10%          4 h
//          60-85           0              0            0           next day
//          86-95           0              0          -10%          4 h
//          96-120          0             30          -10%          4 h
//          >120            0             60          -15%          4 h
//   IV.  aPTT 4 h after the loading dose and 4 h after every change in the infusion rate.
//   V.   When aPTT values are therapeutic, a daily CBC and aPTT.
// The guideline prints the table as adapted with permission; the doses are facts and the layout is
// not copied. The rows are in whole seconds: a value between two rows is reported as between them.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const AGES = [
  { value: 'under-1', text: 'Infant under 1 year', rate: 28 },
  { value: 'over-1', text: 'Child over 1 year', rate: 20 },
];
// [lowest aPTT of the row, highest, bolus units/kg, hold min, rate change %, repeat]
const ROWS = [
  [0, 49, 50, 0, 10, 'in 4 hours'],
  [50, 59, 0, 0, 10, 'in 4 hours'],
  [60, 85, 0, 0, 0, 'the next day'],
  [86, 95, 0, 0, -10, 'in 4 hours'],
  [96, 120, 0, 30, -10, 'in 4 hours'],
  [121, Infinity, 0, 60, -15, 'in 4 hours'],
];
const NOTE = 'This reports the guideline\'s protocol; it is not an order. The aPTT range of 60 to 85 seconds assumes it reflects an anti-Xa level of 0.35 to 0.70 units/mL, which depends on the laboratory\'s reagent, so a local protocol with its own range takes precedence. The guideline gives no anti-Xa adjustment table, and none is offered here.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');
const n0 = (x) => Math.round(x).toLocaleString('en-US');
const rowName = (r) => (r[0] === 0 ? 'under 50' : r[1] === Infinity ? 'over 120' : `${r[0]} to ${r[1]}`);

export function pedsHeparinNomogram(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 0.4, 150, 'kg']]);
  if (f) return { valid: false, message: f };
  const w = Number(o.weight);
  const cite = 'Monagle P, et al. Chest 2012;141(2 Suppl):e737S-e801S, Table 3.';
  if (blank(o.aptt)) {
    const age = AGES.find((a) => a.value === String(o.age ?? '').trim());
    if (!age) return { valid: false, message: 'Choose the age group: an infant under 1 year or a child over 1 year. The starting rate differs.' };
    const load = 75 * w; const rate = age.rate * w;
    return {
      valid: true, flag: 'start', abnormal: false, phase: 'start', loadingDoseUnits: Math.round(load), initialRateUnitsPerHour: Number(rate.toFixed(1)),
      band: `Loading dose ${n0(load)} units IV over 10 minutes (75 units/kg), then ${n1(rate)} units/h (${age.rate} units/kg per hour, ${age.text.toLowerCase()}).`,
      bandLabel: `${n0(load)} units, then ${n1(rate)} units/h`,
      notes: ['aPTT 4 hours after the loading dose, and 4 hours after every change in the infusion rate.', 'Enter an aPTT and the current rate to see the protocol\'s adjustment.', cite], note: NOTE,
    };
  }
  const af = inputFault([['the aPTT', o.aptt, null, 400, 'seconds'], ['the current infusion rate', o.currentRate, null, 28 * 150 * 3, 'units/h']]);
  if (af) return { valid: false, message: af };
  const aptt = Number(o.aptt); const rate = Number(o.currentRate);
  const row = ROWS.find((r) => aptt >= r[0] && aptt <= r[1]);
  if (!row) {
    const below = [...ROWS].reverse().find((r) => r[1] < aptt); const above = ROWS.find((r) => r[0] > aptt);
    return { valid: true, flag: 'between-rows', abnormal: true, phase: 'adjust', band: `An aPTT of ${aptt} seconds falls between two rows of the table (${rowName(below)} and ${rowName(above)}), which is printed in whole seconds. The tool does not pick one.`, bandLabel: 'Between two rows', notes: ['Use the aPTT as the laboratory reports it, in whole seconds, or apply the local protocol.', cite], note: NOTE };
  }
  const [, , bolusPerKg, hold, pct, repeat] = row;
  const next = rate * (1 + pct / 100);
  const parts = [];
  if (bolusPerKg) parts.push(`bolus ${n0(bolusPerKg * w)} units (${bolusPerKg} units/kg)`);
  if (hold) parts.push(`hold the infusion for ${hold} minutes`);
  parts.push(pct === 0 ? `no change to the rate (${n1(rate)} units/h)` : `${pct > 0 ? 'increase' : 'decrease'} the rate by ${Math.abs(pct)}%, from ${n1(rate)} to ${n1(next)} units/h`);
  const inRange = pct === 0;
  return {
    valid: true, flag: inRange ? 'in-range' : 'adjust', abnormal: !inRange, phase: 'adjust', apttRow: rowName(row),
    bolusUnits: Math.round(bolusPerKg * w), holdMinutes: hold, rateChangePercent: pct, newRateUnitsPerHour: Number(next.toFixed(1)),
    band: `aPTT ${aptt} seconds (row ${rowName(row)}): ${parts.join('; ')}. Repeat the aPTT ${repeat}.`,
    bandLabel: inRange ? `In range, ${n1(rate)} units/h` : `${n1(next)} units/h`,
    notes: [`The new rate is ${n1(next / w)} units/kg per hour at ${w.toLocaleString('en-US')} kg.`, inRange ? 'When aPTT values are therapeutic, the protocol asks for a daily CBC and aPTT.' : 'aPTT 4 hours after every change in the infusion rate.', cite], note: NOTE,
  };
}
