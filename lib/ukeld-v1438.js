// spec-v1438: UKELD (United Kingdom Model for End-Stage Liver Disease).
//
// Sources, read 2026-09-24:
//   Barber K, Madden S, Allen J, et al; UK Liver Transplant Selection and Allocation Working Party.
//     Elective liver transplant list mortality: development of a United Kingdom end-stage liver
//     disease score. Transplantation 2011;92(4):469-476 (abstract, PubMed 21775931): derived in 1,103
//     adults registered for a first elective UK liver transplant, validated in 452; "not associated
//     with overall posttransplant survival".
//   The formula, stated identically with its units in two open papers (Transplant Proc / PMC5304182
//     and PMC4907519): 5.395 x ln(INR) + 1.485 x ln(creatinine, umol/L) + 3.13 x ln(bilirubin,
//     umol/L) - 81.565 x ln(sodium, mmol/L) + 435.
//   The listing threshold: "UKELD score >=49" among "current UK listing criteria" (Transplantation
//     Direct 2025, PMC11809985).
//
// Inputs arrive in the house's canonical units (creatinine and bilirubin in mg/dL) and are converted
// to umol/L with the repository's own factors (lib/unit-convert.js: 88.4 and 17.1) -- the
// coefficients are a claim about umol/L, and applying them to mg/dL would be a different score.
// Pure: no DOM, no clock, no network.

import { boundsAdvisory } from './bounds.js';
import { LAB } from './unit-convert.js';

// The page's creatinine unit choice: canonical mg/dL first (option 0), so examples and agent calls
// stay in mg/dL; umol/L converts with the same factor the score uses.
export const CREATININE_UNITS = [
  { unit: 'mg/dL', toCanonical: (v) => v },
  { unit: 'umol/L', toCanonical: (v) => v / LAB.creatinine.factor },
];

function isBlank(v) {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}

export function ukeld(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fields = [
    ['inr', 'the INR', o.inr],
    ['scr', 'the serum creatinine', o.creatinineMgDl],
    ['bilirubin', 'the total bilirubin', o.bilirubinMgDl],
    ['sodium', 'the serum sodium', o.sodium],
  ];
  const missing = fields.filter(([, , v]) => isBlank(v)).map(([, label]) => label);
  if (missing.length) return { valid: false, message: `Enter ${missing.join(', ')}.` };
  const vals = {};
  for (const [key, label, raw] of fields) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return { valid: false, message: `Enter ${label} as a number.` };
    const fault = boundsAdvisory(key, n);
    if (fault) return { valid: false, message: fault };
    if (n <= 0) return { valid: false, message: `${label.charAt(0).toUpperCase()}${label.slice(1)} must be greater than 0: the score takes its logarithm.` };
    vals[key] = n;
  }
  const creatUmol = vals.scr * LAB.creatinine.factor;
  const biliUmol = vals.bilirubin * LAB.bilirubin.factor;
  const raw = 5.395 * Math.log(vals.inr) + 1.485 * Math.log(creatUmol) + 3.13 * Math.log(biliUmol)
    - 81.565 * Math.log(vals.sodium) + 435;
  // Reported, and compared with 49, as a whole number.
  const score = Math.round(raw);
  const meets = score >= 49;
  return {
    valid: true,
    abnormal: meets,
    score,
    creatinineUmol: Math.round(creatUmol),
    bilirubinUmol: Math.round(biliUmol),
    band: meets
      ? `UKELD ${score}: at or above 49, the UK threshold for listing for elective liver transplantation.`
      : `UKELD ${score}: below 49, the UK threshold for listing for elective liver transplantation.`,
    bandLabel: `${score}${meets ? ' (49 or more)' : ''}`,
    notes: [
      `Computed from creatinine ${Math.round(creatUmol)} umol/L and bilirubin ${Math.round(biliUmol)} umol/L: the coefficients are for umol/L.`,
      'A UK score for waiting-list mortality, derived in 1,103 UK patients; it is not interchangeable with MELD and was not associated with survival after transplant.',
      'A score below 49 does not rule out listing: UK criteria also list for other indications (for example recurrent ascites, recurrent encephalopathy, or hepatocellular carcinoma).',
    ],
    note: 'Barber K et al, Transplantation 2011: UKELD = 5.395 ln(INR) + 1.485 ln(creatinine umol/L) + 3.13 ln(bilirubin umol/L) - 81.565 ln(sodium mmol/L) + 435.',
  };
}
