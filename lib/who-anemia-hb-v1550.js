// spec-v1550 tool 1: is this hemoglobin anemic? WHO 2024 cutoffs, with the elevation and smoking
// adjustments.
//
// Source: WHO, Guideline on haemoglobin cutoffs to define anaemia in individuals and populations, 2024
// (IRIS 10665/376196; CC BY-NC-SA 3.0 IGO, so the numbers are used as facts and nothing is reproduced).
// Read October 3, 2026: Table 2 (cutoffs, the 5th percentile), Table 3 (severity), Table 4 (elevation,
// subtracted from the measured value), Table 5 (smoking, the same). It supersedes the 2011 cutoffs.
//
// Edges this tile states rather than hides:
//   - Table 3 prints integer ranges (95-104); the raw value is compared with each row's lower edge, so
//     104.5 is mild, never "between rows".
//   - Table 4 starts at 1 m; 0 to 499 m is no adjustment.
//   - Table 5 has no row for exactly 20 cigarettes a day (<10, 10-19, >20). The tile uses the table's own
//     formula at 20 (0.4565 x 20 - 0.0078 x 20^2 = 6.0 g/L) and says why.
//   - The table covers 6 months to 65 years; nothing outside it is answered.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

// Each group in g/L: anemia below `cutoff`; mild from `mild`, moderate from `moderate`, severe below it (Tables 2-3).
export const GROUPS = [
  { value: 'c6-23', text: 'Child 6 to 23 months', whom: 'a child 6 to 23 months', cutoff: 105, mild: 95, moderate: 70 },
  { value: 'c24-59', text: 'Child 24 to 59 months', whom: 'a child 24 to 59 months', cutoff: 110, mild: 100, moderate: 70 },
  { value: 'c5-11', text: 'Child 5 to 11 years', whom: 'a child 5 to 11 years', cutoff: 115, mild: 110, moderate: 80 },
  { value: 'g12-14', text: 'Girl 12 to 14 years, not pregnant', whom: 'a girl 12 to 14 years', cutoff: 120, mild: 110, moderate: 80 },
  { value: 'b12-14', text: 'Boy 12 to 14 years', whom: 'a boy 12 to 14 years', cutoff: 120, mild: 110, moderate: 80 },
  { value: 'women', text: 'Woman 15 to 65 years, not pregnant', whom: 'a woman 15 to 65 years who is not pregnant', cutoff: 120, mild: 110, moderate: 80 },
  { value: 'men', text: 'Man 15 to 65 years', whom: 'a man 15 to 65 years', cutoff: 130, mild: 110, moderate: 80 },
  { value: 'preg1', text: 'Pregnant, first trimester', whom: 'pregnancy in the first trimester', cutoff: 110, mild: 100, moderate: 70 },
  { value: 'preg2', text: 'Pregnant, second trimester', whom: 'pregnancy in the second trimester', cutoff: 105, mild: 95, moderate: 70 },
  { value: 'preg3', text: 'Pregnant, third trimester', whom: 'pregnancy in the third trimester', cutoff: 110, mild: 100, moderate: 70 },
];

export const UNITS = [{ value: 'gdl', text: 'g/dL' }, { value: 'gl', text: 'g/L' }];

// Table 4: [from m, adjustment g/L], each row to the next row's start; 5,000 m and above is off the table.
export const ELEVATION = [[0, 0], [500, 4], [1000, 8], [1500, 11], [2000, 14], [2500, 18], [3000, 21], [3500, 25], [4000, 29], [4500, 33]];

export const SMOKING = [
  { value: 'no', text: 'Does not smoke', adj: 0 },
  { value: 'unknown', text: 'Smokes, amount not known', adj: 3 },
  { value: 'lt10', text: 'Fewer than 10 cigarettes a day', adj: 3 },
  { value: '10-19', text: '10 to 19 cigarettes a day', adj: 5 },
  { value: '20', text: 'Exactly 20 cigarettes a day', adj: 6 },
  { value: 'gt20', text: 'More than 20 cigarettes a day', adj: 6 },
];

const g = (x) => String(Math.round(x * 10) / 10);
const dl = (x) => String(Math.round(x) / 10);
const both = (x) => `${g(x)} g/L (${dl(x)} g/dL)`;

