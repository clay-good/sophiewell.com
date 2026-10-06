// spec-v1549 tool 1: F-75 volume per feed during stabilization in severe acute malnutrition.
//
// Source: WHO. Training course on the inpatient management of severe acute malnutrition, 2021, module 4
// (feeding), pp. 3-4, and Web Annex A, the F-75 reference card (IRIS 10665/352668 and 10665/351602; CC
// BY-NC-SA 3.0 IGO, facts restated, the card not reproduced). Read October 6, 2026: 130 mL/kg/day (100
// kcal/kg/day), or 100 mL/kg/day with severe (+++) edema, divided into 12 feeds (every 2 hours), 8 (every 3) or 6
// (every 4), each rounded to the nearest 5 mL; the minimum acceptable intake is 80% of the amount offered; the
// card lists weights in 0.2 kg steps (2.0-10.0 kg, and 3.0-12.0 kg with +++ edema) and a weight between rows
// uses the lower row; the admission weight is used for as long as the child is on F-75. WHO notes the edema
// weight assumption is under review.
//
// Stated rather than hidden: the volume is computed from the formula, and the card row (the lower 0.2 kg step)
// is shown beside the exact-weight figure; outside the card's weight range only the formula applies.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const INTERVAL_OPTIONS = [
  { value: '2', text: 'Every 2 hours (12 feeds)' },
  { value: '3', text: 'Every 3 hours (8 feeds)' },
  { value: '4', text: 'Every 4 hours (6 feeds)' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const round5 = (x) => Math.floor(x / 5 + 0.5 + 1e-9) * 5;
const NOTE = 'This follows WHO\'s 2021 SAM training course, module 4 and its F-75 reference card. Your national protocol may differ; follow it.';

export function f75FeedVolume(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the admission weight', o.weight, 1, 20, 'kg']]);
  if (f) return { valid: false, message: f };
  const iv = INTERVAL_OPTIONS.find((x) => x.value === o.interval);
  if (!iv) return { valid: false, message: 'Choose how often the child is fed: every 2, 3 or 4 hours.' };
  if (!YES_NO.some((x) => x.value === o.edema)) return { valid: false, message: 'Choose whether the child has severe (+++) edema: it lowers the daily amount.' };
  const w = Number(o.weight);
  const perKg = o.edema === 'yes' ? 100 : 130;
  const feeds = { 2: 12, 3: 8, 4: 6 }[iv.value];
  const [lo, hi] = o.edema === 'yes' ? [3.0, 12.0] : [2.0, 10.0];
  const daily = w * perKg;
  const exact = round5(daily / feeds);
  const notes = [];
  let perFeed = exact;
  let rowText = '';
  if (w >= lo && w <= hi) {
    const row = Math.floor(w * 5 + 1e-9) / 5;
    const rowFeed = round5(row * perKg / feeds);
    perFeed = rowFeed;
    if (Math.abs(row - w) > 1e-9) {
      rowText = ` (the card's ${row.toFixed(1)} kg row, the lower row for ${w} kg)`;
      notes.push(`From the exact weight it would be ${exact} mL a feed; the card uses the lower 0.2 kg row.`);
    }
  } else {
    notes.push(`${w} kg is outside the card's ${lo.toFixed(1)}-${hi.toFixed(1)} kg range${o.edema === 'yes' ? ' for severe edema' : ''}; this is the formula's figure.`);
  }
  const usedDaily = perFeed === exact ? daily : (Math.floor(w * 5 + 1e-9) / 5) * perKg;
  notes.push(`Daily total ${Math.round(usedDaily)} mL (${perKg} mL/kg/day); the minimum acceptable intake is 80%, ${Math.round(usedDaily * 0.8)} mL a day.`);
  notes.push('Keep using the admission weight while the child is on F-75, even if the weight changes.');
  if (o.edema === 'yes') notes.push('WHO is reviewing whether the lower amount for severe edema overestimates the fluid weight; use the current tables meanwhile.');
  return {
    valid: true,
    band: `F-75 ${perFeed} mL per feed, ${iv.text.toLowerCase()}${rowText}.`,
    bandLabel: `${perFeed} mL per feed`,
    abnormal: false,
    notes,
    note: NOTE,
  };
}
