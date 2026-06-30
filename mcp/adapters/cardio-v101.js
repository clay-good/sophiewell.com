// spec-v183 MCP wave 4: adapters for the five lib/cardio-v101.js atrial-
// fibrillation stroke-risk and QT-prolongation instruments. dom keys mirror
// views/group-v26.js and META.example.fields; arg names mirror the lib
// signatures (chf, hypertension, age75, …). The checkbox criteria are bools; the
// age-banded scores take a numeric age; tisdale's drug count is an enum.

import * as F from '../../lib/cardio-v101.js';

export default [
  {
    id: 'chads2',
    summary: 'CHADS2 stroke-risk score (Gage 2001): CHF (1) + hypertension (1) + age ≥ 75 (1) + diabetes (1) + prior stroke/TIA (2); total 0-6 mapped to the adjusted annual ischemic-stroke rate.',
    compute: F.chads2,
    fields: [
      { dom: 'chads2-chf', arg: 'chf', kind: 'bool', label: 'Congestive heart failure' },
      { dom: 'chads2-htn', arg: 'hypertension', kind: 'bool', label: 'Hypertension' },
      { dom: 'chads2-age', arg: 'age75', kind: 'bool', label: 'Age ≥ 75' },
      { dom: 'chads2-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
      { dom: 'chads2-stroke', arg: 'stroke', kind: 'bool', label: 'Prior stroke or TIA' },
    ],
  },
  {
    id: 'cha2ds2-va',
    summary: 'CHA2DS2-VA (2024 ESC, sex point removed): CHF/LV dysfunction (1) + hypertension (1) + age ≥ 75 (2) / 65-74 (1) + diabetes (1) + prior stroke/TIA/TE (2) + vascular disease (1); total 0-8, score ≥ 2 favors oral anticoagulation.',
    compute: F.cha2ds2Va,
    fields: [
      { dom: 'va-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'va-chf', arg: 'chf', kind: 'bool', label: 'CHF / LV dysfunction' },
      { dom: 'va-htn', arg: 'hypertension', kind: 'bool', label: 'Hypertension' },
      { dom: 'va-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
      { dom: 'va-stroke', arg: 'stroke', kind: 'bool', label: 'Prior stroke / TIA / thromboembolism' },
      { dom: 'va-vasc', arg: 'vascular', kind: 'bool', label: 'Vascular disease' },
    ],
  },
  {
    id: 'chads-65',
    summary: 'CHADS-65 Canadian pathway (2020 CCS/CHRS): age ≥ 65 → oral anticoagulant; else any CHADS2 risk factor → oral anticoagulant; else coronary/peripheral arterial disease → antiplatelet; else no antithrombotic. Returns the gate that fired.',
    compute: F.chads65,
    fields: [
      { dom: 'c65-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'c65-chf', arg: 'chf', kind: 'bool', label: 'Congestive heart failure' },
      { dom: 'c65-htn', arg: 'hypertension', kind: 'bool', label: 'Hypertension' },
      { dom: 'c65-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
      { dom: 'c65-stroke', arg: 'stroke', kind: 'bool', label: 'Prior stroke or TIA' },
      { dom: 'c65-vasc', arg: 'vascularDisease', kind: 'bool', label: 'Coronary or peripheral arterial disease' },
    ],
  },
  {
    id: 'atria-stroke',
    summary: 'ATRIA Stroke Risk Score (Singer 2013): age scored from the prior-stroke / no-prior-stroke column, plus female sex, diabetes, CHF, hypertension, proteinuria, and eGFR < 45/ESRD (1 each); total 0-15 with low/intermediate/high bands.',
    compute: F.atriaStroke,
    fields: [
      { dom: 'atria-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'atria-stroke-hx', arg: 'priorStroke', kind: 'bool', label: 'Prior stroke (selects the age-point column)' },
      { dom: 'atria-female', arg: 'female', kind: 'bool', label: 'Female sex' },
      { dom: 'atria-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
      { dom: 'atria-chf', arg: 'chf', kind: 'bool', label: 'Congestive heart failure' },
      { dom: 'atria-htn', arg: 'hypertension', kind: 'bool', label: 'Hypertension' },
      { dom: 'atria-proteinuria', arg: 'proteinuria', kind: 'bool', label: 'Proteinuria' },
      { dom: 'atria-renal', arg: 'renal', kind: 'bool', label: 'eGFR < 45 mL/min or ESRD' },
    ],
  },
  {
    id: 'tisdale-qtc',
    summary: 'Tisdale QT-prolongation risk score (Tisdale 2013): age ≥ 68 (1), female (1), loop diuretic (1), K ≤ 3.5 (2), admission QTc ≥ 450 ms (2), acute MI (2), sepsis (3), heart failure (3), QT-prolonging drugs (one 3, ≥ two 6); total 0-21, low/moderate/high.',
    compute: F.tisdaleQtc,
    fields: [
      { dom: 'tis-age', arg: 'age68', kind: 'bool', label: 'Age ≥ 68 years' },
      { dom: 'tis-female', arg: 'female', kind: 'bool', label: 'Female sex' },
      { dom: 'tis-loop', arg: 'loopDiuretic', kind: 'bool', label: 'Loop diuretic' },
      { dom: 'tis-k', arg: 'hypokalemia', kind: 'bool', label: 'Serum potassium ≤ 3.5 mEq/L' },
      { dom: 'tis-qtc', arg: 'qtcProlonged', kind: 'bool', label: 'Admission QTc ≥ 450 ms' },
      { dom: 'tis-mi', arg: 'acuteMi', kind: 'bool', label: 'Acute MI' },
      { dom: 'tis-sepsis', arg: 'sepsis', kind: 'bool', label: 'Sepsis' },
      { dom: 'tis-hf', arg: 'heartFailure', kind: 'bool', label: 'Heart failure' },
      { dom: 'tis-drugs', arg: 'qtDrugs', kind: 'enum', values: ['none', 'one', 'two-plus'], label: 'QT-prolonging drugs' },
    ],
  },
];
