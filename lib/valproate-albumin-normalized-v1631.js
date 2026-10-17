// spec-v1631 tool 9: total valproic acid level normalized for low albumin (Hermida and Tutor 2005).
//
// Source: Hermida J, Tutor JC. A theoretical method for normalizing total serum valproic acid
// concentration in hypoalbuminemic patients. J Pharmacol Sci 2005;97:489-493 (J-STAGE, open to read;
// (c)2005 The Japanese Pharmacological Society). Re-read from the J-STAGE PDF October 17, 2026:
//   CN = aH x CH / 6.5, where CH is the measured total level, aH the free fraction (%) for the patient's
//   albumin from Table 1 (taken by the paper from its ref. 14), and 6.5 the free fraction at 42 g/L.
//   Agreement was acceptable for total levels below 75 mg/L; above that, binding saturates and the
//   predicted free fractions were significantly lower than observed.
// Owner decision of October 17, 2026 (scope-pharmacy-practice.md question 11): ship the formula and the
// table's numbers as facts with attribution; the table itself is not displayed.
// The paper gives no therapeutic range for the normalized value, and none is given here.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// Albumin (g/L) -> free fraction (%), Table 1, all 25 rows.
const TABLE = new Map([
  [42, 6.5], [41, 6.8], [40, 7.3], [39, 7.9], [38, 8.5], [37, 9.1], [36, 9.8], [35, 10.5], [34, 11.3],
  [33, 12.1], [32, 13.0], [31, 14.0], [30, 15.0], [29, 16.2], [28, 17.4], [27, 18.7], [26, 20.1],
  [25, 21.6], [24, 23.2], [23, 24.9], [22, 26.8], [21, 28.9], [20, 31.0], [19, 33.3], [18, 35.8],
]);
export const ALBUMIN_UNITS = [{ value: 'g-dl', text: 'g/dL' }, { value: 'g-l', text: 'g/L' }];
const NOTE = 'An estimate from a published free-fraction table, not a measured free level: where a free valproic acid level can be measured, it answers the question directly.';
const CITE = 'Hermida J, Tutor JC. J Pharmacol Sci 2005;97:489-493, Table 1 and the equation CN = aH x CH / 6.5.';
const r1 = (x) => Math.round(x * 10) / 10;

export function valproateAlbuminNormalized(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the total valproic acid level', o.totalLevel, null, 500, 'mg/L']]);
  if (f) return { valid: false, message: f };
  const unit = ALBUMIN_UNITS.find((u) => u.value === String(o.albuminUnit ?? '').trim());
  if (!unit) return { valid: false, message: 'Choose the albumin unit: g/dL or g/L.' };
  const a = inputFault([['the serum albumin', o.albumin, null, unit.value === 'g-dl' ? 7 : 70, unit.text]]);
  if (a) return { valid: false, message: a };
  const total = Number(String(o.totalLevel).trim());
  const gl = Math.round(Number(String(o.albumin).trim()) * (unit.value === 'g-dl' ? 10 : 1));
  if (gl > 42) return { valid: false, message: 'The table ends at 42 g/L (4.2 g/dL), the albumin its 6.5% free fraction refers to, so no normalization is given above it.' };
  if (gl < 18) return { valid: false, message: 'The table ends at 18 g/L (1.8 g/dL); below that the paper gives no free fraction, so no normalization is given.' };
  const alpha = TABLE.get(gl);
  const normalized = (alpha * total) / 6.5;
  const free = (alpha * total) / 100;
  const notes = [];
  if (total > 75) notes.push('Above a total of 75 mg/L the paper found the free fraction underestimated (binding saturates), so this normalization is not reliable at this level.');
  notes.push(`Albumin ${gl} g/L (rounded to the table's whole g/L): free fraction ${alpha}%.`);
  notes.push(`Normalized level = ${alpha} x ${r1(total)} / 6.5 = ${r1(normalized)} mg/L; estimated free level = ${alpha}% of ${r1(total)} = ${r1(free)} mg/L.`);
  notes.push('The paper gives no therapeutic range for the normalized value.');
  notes.push(CITE);
  return {
    valid: true, normalizedLevel: r1(normalized), freeLevel: r1(free), freeFraction: alpha, albuminGl: gl,
    flag: total > 75 ? 'above-75' : 'normalized', abnormal: total > 75,
    band: `${total > 75 ? 'Above 75 mg/L total, the paper found this method unreliable. ' : ''}Normalized total valproic acid ${r1(normalized)} mg/L (measured ${r1(total)} mg/L at albumin ${gl} g/L); estimated free level ${r1(free)} mg/L.`,
    bandLabel: `Normalized ${r1(normalized)} mg/L`,
    notes, note: NOTE,
  };
}
