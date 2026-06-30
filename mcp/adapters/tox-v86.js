// spec-v183: adapters for the three lib/tox-v86.js toxicology decision rules
// (serotonin-toxicity, salicylate-toxicity, toxic-alcohol). dom keys mirror the
// views/group-v12.js renderer and META.example.fields exactly; arg names mirror
// the lib function signatures. No coefficient or threshold is re-typed.

import * as T from '../../lib/tox-v86.js';

export default [
  {
    id: 'serotonin-toxicity',
    summary: 'Hunter Serotonin Toxicity Criteria (Dunkley 2003): a five-branch decision rule for serotonin toxicity in a patient on a serotonergic agent.',
    compute: T.serotoninToxicity,
    fields: [
      { dom: 'st-agent', arg: 'serotonergicAgent', kind: 'bool', required: true, label: 'Patient has taken a serotonergic agent (required precondition)' },
      { dom: 'st-spont-clonus', arg: 'spontaneousClonus', kind: 'bool', label: 'Spontaneous clonus' },
      { dom: 'st-induc-clonus', arg: 'inducibleClonus', kind: 'bool', label: 'Inducible clonus' },
      { dom: 'st-ocular-clonus', arg: 'ocularClonus', kind: 'bool', label: 'Ocular clonus' },
      { dom: 'st-agitation', arg: 'agitation', kind: 'bool', label: 'Agitation' },
      { dom: 'st-diaphoresis', arg: 'diaphoresis', kind: 'bool', label: 'Diaphoresis' },
      { dom: 'st-tremor', arg: 'tremor', kind: 'bool', label: 'Tremor' },
      { dom: 'st-hyperreflexia', arg: 'hyperreflexia', kind: 'bool', label: 'Hyperreflexia' },
      { dom: 'st-hypertonia', arg: 'hypertonia', kind: 'bool', label: 'Hypertonia' },
      { dom: 'st-temp', arg: 'tempOver38', kind: 'bool', label: 'Temperature over 38 C' },
    ],
  },
  {
    id: 'salicylate-toxicity',
    summary: 'Salicylate poisoning with the EXTRIP (Juurlink 2015) hemodialysis indication: names which extracorporeal-treatment criterion is met on the entered data.',
    compute: T.salicylateToxicity,
    fields: [
      { dom: 'sal-level', arg: 'level', kind: 'number', required: true, label: 'Serum salicylate level', unit: 'mg/dL or mmol/L' },
      { dom: 'sal-unit', arg: 'unit', kind: 'enum', values: ['mgdl', 'mmoll'], label: 'Level units' },
      { dom: 'sal-type', arg: 'poisoningType', kind: 'enum', values: ['acute', 'chronic'], label: 'Poisoning type' },
      { dom: 'sal-ph', arg: 'pH', kind: 'number', label: 'Arterial pH (optional)' },
      { dom: 'sal-ams', arg: 'alteredMentalStatus', kind: 'bool', label: 'Altered mental status' },
      { dom: 'sal-hypox', arg: 'hypoxemia', kind: 'bool', label: 'New hypoxemia requiring oxygen (ARDS picture)' },
      { dom: 'sal-ckd', arg: 'impairedKidney', kind: 'bool', label: 'Impaired kidney function' },
      { dom: 'sal-failing', arg: 'standardTherapyFailing', kind: 'bool', label: 'Standard therapy failing or unavailable' },
    ],
  },
  {
    id: 'toxic-alcohol',
    summary: 'Toxic-alcohol osmolar gap (Smithline 1976) with the AACT fomepizole indication: calculated osmolality, signed osmolar gap, and which indication limb is met.',
    compute: T.toxicAlcohol,
    fields: [
      { dom: 'ta-osm', arg: 'measuredOsm', kind: 'number', required: true, label: 'Measured serum osmolality', unit: 'mOsm/kg' },
      { dom: 'ta-na', arg: 'sodium', kind: 'number', required: true, label: 'Serum sodium', unit: 'mEq/L' },
      { dom: 'ta-glu', arg: 'glucose', kind: 'number', label: 'Glucose', unit: 'mg/dL' },
      { dom: 'ta-bun', arg: 'bun', kind: 'number', label: 'BUN', unit: 'mg/dL' },
      { dom: 'ta-etoh', arg: 'ethanol', kind: 'number', label: 'Serum ethanol (optional)', unit: 'mg/dL' },
      { dom: 'ta-ph', arg: 'pH', kind: 'number', label: 'Arterial pH (optional)' },
      { dom: 'ta-bicarb', arg: 'bicarbonate', kind: 'number', label: 'Serum bicarbonate (optional)', unit: 'mEq/L' },
      { dom: 'ta-level', arg: 'knownLevel', kind: 'number', label: 'Documented methanol / ethylene-glycol level (optional)', unit: 'mg/dL' },
      { dom: 'ta-recent', arg: 'recentIngestion', kind: 'bool', label: 'Recent-ingestion history' },
      { dom: 'ta-suspicion', arg: 'strongSuspicion', kind: 'bool', label: 'Strong clinical suspicion' },
    ],
  },
];
