// spec-v1704 (biosignal-analysis tool 5): ectopic beat and arrhythmia burden. Stated arithmetic: beat burden =
// ectopic beats / total beats x 100; time burden = time in the arrhythmia / monitored time x 100; ectopic beats per
// hour. No risk or treatment threshold is built in (none was read); the reader may enter a reference value.
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';

const sig = (x) => Number(x.toPrecision(4));
const count = (label, raw) => {
  const v = measured(raw);
  if (v === null) return { value: null };
  if (!Number.isInteger(v) || v < 0) return { message: `${label} must be a whole number, 0 or more.` };
  return { value: v };
};

export function ectopyBurden(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const total = count('Total beats', o.totalBeats);
  const v = count('Ventricular ectopic beats', o.ventricular);
  const s = count('Supraventricular ectopic beats', o.supraventricular);
  for (const x of [total, v, s]) if (x.message) return { valid: false, message: x.message };
  const hours = measured(o.monitoredHours);
  const arr = measured(o.arrhythmiaHours);
  if (hours !== null && !(hours > 0)) return { valid: false, message: 'Monitored time must be above 0 hours.' };
  if (arr !== null && arr < 0) return { valid: false, message: 'Time in the arrhythmia cannot be negative.' };
  const lines = [];
  const heads = [];
  const beatsGiven = v.value !== null || s.value !== null;
  if (beatsGiven) {
    if (total.value === null || total.value === 0) return { valid: false, message: 'Enter the total number of beats the ectopic counts are out of.' };
    if ((v.value || 0) + (s.value || 0) > total.value) return { valid: false, message: 'The ectopic beats cannot add up to more than the total beats.' };
    for (const [label, x] of [['Ventricular', v.value], ['Supraventricular', s.value]]) {
      if (x === null) continue;
      const pct = (100 * x) / total.value;
      const perHour = hours !== null ? x / hours : null;
      lines.push(`${label} ectopic burden: ${x.toLocaleString('en-US')} of ${total.value.toLocaleString('en-US')} beats = ${sig(pct)}%${perHour !== null && Number.isFinite(perHour) ? `; ${sig(perHour)} per hour over ${hours} h` : ''}.`);
      heads.push(`${label.toLowerCase()} ${sig(pct)}% of beats`);
    }
  }
  if (arr !== null) {
    if (hours === null) return { valid: false, message: 'Enter the monitored time the arrhythmia time is out of.' };
    if (arr > hours) return { valid: false, message: 'Time in the arrhythmia cannot exceed the monitored time.' };
    const pct = (100 * arr) / hours;
    lines.push(`Time burden: ${arr} h of ${hours} h monitored = ${sig(pct)}%.`);
    heads.push(`${sig(pct)}% of the time`);
  }
  if (!heads.length) return { valid: false, message: 'Enter ectopic beat counts with the total beats, or the time in the arrhythmia with the monitored time.' };
  const ref = measured(o.referencePercent);
  if (ref !== null) lines.push(`Reference value entered: ${ref}% (the reader's; none is built in).`);
  return {
    valid: true, abnormal: false,
    band: `Burden: ${heads.join('; ')}.`, bandLabel: heads[0],
    notes: lines,
    note: 'A count from the monitor report, not a diagnosis. No risk threshold is built in; the denominators are the ones entered.',
  };
}
