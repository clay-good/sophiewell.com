// spec-v1446: hypoglycemia level (ADA) and the first treatment step.
//
// Sources, read 2026-09-24:
//   American Diabetes Association Professional Practice Committee. 6. Glycemic Goals and
//     Hypoglycemia: Standards of Care in Diabetes-2025. Diabetes Care 2025;48(Suppl 1):S128-S145
//     (PMC11635034). Classification: "Level 1 Glucose <70 mg/dL (<3.9 mmol/L) and >=54 mg/dL
//     (>=3.0 mmol/L); Level 2 Glucose <54 mg/dL (<3.0 mmol/L); Level 3 A severe event characterized
//     by altered mental and/or physical status requiring assistance for treatment of hypoglycemia,
//     irrespective of glucose level". Recommendation 6.15: "Glucose is the preferred treatment for the
//     conscious individual with glucose <70 mg/dL ... Avoid using foods or beverages high in fat
//     and/or protein for initial treatment of hypoglycemia. Fifteen minutes after initial treatment,
//     repeat the treatment if hypoglycemia persists." 6.16: glucagon for everyone taking insulin or
//     at high risk.
//   The amount and the follow-up snack: "15-20 g of fast-acting carbohydrate, followed by blood
//     glucose reassessment after 15 min. Once euglycemic, a longer-acting carbohydrate ... ideally
//     with protein"; glucagon "(intramuscular, subcutaneous, or intranasal)" in severe hypoglycemia or
//     loss of consciousness (Alagiakrishnan K et al, Geriatrics 2026;11:118, open access).
//
// Glucose arrives in canonical mg/dL (the page converts mmol/L). Pure: no DOM, no clock, no network.

import { boundsAdvisory } from './bounds.js';

export const HYPO_YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}

export function hypoglycemiaLevel(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const assist = o.needsAssistance === 'yes' ? true : o.needsAssistance === 'no' ? false : null;
  if (assist === null) {
    return { valid: false, message: 'Choose whether the person has altered mental or physical status and needs help to treat it: that makes it level 3 whatever the glucose.' };
  }
  let glucose = null;
  if (!isBlank(o.glucoseMgDl)) {
    const g = Number(o.glucoseMgDl);
    if (!Number.isFinite(g)) return { valid: false, message: 'Enter the glucose as a number.' };
    const fault = boundsAdvisory('glucose', g);
    if (fault) return { valid: false, message: fault };
    glucose = g;
  }
  if (!assist && glucose === null) return { valid: false, message: 'Enter the glucose.' };

  const gText = glucose === null ? '' : ` (glucose ${Math.round(glucose)} mg/dL, ${Math.round((glucose / 18) * 10) / 10} mmol/L)`;
  let level;
  let band;
  if (assist) {
    level = 3;
    band = `Level 3 hypoglycemia${gText}: a severe event needing assistance, whatever the glucose.`;
  } else if (glucose < 54) {
    level = 2;
    band = `Level 2 hypoglycemia${gText}: below 54 mg/dL (3.0 mmol/L).`;
  } else if (glucose < 70) {
    level = 1;
    band = `Level 1 hypoglycemia${gText}: below 70 mg/dL (3.9 mmol/L), at or above 54.`;
  } else {
    level = 0;
    band = `Not hypoglycemia by the ADA levels${gText}: 70 mg/dL (3.9 mmol/L) or above.`;
  }

  const steps = [];
  if (level === 3) {
    steps.push('Unable to take glucose by mouth safely: give glucagon (intramuscular, subcutaneous or intranasal) or follow your facility\'s protocol for severe hypoglycemia.');
  } else if (level > 0) {
    steps.push('Give 15 to 20 g of fast-acting carbohydrate; glucose is preferred. Avoid foods high in fat or protein for this first treatment.');
    steps.push('Recheck in 15 minutes and repeat the treatment if the glucose is still below 70 mg/dL.');
    steps.push('Once the glucose is back in range, give a longer-acting carbohydrate, ideally with protein, to prevent a recurrence.');
  }
  const notes = [];
  if (level >= 2) notes.push('A level 2 or 3 episode should prompt a review of the treatment plan (ADA).');
  if (level > 0) notes.push('Glucagon should be prescribed for everyone taking insulin or at high risk of hypoglycemia (ADA 6.16).');

  return {
    valid: true,
    abnormal: level > 0,
    level,
    band,
    bandLabel: level ? `Level ${level}` : 'Not hypoglycemia',
    steps,
    notes,
    note: 'ADA Standards of Care in Diabetes 2025, section 6 (levels; recommendations 6.15 and 6.16); the 15 to 20 g amount and the follow-up carbohydrate from Alagiakrishnan K et al, Geriatrics 2026. Your facility protocol governs.',
  };
}
