// spec-v837 MCP adapter: MASLD / MetALD nomenclature in lib/masld-criteria-v837.js.
// The dom keys mirror the browser renderer (views/group-v837.js) and
// META['masld-criteria'].example. alcoholGramsPerWeek is per WEEK, matching the published
// bands. Clinical domain.

import { masldCriteria } from '../../lib/masld-criteria-v837.js';

export default [
  {
    id: 'masld-criteria',
    summary: 'Applies the 2023 steatotic liver disease nomenclature. MASLD is hepatic steatosis with at least one of five cardiometabolic criteria; MetALD is the same with 140-350 g/week of alcohol in females or 210-420 in males; above that is ALD. This is a POSITIVE diagnosis, not one of exclusion - drinking above the threshold does not remove it. The BMI cut is ancestry-specific and the HDL cut sex-specific.',
    compute: masldCriteria,
    fields: [
      { dom: 'masld-steatosis', arg: 'hepaticSteatosis', kind: 'boolean', required: false, label: 'Hepatic steatosis present' },
      { dom: 'masld-othercause', arg: 'otherCause', kind: 'boolean', required: false, label: 'Specific other cause identified' },
      { dom: 'masld-sex', arg: 'sex', kind: 'enum', required: false, label: 'Sex', values: ['female', 'male'] },
      { dom: 'masld-ancestry', arg: 'ancestry', kind: 'enum', required: false, label: 'Ancestry for BMI and waist cuts', values: ['european', 'south-asian-chinese', 'japanese'] },
      { dom: 'masld-bmi', arg: 'bmi', kind: 'number', required: false, label: 'Body mass index' },
      { dom: 'masld-waist', arg: 'waistCm', kind: 'number', required: false, label: 'Waist circumference, cm' },
      { dom: 'masld-glucose', arg: 'fastingGlucose', kind: 'number', required: false, label: 'Fasting glucose, mg/dL' },
      { dom: 'masld-hba1c', arg: 'hba1c', kind: 'number', required: false, label: 'HbA1c, percent' },
      { dom: 'masld-t2d', arg: 'type2Diabetes', kind: 'boolean', required: false, label: 'Type 2 diabetes or its treatment' },
      { dom: 'masld-sbp', arg: 'systolic', kind: 'number', required: false, label: 'Systolic blood pressure, mmHg' },
      { dom: 'masld-dbp', arg: 'diastolic', kind: 'number', required: false, label: 'Diastolic blood pressure, mmHg' },
      { dom: 'masld-antihtn', arg: 'antihypertensive', kind: 'boolean', required: false, label: 'Antihypertensive treatment' },
      { dom: 'masld-trig', arg: 'triglycerides', kind: 'number', required: false, label: 'Triglycerides, mg/dL' },
      { dom: 'masld-hdl', arg: 'hdl', kind: 'number', required: false, label: 'HDL cholesterol, mg/dL' },
      { dom: 'masld-lipid', arg: 'lipidLowering', kind: 'boolean', required: false, label: 'Lipid-lowering treatment' },
      { dom: 'masld-alcohol', arg: 'alcoholGramsPerWeek', kind: 'number', required: false, label: 'Alcohol, grams per WEEK' },
    ],
  },
];
