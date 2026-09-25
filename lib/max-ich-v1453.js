// spec-v1453: the max-ICH score for spontaneous intracerebral hemorrhage.
//
// Sources, read 2026-09-24:
//   Sembill JA, Gerner ST, Volbers B, et al. Severity assessment in maximally treated ICH patients:
//     the max-ICH score. Neurology 2017;89(5):423-431 -- the derivation (not open access).
//   Schmidt FA, Liotta EM, Prabhakaran S, Naidech AM, Maas MB. Assessment and comparison of the
//     max-ICH score and ICH score by external validation. Neurology 2018;91(10):e939-e946
//     (PMC6139815). Its Table 1, "ICH score and max-ICH score composition", max-ICH column:
//       NIH Stroke Scale      >=21: 3   14-20: 2   7-13: 1   0-6: 0
//       Age, y                >=80: 3   75-79: 2   70-74: 1   <=69: 0
//       Hematoma volume, mL   Lobar >=30: 1   Lobar <30: 0   Nonlobar >=10: 1   Nonlobar <10: 0
//       Intraventricular hemorrhage   Yes: 1   No: 0
//       Oral anticoagulation          Yes: 1   No: 0
//     Abstract: both scores "showed good prognostic performance" for 3-month mortality and poor
//     outcome (mRS 4-6), "AUC range 0.80-0.86, with no significant difference in AUC between the
//     scores"; Discussion: the derivation's advantage "may be associated with relative overfitting".
//   Mrochen A, Spruegel MI, ... Sembill JA. Long-term survival, burden of disease, and patient-centered
//     outcomes in maximally treated intracerebral hemorrhage. Ann Clin Transl Neurol
//     2025;12(6):1144-1150 (PMC12172108). 1022 maximally treated patients (no early care limitation),
//     one center, 2006-2015: "5-year survival estimates for each max-ICH Score ... 0: 85%, 1: 91%,
//     2: 69%, 3: 59%, 4: 47%, 5: 32%, 6: 29%, 7: 18%, and >= 8: 0%"; the Cox hazard of death was
//     significant "of 2 or higher compared to 0"; it names "a max-ICH Score of 9" as the top of the
//     scale; its limitations note "the smaller number within individual max-ICH categories". Its
//     Table 1 splits every hematoma into lobar (43.2%) or nonlobar (56.8%), so nonlobar is every
//     location that is not lobar.
//
// Volume is one variable: the hematoma is lobar or nonlobar, and only its own threshold applies,
// so the total runs 0 to 9. Age bands are whole years; a fractional age is read in completed years.
// Pure: no DOM, no clock, no network.

import { BOUNDS } from './bounds.js';
import { inputFault } from './num.js';

export const MICH_LOCATION = [
  { value: 'lobar', text: 'Lobar' },
  { value: 'nonlobar', text: 'Nonlobar (any location that is not lobar)' },
];
export const MICH_YESNO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

// Mrochen 2025, 5-year survival by score; the last entry covers 8 and 9.
const SURVIVAL_5Y = ['85%', '91%', '69%', '59%', '47%', '32%', '29%', '18%', '0%'];
// More than the whole adult intracranial volume (about 1.5 L): an entry error, not a hematoma.
const VOLUME_MAX_ML = 2000;

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

function nihssPoints(n) {
  if (n >= 21) return 3;
  if (n >= 14) return 2;
  if (n >= 7) return 1;
  return 0;
}
function agePoints(years) {
  if (years >= 80) return 3;
  if (years >= 75) return 2;
  if (years >= 70) return 1;
  return 0;
}

export function maxIch(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([
    ['the NIHSS score', o.nihss, 0, 42, ''],
    ['the age', o.age, BOUNDS.ageYears.min, BOUNDS.ageYears.max, 'years'],
  ]);
  if (fault) return { valid: false, message: fault };
  const nihss = Number(String(o.nihss).trim());
  if (!Number.isInteger(nihss)) return { valid: false, message: 'The NIHSS score is a whole number from 0 to 42. Check the value entered.' };

  const location = pick(MICH_LOCATION, o.location);
  if (!location) return { valid: false, message: 'Choose whether the hematoma is lobar or nonlobar.' };
  const volFault = inputFault([['the hematoma volume', o.volume, 0, VOLUME_MAX_ML, 'mL']]);
  if (volFault) return { valid: false, message: volFault };
  const ivh = pick(MICH_YESNO, o.ivh);
  if (!ivh) return { valid: false, message: 'Choose whether there is intraventricular hemorrhage.' };
  const oac = pick(MICH_YESNO, o.oac);
  if (!oac) return { valid: false, message: 'Choose whether the patient was taking oral anticoagulation.' };

  const age = Math.floor(Number(String(o.age).trim()));
  const volume = Number(String(o.volume).trim());
  const threshold = location === 'lobar' ? 30 : 10;
  const parts = {
    nihss: nihssPoints(nihss),
    age: agePoints(age),
    volume: volume >= threshold ? 1 : 0,
    ivh: ivh === 'yes' ? 1 : 0,
    oac: oac === 'yes' ? 1 : 0,
  };
  const score = parts.nihss + parts.age + parts.volume + parts.ivh + parts.oac;
  const survival = SURVIVAL_5Y[Math.min(score, 8)];
  const at = score >= 8 ? 'at a score of 8 or more' : 'at this score';

  const notes = [
    `Points: NIHSS ${nihss} = ${parts.nihss}; age ${age} = ${parts.age}; ${location} hematoma of ${volume} mL`
      + ` = ${parts.volume} (the ${location} threshold is ${threshold} mL); intraventricular hemorrhage = ${parts.ivh};`
      + ` oral anticoagulation = ${parts.oac}.`,
    `In one center's 1022 patients who received maximal treatment (no early care limitation), 5-year survival was ${survival} ${at};`
      + ' the higher categories held few patients, so their estimates are imprecise.',
    'In an external validation the max-ICH score and the original ICH score predicted 3-month death and poor outcome (modified Rankin 4 to 6)'
      + ' about equally well (AUC 0.80 to 0.86, no significant difference).',
  ];

  return {
    valid: true,
    // Mrochen 2025: the hazard of death differed from a score of 0 from a score of 2 upward.
    abnormal: score >= 2,
    score,
    parts,
    band: `max-ICH score ${score} of 9: in maximally treated patients at the derivation center, 5-year survival was ${survival} ${at}.`,
    bandLabel: `${score} of 9`,
    notes,
    note: 'Sembill JA et al, Neurology 2017; items and points as tabulated by Schmidt FA et al, Neurology 2018 (Table 1);'
      + ' survival from Mrochen A et al, Ann Clin Transl Neurol 2025. The figures describe patients who were treated fully;'
      + ' the score informs prognosis and does not decide on limiting care or on any treatment.',
  };
}
