// spec-v183 MCP wave 54: adapters for lib/clinical-v7.js - nursing-shift math
// (urine output rate, fluid balance, burn UOP target), transfusion math (EBV /
// MABL, RhIG dose, pediatric transfusion volume), and infusion/dosing math
// (corrected phenytoin, GIR, K/Mg/Ca replacement, IV osmolarity, carb bolus).

import * as F from '../../lib/clinical-v7.js';

export default [
  {
    id: 'urine-output',
    summary: 'Weight-indexed urine output = volume/(interval*weight) in mL/kg/hr; <0.5 flags oliguria.',
    compute: F.urineOutput,
    fields: [
      { dom: 'uo-vol', arg: 'volumeMl', kind: 'number', required: true, label: 'Total urine volume', unit: 'mL' },
      { dom: 'uo-int', arg: 'intervalHr', kind: 'number', required: true, label: 'Collection interval', unit: 'hr' },
      { dom: 'uo-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
    ],
  },
  {
    id: 'ebv-mabl',
    summary: 'Estimated blood volume (weight*EBV factor) and maximum allowable blood loss from starting and minimum acceptable hematocrit.',
    compute: F.ebvMabl,
    fields: [
      { dom: 'em-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'em-factor', arg: 'ebvFactor', kind: 'enum', values: ['100', '90', '80', '75', '65'], required: true, label: 'Patient type (EBV factor, mL/kg)', to: Number },
      { dom: 'em-start', arg: 'startHct', kind: 'number', required: true, label: 'Starting hematocrit', unit: '%' },
      { dom: 'em-min', arg: 'minHct', kind: 'number', required: true, label: 'Minimum acceptable hematocrit', unit: '%' },
    ],
  },
  {
    id: 'corrected-phenytoin',
    summary: 'Albumin-corrected total phenytoin (Sheiner-Tozer) = measured/(0.2*albumin + 0.1); ESRD uses 0.1 factor.',
    compute: F.correctedPhenytoin,
    fields: [
      { dom: 'cp-meas', arg: 'measured', kind: 'number', required: true, label: 'Measured total phenytoin', unit: 'ug/mL' },
      { dom: 'cp-alb', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin', unit: 'g/dL' },
    ],
  },
  {
    id: 'burn-uop-target',
    summary: 'Target hourly urine output for burn resuscitation from weight, with pediatric and electrical-injury/pigmenturia adjustments.',
    compute: F.burnUopTarget,
    fields: [
      { dom: 'bu-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
    ],
  },
  {
    id: 'fluid-balance',
    summary: 'Net fluid balance = intake - output, optionally as percent of body weight (>=10% flags fluid overload).',
    compute: F.fluidBalance,
    fields: [
      { dom: 'fb-in', arg: 'intakeMl', kind: 'number', required: true, label: 'Total intake', unit: 'mL' },
      { dom: 'fb-out', arg: 'outputMl', kind: 'number', required: true, label: 'Total output', unit: 'mL' },
      { dom: 'fb-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
    ],
  },
  {
    id: 'gir',
    summary: 'Glucose infusion rate: GIR (mg/kg/min) = dextrose % x rate (mL/hr) / (6 x weight kg); banded against neonatal targets (typical 4-8 mg/kg/min).',
    compute: F.gir,
    fields: [
      { dom: 'gir-dex', arg: 'dextrosePct', kind: 'number', required: true, label: 'Dextrose concentration', unit: '%' },
      { dom: 'gir-rate', arg: 'rateMlHr', kind: 'number', required: true, label: 'Infusion rate', unit: 'mL/hr' },
      { dom: 'gir-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
    ],
  },
  {
    id: 'potassium-deficit',
    summary: 'Total-body potassium deficit estimate (Kruse-Carlson heuristic, ~10 mEq per 0.1 mEq/L below target scaled by weight) from serum K, weight, and target K.',
    compute: F.potassiumDeficit,
    fields: [
      { dom: 'kd-k', arg: 'serumK', kind: 'number', required: true, label: 'Serum potassium', unit: 'mEq/L' },
      { dom: 'kd-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'kd-target', arg: 'targetK', kind: 'number', required: true, label: 'Target potassium', unit: 'mEq/L' },
    ],
  },
  {
    id: 'magnesium-replacement',
    summary: 'Banded IV magnesium sulfate repletion (Tong-Rude): mild 1-2 g, moderate 2-4 g, severe 4-8 g, keyed to the entered serum magnesium and severity band.',
    compute: F.magnesiumReplacement,
    fields: [
      { dom: 'mg-serum', arg: 'serumMg', kind: 'number', required: true, label: 'Serum magnesium', unit: 'mg/dL' },
      { dom: 'mg-sev', arg: 'severity', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Severity', to: Number },
    ],
  },
  {
    id: 'calcium-replacement',
    summary: 'IV calcium product math (AHA ACLS 2020, USP labeling): elemental calcium (mg and mEq) delivered by a gluconate or chloride dose, the equivalent dose of the other salt, and indication text.',
    compute: F.calciumReplacement,
    fields: [
      { dom: 'cap-prod', arg: 'product', kind: 'enum', values: ['gluconate', 'chloride'], required: true, label: 'Calcium product' },
      { dom: 'cap-dose', arg: 'doseGrams', kind: 'number', required: true, label: 'Dose (g of salt)', unit: 'g' },
      { dom: 'cap-ind', arg: 'indication', kind: 'enum', values: ['hyperkalemia', 'hypocalcemia', 'citrate'], required: true, label: 'Indication' },
    ],
  },
  {
    id: 'iv-osmolarity',
    summary: 'Estimated IV/PN solution osmolarity (ASPEN 2014): dextrose% x 50 + amino acid% x 100 + (Na + K mEq/L) x 2, with a central-line threshold band.',
    compute: F.ivOsmolarity,
    fields: [
      { dom: 'io-dex', arg: 'dextrosePct', kind: 'number', required: true, label: 'Dextrose', unit: '%' },
      { dom: 'io-aa', arg: 'aminoAcidPct', kind: 'number', required: true, label: 'Amino acids', unit: '%' },
      { dom: 'io-na', arg: 'naMeqL', kind: 'number', required: true, label: 'Sodium additives', unit: 'mEq/L' },
      { dom: 'io-k', arg: 'kMeqL', kind: 'number', required: true, label: 'Potassium additives', unit: 'mEq/L' },
    ],
  },
  {
    id: 'carb-insulin-bolus',
    summary: 'Carb-counting insulin bolus (ADA Standards of Care): meal bolus = carbs / IC ratio, correction = (current - target) / ISF (floored at 0), and the total.',
    compute: F.carbInsulinBolus,
    fields: [
      { dom: 'ci-carbs', arg: 'carbsG', kind: 'number', required: true, label: 'Carbohydrates', unit: 'g' },
      { dom: 'ci-ic', arg: 'icRatio', kind: 'number', required: true, label: 'Insulin-to-carb ratio (1 unit : N g)' },
      { dom: 'ci-isf', arg: 'isf', kind: 'number', required: true, label: 'Correction factor / ISF', unit: 'mg/dL per unit' },
      { dom: 'ci-cur', arg: 'currentGlucose', kind: 'number', required: true, label: 'Current glucose', unit: 'mg/dL' },
      { dom: 'ci-tgt', arg: 'targetGlucose', kind: 'number', required: true, label: 'Target glucose', unit: 'mg/dL' },
    ],
  },
  {
    id: 'rhig-dose',
    summary: 'RhIG (anti-D) dosing after fetomaternal hemorrhage: FMH mL = maternal blood volume x Kleihauer-Betke fetal-cell fraction, then number of standard 300 ug RhoGAM vials per the AABB rounding rule.',
    compute: F.rhigDose,
    fields: [
      { dom: 'rh-bv', arg: 'maternalBloodVolumeMl', kind: 'number', required: true, label: 'Maternal blood volume (mL)', unit: 'mL' },
      { dom: 'rh-kb', arg: 'fetalCellPct', kind: 'number', required: true, label: 'Fetal cells on Kleihauer-Betke (%)', unit: '%' },
    ],
  },
  {
    id: 'peds-transfusion-volume',
    summary: 'Pediatric PRBC transfusion volume for a desired hemoglobin rise: volume mL = weight x Hb rise x factor scaled by product hematocrit, also reported as mL/kg.',
    compute: F.pedsTransfusionVolume,
    fields: [
      { dom: 'pt-wt', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg (canonical)' },
      { dom: 'pt-rise', arg: 'hbRise', kind: 'number', required: true, label: 'Desired hemoglobin rise (g/dL)', unit: 'g/dL' },
      { dom: 'pt-hct', arg: 'productHctPct', kind: 'enum', values: ['60', '55', '70'], required: true, label: 'Product hematocrit (%)', to: Number },
    ],
  },
];
