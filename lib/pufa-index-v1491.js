// spec-v1491: the PUFA/pufa index of the consequences of untreated caries, beside DMFT.
//
// Sources, read 2026-09-25:
//   Monse B, Heinrich-Weltzien R, Benzian H, Holmgren C, van Palenstein Helderman W. PUFA: an index of
//     clinical consequences of untreated dental caries. Community Dent Oral Epidemiol.
//     2010;38(1):77-82 (the original).
//   The codes and rules as stated in BMC Oral Health 2017 (PMC5504620) and Int J Clin Pediatr Dent
//     2017 (PMC5360799): "Only one score is assigned per tooth. When in doubt concerning the extent of
//     odontogenic infection, the basic score (P/p for pulp involvement) is given ... Upper case letters
//     are used for the permanent dentition and lower case for the primary dentition. The PUFA score per
//     person is calculated in the same cumulative way as for the dmft." Codes as stated in Oral Health
//     Prev Dent 2025 (PMC12246806): P/p pulp involvement (an open pulp chamber, or only roots left);
//     U/u ulceration from sharp fragments of such a tooth; F/f fistula; A/a abscess.
//
// Counts of teeth per code, for each dentition. Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const PUFA_FIELDS = [
  ['P', 'permanent teeth with pulp involvement (P)', 32],
  ['U', 'permanent teeth with ulceration (U)', 32],
  ['F', 'permanent teeth with a fistula (F)', 32],
  ['A', 'permanent teeth with an abscess (A)', 32],
  ['p', 'primary teeth with pulp involvement (p)', 20],
  ['u', 'primary teeth with ulceration (u)', 20],
  ['f', 'primary teeth with a fistula (f)', 20],
  ['a', 'primary teeth with an abscess (a)', 20],
];
const blank = (v) => v === undefined || v === null || String(v).trim() === '';

export function pufaIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const given = PUFA_FIELDS.filter(([k]) => !blank(o[k]));
  if (!given.length) return { valid: false, message: 'Enter the number of teeth for at least one PUFA code.' };
  const fault = inputFault(given.map(([k, label, hi]) => [`the number of ${label}`, o[k], 0, hi, '']));
  if (fault) return { valid: false, message: fault };
  const n = {};
  for (const [k, label] of given) {
    n[k] = Number(o[k]);
    if (!Number.isInteger(n[k])) return { valid: false, message: `Enter the number of ${label} as a whole number.` };
  }
  const sum = (ks) => ks.reduce((s, k) => s + (n[k] || 0), 0);
  const PUFA = sum(['P', 'U', 'F', 'A']);
  const pufa = sum(['p', 'u', 'f', 'a']);
  if (PUFA > 32) return { valid: false, message: 'Enter the permanent counts again: one score per tooth, so they cannot add up to more than 32 teeth.' };
  if (pufa > 20) return { valid: false, message: 'Enter the primary counts again: one score per tooth, so they cannot add up to more than 20 teeth.' };
  const infected = sum(['U', 'F', 'A', 'u', 'f', 'a']);
  const total = PUFA + pufa;
  const permGiven = given.some(([k]) => k === k.toUpperCase());
  const primGiven = given.some(([k]) => k === k.toLowerCase());
  const parts = [permGiven ? `PUFA ${PUFA}` : null, primGiven ? `pufa ${pufa}` : null].filter(Boolean);
  const notes = [];
  if (given.length < PUFA_FIELDS.length) {
    notes.push(`Scored from ${given.length} of the 8 counts; a count not entered can only raise the total.`);
  }
  notes.push('One score per tooth, so each tooth is counted under one code only; when in doubt about the extent of infection, the tooth is scored P.');
  return {
    valid: true,
    PUFA,
    pufa,
    total,
    abnormal: total > 0,
    band: total === 0
      ? `${parts.join(', ')}: no teeth with pulp involvement or odontogenic infection on the counts entered.`
      : `${parts.join(', ')}: ${total} ${total === 1 ? 'tooth' : 'teeth'} with pulp involvement or its consequences, ${infected} of them with ulceration, a fistula or an abscess.`,
    bandLabel: parts.join(', '),
    notes,
    note: 'PUFA index (Monse B et al, Community Dent Oral Epidemiol 2010); rules as stated in BMC Oral Health 2017 and Int J Clin Pediatr Dent 2017. It counts the consequences of untreated caries; it records, it does not treat.',
  };
}
