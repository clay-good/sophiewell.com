// spec-v1484: Dean's Community Fluorosis Index (CFI), beside the dental caries and oral hygiene
// indices.
//
// Sources, read 2026-09-25:
//   Dean HT. Classification of mottled enamel diagnosis. J Am Dent Assoc. 1934;21:1421-1426.
//   As applied in BMC Public Health 2024 (PMC11267771): "Dean classified the dental fluorosis studies
//     as normal, questionable, very mild, mild, moderate, and severe. Numerical weightage values ...
//     0, 0.5, 1, 2, 3 and 4"; CFI = sum(number of people x Dean's numerical weight) / total number of
//     people; "CFI values of 0-0.4, 0.4-0.6, 0.6-1, 1-2, 2-3 and 3-4 indicate a 'negative',
//     'borderline', 'slight', 'medium', 'marked', and 'very' marked public health concern
//     respectively ... when the value crosses 0.6, fluorosis becomes a public health issue".
//   The printed bands share their endpoints; a value exactly on one is read into the lower band and
//   the answer says so.
//
// Every category count is required (0 if none): a blank count is not assumed to be none. Pure.

import { inputFault } from './num.js';

export const DEAN_CATEGORIES = [
  { key: 'normal', label: 'normal', weight: 0 },
  { key: 'questionable', label: 'questionable', weight: 0.5 },
  { key: 'veryMild', label: 'very mild', weight: 1 },
  { key: 'mild', label: 'mild', weight: 2 },
  { key: 'moderate', label: 'moderate', weight: 3 },
  { key: 'severe', label: 'severe', weight: 4 },
];
const BANDS = [
  { max: 0.4, label: 'negative' },
  { max: 0.6, label: 'borderline' },
  { max: 1, label: 'slight' },
  { max: 2, label: 'medium' },
  { max: 3, label: 'marked' },
  { max: 4, label: 'very marked' },
];

export function deanFluorosisCfi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault(DEAN_CATEGORIES.map((c) => [`the number of people scored ${c.label} (0 if none)`, o[c.key], 0, 1000000, '']));
  if (fault) return { valid: false, message: fault };
  const counts = DEAN_CATEGORIES.map((c) => Number(o[c.key]));
  if (counts.some((n) => !Number.isInteger(n))) return { valid: false, message: 'Enter each count as a whole number of people.' };
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return { valid: false, message: 'Enter the counts again: at least one person must be scored.' };
  const cfi = counts.reduce((s, n, i) => s + n * DEAN_CATEGORIES[i].weight, 0) / total;
  const shown = Math.round(cfi * 100) / 100;
  const band = BANDS.find((b) => cfi <= b.max).label;
  const notes = [];
  if (BANDS.some((b) => b.max === shown && b.max < 4)) {
    notes.push(`${shown} is the shared endpoint of two printed bands; it is read here into the lower one.`);
  }
  notes.push('Above 0.6, fluorosis is a public health issue in the population surveyed.');
  const affected = total - counts[0] - counts[1];
  return {
    valid: true,
    cfi: shown,
    total,
    abnormal: cfi > 0.6,
    band: `Community Fluorosis Index ${shown.toFixed(2)} across ${total} people: ${band} public health concern.`,
    bandLabel: `CFI ${shown.toFixed(2)}, ${band}`,
    notes: [...notes, `${affected} of ${total} people (${Math.round((affected / total) * 1000) / 10}%) scored very mild or worse.`],
    note: 'Dean HT, J Am Dent Assoc 1934; weights and bands as applied in BMC Public Health 2024. It describes a population, not a patient.',
  };
}