export function whoAnemiaHb(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const grp = GROUPS.find((x) => x.value === o.group);
  if (!grp) return { valid: false, message: 'Choose the person\'s group: age, sex and, in pregnancy, the trimester. WHO 2024 covers 6 months to 65 years.' };
  const unit = UNITS.some((u) => u.value === o.unit) ? o.unit : null;
  if (!unit) return { valid: false, message: 'Choose the hemoglobin unit, g/dL or g/L.' };
  const raw = String(o.hb ?? '').trim();
  if (!raw) return { valid: false, message: `Enter the hemoglobin in ${unit === 'gl' ? 'g/L' : 'g/dL'}.` };
  const v = Number(raw);
  if (Number.isFinite(v) && unit === 'gl' && v > 0 && v < 20) return { valid: false, message: `${raw} g/L is not a hemoglobin a person could have. Did you mean ${raw} g/dL? Change the unit if so.` };
  if (Number.isFinite(v) && unit === 'gdl' && v > 25 && v <= 250) return { valid: false, message: `${raw} g/dL is not a hemoglobin a person could have. Did you mean ${raw} g/L? Change the unit if so.` };
  const f = inputFault([['the hemoglobin', raw, unit === 'gl' ? 20 : 2, unit === 'gl' ? 250 : 25, unit === 'gl' ? 'g/L' : 'g/dL']]);
  if (f) return { valid: false, message: f };
  const measured = unit === 'gl' ? v : v * 10;
  const notes = [];

  let elevAdj = 0;
  const er = String(o.elevation ?? '').trim();
  if (er) {
    const ef = inputFault([['the elevation where the person lives', er, 0, 4999, 'meters']]);
    if (ef) return { valid: false, message: ef };
    const e = Number(er);
    elevAdj = ELEVATION.filter(([from]) => e >= from).pop()[1];
    notes.push(`Elevation ${e.toLocaleString('en-US')} m: ${elevAdj} g/L subtracted (WHO 2024 Table 4).`);
    if (e >= 2500) notes.push('Above 2,500 m, WHO notes the adjustment may need tailoring to the local population.');
  } else notes.push('Elevation was not entered, so no elevation adjustment is made. Above 500 m the measured value overstates the hemoglobin for anemia.');

  let smokeAdj = 0;
  const sm = SMOKING.find((x) => x.value === o.smoking);
  if (sm) {
    smokeAdj = sm.adj;
    if (sm.value === '20') notes.push('Exactly 20 a day falls in no row of WHO 2024 Table 5 (it lists fewer than 10, 10 to 19, and more than 20), so the table\'s own formula is used at 20: 6.0 g/L.');
    else if (smokeAdj) notes.push(`Smoking: ${smokeAdj} g/L subtracted (WHO 2024 Table 5).`);
  } else notes.push('Smoking was not entered, so no smoking adjustment is made.');

  const adjusted = measured - elevAdj - smokeAdj;
  const anemic = adjusted < grp.cutoff;
  const severity = !anemic ? null : adjusted >= grp.mild ? 'mild' : adjusted >= grp.moderate ? 'moderate' : 'severe';
  if (!Number.isInteger(Math.round(adjusted * 10) / 10)) notes.push('WHO prints its severity ranges in whole g/L; the value is compared with each range\'s lower edge, so a fraction never falls between rows.');
  const adjText = elevAdj || smokeAdj ? ` adjusted to ${both(adjusted)} from ${both(measured)} measured` : ` ${both(measured)}`;
  const band = anemic
    ? `${severity[0].toUpperCase()}${severity.slice(1)} anemia: hemoglobin${adjText}, below the cutoff of ${both(grp.cutoff)} for ${grp.whom}. ${severity === 'mild' ? `Mild is ${grp.mild} to below ${grp.cutoff} g/L` : severity === 'moderate' ? `Moderate is ${grp.moderate} to below ${grp.mild} g/L` : `Severe is below ${grp.moderate} g/L`}.`
    : `No anemia: hemoglobin${adjText}, at or above the cutoff of ${both(grp.cutoff)} for ${grp.whom}.`;
  return {
    valid: true,
    adjusted: Math.round(adjusted * 10) / 10,
    anemic,
    severity,
    band,
    bandLabel: anemic ? `${severity[0].toUpperCase()}${severity.slice(1)} anemia` : 'No anemia',
    abnormal: anemic,
    notes,
    note: 'This follows the WHO 2024 hemoglobin cutoffs, which replaced the 2011 ones. It defines anemia; it does not find the cause. Your national protocol may differ; follow it.',
  };
}
