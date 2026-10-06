// spec-v183 MCP wave 14: adapters for the four lib/peds-growth-v141.js pediatric
// growth / developmental-age tiles. dom keys mirror views/group-v141.js; arg
// names mirror the lib signatures. Sex / measure axes are enums; ages, BMI, and
// heights are numbers. peds-bmi-percentile also offers an optional weight/height
// unit-toggle path in the browser; the pure function takes BMI directly, so the
// adapter exposes BMI (the unit-toggle inputs are a render-time convenience the
// compute function never sees — the warfarin height/weight precedent).

import * as F from '../../lib/peds-growth-v141.js';

export default [
  {
    id: 'peds-bmi-percentile',
    summary: 'CDC 2000 BMI-for-age percentile (LMS method): from sex, age, and BMI → percentile, z-score, and the underweight / healthy / overweight / obese band.',
    compute: F.pedsBmiPercentile,
    fields: [
      { dom: 'bm-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], label: 'Sex' },
      { dom: 'bm-age', arg: 'ageYears', kind: 'number', label: 'Age (years, 2–20)' },
      { dom: 'bm-bmi', arg: 'bmi', kind: 'number', label: 'BMI (kg/m²)' },
    ],
  },
  {
    id: 'who-growth-zscore',
    summary: 'Gives WHO 2006 growth z-scores. Weight-for-age, length-for-age or head circumference-for-age (0–24 months), or weight-for-length/height (to 60 months), with the 0.7 cm lying/standing rule and no weight z with edema.',
    compute: F.whoGrowthZscore,
    fields: [
      { dom: 'wz-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], label: 'Sex' },
      { dom: 'wz-measure', arg: 'measure', kind: 'enum', values: ['weight', 'length', 'wfl', 'hc'], label: 'Measurement (wfl = weight-for-length/height, hc = head circumference)' },
      { dom: 'wz-age', arg: 'ageMonths', kind: 'number', label: 'Age (months, 0–24; to 60 for wfl)' },
      { dom: 'wz-val', arg: 'value', kind: 'number', label: 'Measured value (kg or cm; the weight for wfl)' },
      { dom: 'wz-len', arg: 'lengthCm', kind: 'number', label: 'Length or height (cm, wfl only)', required: false },
      { dom: 'wz-pos', arg: 'position', kind: 'enum', values: ['lying', 'standing'], label: 'Length measured lying or standing (length and wfl)', required: false },
      { dom: 'wz-edema', arg: 'edema', kind: 'enum', values: ['no', 'yes'], label: 'Edema of both feet (weight and wfl)', required: false },
    ],
  },
  {
    id: 'mid-parental-height',
    summary: 'Tanner mid-parental target height: (mother + father ± 13 cm)/2 with a ± 8.5 cm expected range.',
    compute: F.midParentalHeight,
    fields: [
      { dom: 'mp-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], label: 'Child sex' },
      { dom: 'mp-mom', arg: 'motherCm', kind: 'number', label: "Mother's height (cm)" },
      { dom: 'mp-dad', arg: 'fatherCm', kind: 'number', label: "Father's height (cm)" },
    ],
  },
  {
    id: 'corrected-age',
    summary: 'AAP corrected gestational age: chronological age minus the weeks of prematurity (before 37 weeks), used until ~2 years.',
    compute: F.correctedAge,
    fields: [
      { dom: 'ca-age', arg: 'chronoMonths', kind: 'number', label: 'Chronological age (months)' },
      { dom: 'ca-ga', arg: 'gaWeeks', kind: 'number', label: 'Gestational age at birth (weeks)' },
    ],
  },
];
