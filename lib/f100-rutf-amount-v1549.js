// spec-v1549 tool 2: how much F-100 per feed, or how many RUTF sachets a day, for a child with severe acute
// malnutrition, by phase.
//
// Sources, read October 6, 2026 (facts restated, nothing reproduced):
//   - WHO. Training course on the inpatient management of severe acute malnutrition, 2021, module 4 (IRIS
//     10665/352668; CC BY-NC-SA 3.0 IGO), pp. 21-24: transition from F-75 to RUTF at 100-135 kcal/kg/day; F-100
//     only when RUTF is not accepted or not available, in hospital, 150-220 mL/kg/day (150-220 kcal/kg/day) in 6
//     feeds every 4 hours; weight between card rows uses the next lower row; above 10 kg, weight x 150 and x 220
//     divided by 6. Web Annex C (the F-100 card, 10665/351604): per-feed volumes rounded to 5 mL.
//   - WHO guideline on the prevention and management of wasting and nutritional oedema, 2023 (IRIS 10665/376075),
//     recommendation B10: outpatient RUTF at 150-185 kcal/kg/day until recovery, or 150-185 until no longer
//     severely wasted and without edema, then 100-130 kcal/kg/day until recovery. It replaced the older
//     150-220 kcal/kg/day.
//   - WHO. IMCI chart booklet, 2014 (the RUTF table), 92 g / 500 kcal packets a day by weight: 4.0-4.9 kg 2.0
//     (14 a week), 5.0-6.9 kg 2.5 (18), 7.0-8.4 kg 3.0 (21), 8.5-9.4 kg 3.5 (25), 9.5-10.4 kg 4.0 (28),
//     10.5-11.9 kg 4.5 (32), above 12.0 kg 5.0 (35); no extra iron or vitamin A for a child on RUTF.
//
// Corrected from the spec: the 2021 course moves transition onto RUTF (100-135 kcal/kg/day), and keeps F-100 for
// in-hospital rehabilitation when RUTF is refused. Stated rather than hidden: the 2014 table predates the 2023
// range and gives more (shown beside it for comparison); it leaves 11.9-12.0 kg and exactly 12.0 kg undefined,
// read as the top band; a blank sachet energy uses the standard 500 kcal sachet and says so.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const PHASE_OPTIONS = [
  { value: 'transition', text: 'Transition (RUTF, after F-75)' },
  { value: 'outpatient', text: 'Outpatient treatment (RUTF, full amount)' },
  { value: 'reduced', text: 'Outpatient, reduced (no longer severely wasted, no edema)' },
  { value: 'f100', text: 'In-hospital rehabilitation on F-100 (RUTF not accepted)' },
];

const IMCI = [[4.0, 2.0, 14], [5.0, 2.5, 18], [7.0, 3.0, 21], [8.5, 3.5, 25], [9.5, 4.0, 28], [10.5, 4.5, 32], [12.0, 5.0, 35]];
const round5 = (x) => Math.floor(x / 5 + 0.5 + 1e-9) * 5;
const r1 = (x) => String(Math.round(x * 10) / 10);
const r2 = (x) => String(Math.round(x * 100) / 100);

export function f100RutfAmount(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 1.5, 40, 'kg']]);
  if (f) return { valid: false, message: f };
  const phase = PHASE_OPTIONS.find((x) => x.value === o.phase);
  if (!phase) return { valid: false, message: 'Choose the phase: transition, outpatient, reduced outpatient, or F-100 in hospital.' };
  const w = Number(o.weight);
  const notes = [];

  if (phase.value === 'f100') {
    const useW = w <= 10 ? Math.floor(w * 5 + 1e-9) / 5 : w;
    const lo = round5(useW * 150 / 6);
    const hi = round5(useW * 220 / 6);
    if (w <= 10 && Math.abs(useW - w) > 1e-9) notes.push(`From the card's ${useW.toFixed(1)} kg row, the next lower row for ${w} kg.`);
    if (w > 10) notes.push('Above 10 kg the card stops; this is weight x 150 and x 220 divided by 6.');
    notes.push(`Daily range ${Math.round(useW * 150)}-${Math.round(useW * 220)} mL (150-220 mL/kg/day). Let the child eat as much as they want within the range, every 4 hours, never alone.`);
    notes.push('Starting F-100: the same volume as the last F-75 feed for 2 days, then 10 mL more per feed while the child finishes every feed.');
    return { valid: true, band: `F-100 ${lo}-${hi} mL per feed, 6 feeds a day.`, bandLabel: `${lo}-${hi} mL per feed`, abnormal: false, notes, note: 'This follows WHO\'s 2021 SAM training course, module 4 and its F-100 reference card. Your national protocol may differ; follow it.' };
  }

  let kcal = 500;
  if (o.sachet === undefined || o.sachet === null || String(o.sachet).trim() === '') {
    notes.push('No sachet energy was entered, so the standard 92 g, 500 kcal sachet is used.');
  } else {
    const fs = inputFault([['the sachet energy', o.sachet, 100, 1000, 'kcal']]);
    if (fs) return { valid: false, message: fs };
    kcal = Number(o.sachet);
  }
  const [a, b, src] = phase.value === 'transition' ? [100, 135, 'transition, 100-135 kcal/kg/day'] : phase.value === 'outpatient' ? [150, 185, 'WHO 2023, 150-185 kcal/kg/day'] : [100, 130, 'WHO 2023 reduced amount, 100-130 kcal/kg/day'];
  const sLo = (w * a) / kcal;
  const sHi = (w * b) / kcal;
  const band = `RUTF ${r2(sLo)}-${r2(sHi)} sachets a day (${Math.round(w * a).toLocaleString('en-US')}-${Math.round(w * b).toLocaleString('en-US')} kcal; ${src}) for ${r1(w)} kg.`;
  if (phase.value === 'outpatient') {
    if (w >= 4.0) {
      const row = [...IMCI].reverse().find(([lo]) => w >= lo) || IMCI[IMCI.length - 1];
      const top = w >= 11.9;
      notes.push(`The IMCI 2014 table, which predates the 2023 range and gives more, says ${row[1]} sachets a day (${row[2]} a week)${top ? '; it leaves 11.9-12.0 kg and exactly 12.0 kg undefined, read here as its top band' : ''}.`);
    }
    notes.push('WHO 2023 allows reducing to 100-130 kcal/kg/day once the child is no longer severely wasted and has no edema.');
  }
  notes.push('No RUTF for infants under 6 months. A child on RUTF needs no extra iron or vitamin A.');
  return { valid: true, band, bandLabel: `${r2(sLo)}-${r2(sHi)} sachets a day`, abnormal: false, notes, note: 'This follows WHO\'s 2023 wasting guideline and 2021 SAM training course. Your national protocol may differ; follow it.' };
}
