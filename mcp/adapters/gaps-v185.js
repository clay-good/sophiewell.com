// spec-v183 MCP wave 9: adapters for lib/gaps-v185.js — the "advanced bedside
// quantitation" gap-fillers. Seven of the eight functions are flat dom→arg→kind
// numeric/enum/bool computations and are exposed here; `rosendaal-ttr` is NOT
// adapted because its `series` input is a multi-line textarea of "date INR" rows
// (a list of item-values, not a flat scalar) — it stays in the ledger's
// not-yet-adapted set. dom keys mirror views/group-v185.js and META.example.

import * as F from '../../lib/gaps-v185.js';

export default [
  {
    id: 'fick-cardiac-output',
    summary: 'Cardiac output and cardiac index by the Fick principle: VO₂ ÷ (arteriovenous O₂ content difference), with VO₂ either measured or estimated (LaFarge/Miettinen) from age, sex, and heart rate.',
    compute: F.fickCardiacOutput,
    fields: [
      { dom: 'fick-method', arg: 'method', kind: 'enum', values: ['measured', 'estimated'], required: false, label: 'VO₂ source' },
      { dom: 'fick-vo2', arg: 'vo2', kind: 'number', required: false, label: 'Measured VO₂', unit: 'mL/min' },
      { dom: 'fick-age', arg: 'age', kind: 'number', required: false, label: 'Age (for estimate)', unit: 'years' },
      { dom: 'fick-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: false, label: 'Sex (for estimate)' },
      { dom: 'fick-hr', arg: 'hr', kind: 'number', required: false, label: 'Heart rate (for estimate)', unit: 'bpm' },
      { dom: 'fick-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'fick-sao2', arg: 'sao2', kind: 'number', required: true, label: 'Arterial O₂ saturation SaO₂', unit: '%' },
      { dom: 'fick-svo2', arg: 'svo2', kind: 'number', required: true, label: 'Mixed-venous O₂ saturation SvO₂', unit: '%' },
      { dom: 'fick-bsa', arg: 'bsa', kind: 'number', required: true, label: 'Body surface area', unit: 'm²' },
    ],
  },
  {
    id: 'gorlin',
    summary: 'Gorlin valve-area equation for aortic or mitral stenosis: flow ÷ (constant × √mean gradient), using the systolic ejection period (aortic) or diastolic filling period (mitral).',
    compute: F.gorlin,
    fields: [
      { dom: 'gorlin-valve', arg: 'valve', kind: 'enum', values: ['aortic', 'mitral'], required: true, label: 'Valve' },
      { dom: 'gorlin-co', arg: 'co', kind: 'number', required: true, label: 'Cardiac output', unit: 'L/min' },
      { dom: 'gorlin-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'gorlin-period', arg: 'period', kind: 'number', required: true, label: 'Ejection/filling period', unit: 's per beat' },
      { dom: 'gorlin-grad', arg: 'grad', kind: 'number', required: true, label: 'Mean pressure gradient', unit: 'mmHg' },
    ],
  },
  {
    id: 'qp-qs',
    summary: 'Pulmonary-to-systemic flow ratio (Qp:Qs) for intracardiac shunts: (SaO₂ − MvO₂) ÷ (PvO₂ − PaO₂), from the four saturations of a shunt run.',
    compute: F.qpQs,
    fields: [
      { dom: 'qpqs-sao2', arg: 'sao2', kind: 'number', required: true, label: 'Systemic-arterial SaO₂', unit: '%' },
      { dom: 'qpqs-mvo2', arg: 'mvo2', kind: 'number', required: true, label: 'Mixed-venous MvO₂', unit: '%' },
      { dom: 'qpqs-pvo2', arg: 'pvo2', kind: 'number', required: false, label: 'Pulmonary-vein PvO₂ (default 98)', unit: '%' },
      { dom: 'qpqs-pao2', arg: 'pao2', kind: 'number', required: true, label: 'Pulmonary-artery PaO₂', unit: '%' },
    ],
  },
  {
    id: 'lvot-stroke-volume',
    summary: 'Doppler stroke volume and cardiac output from the LVOT: cross-sectional area (from diameter) × velocity-time integral, indexed to BSA.',
    compute: F.lvotStrokeVolume,
    fields: [
      { dom: 'lvot-d', arg: 'd', kind: 'number', required: true, label: 'LVOT diameter', unit: 'cm' },
      { dom: 'lvot-vti', arg: 'vti', kind: 'number', required: true, label: 'LVOT VTI', unit: 'cm' },
      { dom: 'lvot-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'lvot-bsa', arg: 'bsa', kind: 'number', required: true, label: 'Body surface area', unit: 'm²' },
    ],
  },
  {
    id: 'vte-bleed',
    summary: 'VTE-BLEED score for major bleeding risk on extended anticoagulation after venous thromboembolism; ≥ 2 points flags elevated risk.',
    compute: F.vteBleed,
    fields: [
      { dom: 'vte-cancer', arg: 'cancer', kind: 'bool', required: false, label: 'Active cancer (2)' },
      { dom: 'vte-maleHtn', arg: 'maleHtn', kind: 'bool', required: false, label: 'Male with uncontrolled hypertension (1)' },
      { dom: 'vte-anemia', arg: 'anemia', kind: 'bool', required: false, label: 'Anemia (1.5)' },
      { dom: 'vte-bleeding', arg: 'bleeding', kind: 'bool', required: false, label: 'History of bleeding (1.5)' },
      { dom: 'vte-age60', arg: 'age60', kind: 'bool', required: false, label: 'Age ≥ 60 (1.5)' },
      { dom: 'vte-renal', arg: 'renal', kind: 'bool', required: false, label: 'Renal dysfunction CrCl 30–60 (1.5)' },
    ],
  },
  {
    id: 'matsuda-index',
    summary: 'Matsuda insulin-sensitivity index from an OGTT: 10000 ÷ √(fasting glucose × fasting insulin × mean OGTT glucose × mean OGTT insulin).',
    compute: F.matsudaIndex,
    fields: [
      { dom: 'matsuda-g0', arg: 'g0', kind: 'number', required: true, label: 'Fasting glucose', unit: 'mg/dL' },
      { dom: 'matsuda-i0', arg: 'i0', kind: 'number', required: true, label: 'Fasting insulin', unit: 'µU/mL' },
      { dom: 'matsuda-gmean', arg: 'gMean', kind: 'number', required: true, label: 'Mean OGTT glucose', unit: 'mg/dL' },
      { dom: 'matsuda-imean', arg: 'iMean', kind: 'number', required: true, label: 'Mean OGTT insulin', unit: 'µU/mL' },
    ],
  },
  {
    id: 'lean-body-weight',
    summary: 'Lean body weight (Boer formula, sex-specific) from total body weight and height — the dosing weight for drugs distributed to lean mass.',
    compute: F.leanBodyWeight,
    fields: [
      { dom: 'lbw-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
      { dom: 'lbw-weight', arg: 'weight', kind: 'number', required: true, label: 'Total body weight', unit: 'kg' },
      { dom: 'lbw-height', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
    ],
  },
];
