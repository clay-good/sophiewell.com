// spec-v183 MCP wave: adapters for the four anthropometric / metabolic estimators
// in lib/anthro-v238.js — relative fat mass (RFM), the body roundness index (BRI),
// the US Navy (Hodgdon-Beckett) body-fat estimate, and the estimated glucose
// disposal rate (eGDR). dom keys mirror views/group-v238.js; sex is an enum and
// the eGDR hypertension flag is a boolean.

import * as F from '../../lib/anthro-v238.js';

export default [
  {
    id: 'relative-fat-mass',
    summary: 'Relative fat mass (Woolcott & Bergman, Sci Rep 2018) = 64 - 20 x (height / waist circumference) + 12 x sex (female = 1, male = 0); height and waist in the same units, estimating whole-body fat %.',
    compute: F.relativeFatMass,
    fields: [
      { dom: 'rfm-height', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm or in' },
      { dom: 'rfm-waist', arg: 'waist', kind: 'number', required: true, label: 'Waist circumference (same units)' },
      { dom: 'rfm-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'body-roundness-index',
    summary: 'Body roundness index (Thomas DM, et al. Obesity 2013) = 364.2 - 365.5 x sqrt(1 - ((waist / (2·pi)) / (0.5 x height))^2), waist and height in the same units; higher = greater central adiposity.',
    compute: F.bodyRoundnessIndex,
    fields: [
      { dom: 'bri-waist', arg: 'waist', kind: 'number', required: true, label: 'Waist circumference', unit: 'cm' },
      { dom: 'bri-height', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
    ],
  },
  {
    id: 'navy-body-fat',
    summary: 'US Navy body-fat estimate (Hodgdon & Beckett 1984): a circumference-based body-fat percentage using neck, waist, and height (women add hip), with all measurements in inches.',
    compute: F.navyBodyFat,
    fields: [
      { dom: 'navy-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
      { dom: 'navy-height', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'in' },
      { dom: 'navy-neck', arg: 'neck', kind: 'number', required: true, label: 'Neck', unit: 'in' },
      { dom: 'navy-waist', arg: 'waist', kind: 'number', required: true, label: 'Waist', unit: 'in' },
      { dom: 'navy-hip', arg: 'hip', kind: 'number', required: false, label: 'Hip (women only)', unit: 'in' },
    ],
  },
  {
    id: 'egdr',
    summary: 'Estimated glucose disposal rate (Williams KV, et al. Diabetes Care 2000) = 21.158 - (0.09 x waist cm) - (3.407 x hypertension) - (0.551 x HbA1c %); lower = greater insulin resistance.',
    compute: F.egdr,
    fields: [
      { dom: 'egdr-waist', arg: 'waist', kind: 'number', required: true, label: 'Waist circumference', unit: 'cm' },
      { dom: 'egdr-htn', arg: 'hypertension', kind: 'bool', required: true, label: 'Hypertension (treated or BP >= 140/90)' },
      { dom: 'egdr-a1c', arg: 'a1c', kind: 'number', required: true, label: 'HbA1c', unit: '%' },
    ],
  },
];
