// spec-v183 MCP wave 30: adapters for the four nutrition / maternal-fetal
// instruments in lib/nutrition-maternal-v208.js — the neonatal ponderal index,
// the sFlt-1/PlGF preeclampsia biomarker ratio, the GLIM malnutrition criteria,
// and the Subjective Global Assessment (SGA). dom keys mirror
// views/group-v208.js. sFlt-1/PlGF phase, GLIM's weight-loss and low-BMI
// severities, and the SGA rating are enums mirroring the renderer selects.

import * as F from '../../lib/nutrition-maternal-v208.js';

export default [
  {
    id: 'ponderal-index',
    summary: 'Neonatal ponderal index: 100 × birth weight (g) / length (cm)³; a value below ~2.0 marks disproportionate wasting (asymmetric intrauterine growth restriction).',
    compute: F.ponderalIndex,
    fields: [
      { dom: 'pi-weight', arg: 'weightG', kind: 'number', required: true, label: 'Birth weight', unit: 'g' },
      { dom: 'pi-length', arg: 'lengthCm', kind: 'number', required: true, label: 'Length', unit: 'cm' },
    ],
  },
  {
    id: 'sflt1-plgf',
    summary: 'sFlt-1/PlGF ratio (Zeisler 2016 PROGNOSIS; Verlohren 2014): a Roche Elecsys biomarker for suspected preeclampsia; ≤ 38 rules it out for the next week, with phase-specific rule-in thresholds (≥ 85 early, ≥ 110 late).',
    compute: F.sflt1Plgf,
    fields: [
      { dom: 'sflt-ratio', arg: 'ratio', kind: 'number', required: true, label: 'sFlt-1/PlGF ratio' },
      { dom: 'sflt-phase', arg: 'phase', kind: 'enum', values: ['early', 'late'], required: true, label: 'Gestational phase (early < 34 wk or late ≥ 34 wk)' },
    ],
  },
  {
    id: 'glim-malnutrition',
    summary: 'GLIM criteria (Cederholm 2019): malnutrition requires ≥ 1 phenotypic (weight loss, low BMI, reduced muscle mass) and ≥ 1 etiologic (reduced intake, inflammation) criterion; severity is staged on the phenotypic criteria.',
    compute: F.glim,
    fields: [
      { dom: 'glim-wl', arg: 'weightLoss', kind: 'enum', values: ['none', 'moderate', 'severe'], required: false, label: 'Phenotypic — non-volitional weight loss' },
      { dom: 'glim-bmi', arg: 'lowBmi', kind: 'enum', values: ['none', 'moderate', 'severe'], required: false, label: 'Phenotypic — low BMI' },
      { dom: 'glim-muscle', arg: 'reducedMuscle', kind: 'bool', required: false, label: 'Phenotypic — reduced muscle mass (validated measure)' },
      { dom: 'glim-intake', arg: 'reducedIntake', kind: 'bool', required: false, label: 'Etiologic — reduced intake / assimilation' },
      { dom: 'glim-inflam', arg: 'inflammation', kind: 'bool', required: false, label: 'Etiologic — inflammation / disease burden' },
    ],
  },
  {
    id: 'sga-nutrition',
    summary: 'Subjective Global Assessment (Detsky 1987): the reference bedside malnutrition assessment, a structured clinician gestalt over history and exam features yielding an overall A (well nourished), B (moderate/suspected), or C (severe) rating.',
    compute: F.sga,
    fields: [
      { dom: 'sga-rating', arg: 'rating', kind: 'enum', values: ['A', 'B', 'C'], required: true, label: 'Overall SGA rating' },
    ],
  },
];
