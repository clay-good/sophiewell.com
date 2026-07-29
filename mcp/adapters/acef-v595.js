// spec-v595 MCP wave: adapter for the ACEF and ACEF II scores in lib/acef-v595.js. The dom keys mirror the
// browser renderer (views/group-v595.js) and META['acef'].example.
//
// **THIS IS A RATIO, NOT A SUM OF POINTS.** The backbone is AGE DIVIDED BY EJECTION FRACTION - a
// dimensionless quantity - with absolute numbers bolted on. There is NO MAXIMUM SCORE and no point ceiling,
// so never report an "x of y" total or invent bands.
//
// **EJECTION FRACTION IS A DENOMINATOR, SO THE SCORE IS NONLINEAR IN IT.** Halving the ejection fraction
// DOUBLES the score: at age 70, an ejection fraction of 30 gives 2.33 and one of 60 gives 1.17. No additive
// score behaves this way, and treating the ejection fraction as a scored item badly misjudges a poor
// ventricle.
//
// **THE CREATININE WEIGHT DOUBLES BETWEEN VERSIONS** - 1 point in the original, 2 in ACEF II - so a value
// CANNOT be carried between them. Both are returned from the same inputs.
//
// **ONE REPRODUCTION OF THE ORIGINAL PRINTS THE CREATININE OPERATOR DIFFERENTLY**: some give "2.0 mg/dL or
// more" and others "above 2.0", differing only at exactly 2.0. ACEF II is consistently "above 2.0" and that
// operator is applied to both here; `atCreatinineOperatorBoundary` fires at exactly 2.0 and the result
// states what the other rendering would give.
//
// **THE HEMATOCRIT TERM IS CONTINUOUS AND ONE-SIDED**: 0.2 for EACH percentage point below 36, and NOTHING
// above 36. It is not a threshold flag - a hematocrit of 26 adds 2.0, as much as the creatinine term.
//
// **THE ORIGINAL WAS DERIVED IN ELECTIVE SURGERY AND HAS NO EMERGENCY TERM.** ACEF II adds emergency
// surgery, worth 3, the largest single add-on in either version. For an emergency case `acefOutsideDerivation`
// is true and the ACEF value is outside the setting it was built for - report that.

import * as A from '../../lib/acef-v595.js';

export default [
  {
    id: 'acef',
    summary: `The ACEF and ACEF II RISK SCORES for cardiac surgery (Ranucci and colleagues 2009 and 2018), both returned from the same inputs. ACEF = AGE DIVIDED BY EJECTION FRACTION + ${A.ACEF_CREATININE_POINTS} if serum creatinine is above ${A.CREATININE_THRESHOLD} mg/dL. ACEF II = the same ratio + ${A.ACEF2_CREATININE_POINTS} for that creatinine criterion + ${A.ACEF2_EMERGENCY_POINTS} for emergency surgery + ${A.HCT_POINTS_PER_POINT_BELOW} for EACH percentage point of hematocrit below ${A.HCT_REFERENCE}. **THIS IS A RATIO, NOT A SUM OF POINTS**: the backbone is dimensionless, there is NO MAXIMUM SCORE and no point ceiling, so never report an "x of y" total or invent bands. **EJECTION FRACTION IS A DENOMINATOR, SO THE SCORE IS NONLINEAR IN IT** - halving the ejection fraction DOUBLES the score, and at age 70 an ejection fraction of 30 gives 2.33 against 1.17 for 60. No additive score behaves this way, and treating the ejection fraction as a scored item badly misjudges a poor ventricle. **THE CREATININE WEIGHT DOUBLES BETWEEN VERSIONS**, so a value CANNOT be carried between them. **ONE REPRODUCTION OF THE ORIGINAL PRINTS THE CREATININE OPERATOR DIFFERENTLY** - "${A.CREATININE_THRESHOLD} or more" against "above ${A.CREATININE_THRESHOLD}", differing only at exactly ${A.CREATININE_THRESHOLD}; ACEF II is consistently "above", that operator is applied to both, and \`atCreatinineOperatorBoundary\` fires at exactly ${A.CREATININE_THRESHOLD} with the alternative stated. **THE HEMATOCRIT TERM IS CONTINUOUS AND ONE-SIDED**: nothing above ${A.HCT_REFERENCE}, and a hematocrit of 26 adds 2.0 - as much as the creatinine term. It is NOT a threshold flag. **THE ORIGINAL WAS DERIVED IN ELECTIVE CARDIAC SURGERY AND HAS NO EMERGENCY TERM**; ACEF II adds emergency surgery as its largest single add-on, and for an emergency case \`acefOutsideDerivation\` is true, meaning the ACEF value is outside the setting it was built for. These are GROUP-LEVEL PREOPERATIVE MORTALITY estimates. They do NOT decide whether to operate, do NOT choose between surgery, percutaneous intervention and medical therapy, and do NOT select an operation. **A HIGH SCORE IS NOT A REASON TO DECLINE SURGERY** - for many of these patients the untreated course is worse, and these scores say nothing about it. They do NOT estimate stroke, renal failure, length of stay, or any outcome other than the mortality they were built for.`,
    compute: A.acef,
    fields: [
      { dom: 'acef-age', arg: 'age', kind: 'number', unit: 'years', required: true, label: 'Age. The NUMERATOR of the ratio.' },
      { dom: 'acef-ef', arg: 'ejectionFraction', kind: 'number', unit: '%', required: true, label: 'Left ventricular ejection fraction. THE DENOMINATOR, not a scored item: halving it doubles the score.' },
      { dom: 'acef-creatinine', arg: 'creatinine', kind: 'number', unit: 'mg/dL', required: true, label: `Serum creatinine. Above ${A.CREATININE_THRESHOLD} adds ${A.ACEF_CREATININE_POINTS} to ACEF and ${A.ACEF2_CREATININE_POINTS} to ACEF II. Exactly ${A.CREATININE_THRESHOLD} is the one value where published renderings disagree.` },
      { dom: 'acef-emergency', arg: 'emergency', kind: 'enum', values: ['no', 'yes'], required: true, label: `Emergency surgery. Adds ${A.ACEF2_EMERGENCY_POINTS} to ACEF II ONLY - the original has no emergency term and was derived in elective surgery.` },
      { dom: 'acef-hematocrit', arg: 'hematocrit', kind: 'number', unit: '%', required: true, label: `Hematocrit. ACEF II adds ${A.HCT_POINTS_PER_POINT_BELOW} for EACH point below ${A.HCT_REFERENCE} and nothing above it. Continuous, not a threshold flag.` },
    ],
  },
];
