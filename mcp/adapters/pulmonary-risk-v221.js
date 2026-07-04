// spec-v183 MCP wave 43: adapters for the seven pulmonary risk instruments in
// lib/pulmonary-risk-v221.js — the simplified revised Geneva PE score, the SCAP
// and CORB severe-CAP scores, the RESP respiratory-ECMO-survival score, the
// ILD-GAP and du Bois IPF prognostic scores, and the Collins pneumothorax-volume
// estimate. dom keys mirror views/group-v221.js. The RESP age/ventilation/
// diagnosis and ILD-GAP subtype/age/DLCO selects carry numeric-string point
// values (modeled as enums, including the negative-point RESP options); the rest
// are numeric measurements and boolean flags.

import * as F from '../../lib/pulmonary-risk-v221.js';

export default [
  {
    id: 'simplified-revised-geneva',
    summary: 'Simplified revised Geneva score (Klok 2008): age > 65, prior VTE, recent surgery/fracture, malignancy, unilateral limb pain, hemoptysis, palpation pain with edema, and heart rate give a pretest probability of pulmonary embolism (≥ 3 likely).',
    compute: F.simplifiedGeneva,
    fields: [
      { dom: 'sg-hr', arg: 'heartRate', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'sg-age', arg: 'ageOver65', kind: 'bool', required: false, label: 'Age > 65 (+1)' },
      { dom: 'sg-vte', arg: 'priorVte', kind: 'bool', required: false, label: 'Previous DVT/PE (+1)' },
      { dom: 'sg-surg', arg: 'surgeryFracture', kind: 'bool', required: false, label: 'Surgery or fracture ≤ 1 month (+1)' },
      { dom: 'sg-malig', arg: 'malignancy', kind: 'bool', required: false, label: 'Active malignancy (+1)' },
      { dom: 'sg-limb', arg: 'limbPain', kind: 'bool', required: false, label: 'Unilateral lower-limb pain (+1)' },
      { dom: 'sg-hemo', arg: 'hemoptysis', kind: 'bool', required: false, label: 'Hemoptysis (+1)' },
      { dom: 'sg-palp', arg: 'palpationEdema', kind: 'bool', required: false, label: 'Pain on deep venous palpation + unilateral edema (+1)' },
    ],
  },
  {
    id: 'scap-score',
    summary: 'SCAP / España score (España 2006): major criteria (pH < 7.30, SBP < 90) and minor criteria (RR > 30, hypoxemia, BUN > 30, altered mental status, age ≥ 80, multilobar infiltrate) identify severe community-acquired pneumonia (≥ 10 high risk).',
    compute: F.scap,
    fields: [
      { dom: 'scap-ph', arg: 'phLow', kind: 'bool', required: false, label: 'Arterial pH < 7.30 (+13)' },
      { dom: 'scap-sbp', arg: 'sbpLow', kind: 'bool', required: false, label: 'Systolic BP < 90 mmHg (+11)' },
      { dom: 'scap-rr', arg: 'rrHigh', kind: 'bool', required: false, label: 'Respiratory rate > 30 (+9)' },
      { dom: 'scap-o2', arg: 'hypoxemia', kind: 'bool', required: false, label: 'PaO₂ < 54 or PaO₂/FiO₂ < 250 (+6)' },
      { dom: 'scap-bun', arg: 'bunHigh', kind: 'bool', required: false, label: 'BUN > 30 mg/dL (+5)' },
      { dom: 'scap-ams', arg: 'ams', kind: 'bool', required: false, label: 'Altered mental status (+5)' },
      { dom: 'scap-age', arg: 'ageOld', kind: 'bool', required: false, label: 'Age ≥ 80 (+5)' },
      { dom: 'scap-multi', arg: 'multilobar', kind: 'bool', required: false, label: 'Multilobar / bilateral infiltrate (+5)' },
    ],
  },
  {
    id: 'corb-score',
    summary: 'CORB score (Buising 2007): Confusion, Oxygen saturation ≤ 90%, Respiratory rate ≥ 30, and Blood pressure (SBP < 90 or DBP ≤ 60) give a 0–4 severe-CAP score (≥ 2 severe).',
    compute: F.corb,
    fields: [
      { dom: 'corb-conf', arg: 'confusion', kind: 'bool', required: false, label: 'Acute confusion (+1)' },
      { dom: 'corb-o2', arg: 'oxygen', kind: 'bool', required: false, label: 'Oxygen saturation ≤ 90% (+1)' },
      { dom: 'corb-rr', arg: 'respRate', kind: 'bool', required: false, label: 'Respiratory rate ≥ 30 (+1)' },
      { dom: 'corb-bp', arg: 'bp', kind: 'bool', required: false, label: 'Systolic BP < 90 or diastolic ≤ 60 (+1)' },
    ],
  },
  {
    id: 'resp-score',
    summary: 'RESP score (Schmidt 2014): age band, immunocompromise, pre-ECMO ventilation duration, acute respiratory diagnosis, and acute modifiers predict survival on respiratory ECMO (class I–V).',
    compute: F.resp,
    fields: [
      { dom: 'resp-age', arg: 'ageBand', kind: 'enum', values: ['0', '-2', '-3'], required: true, label: 'Age band (points)' },
      { dom: 'resp-mv', arg: 'mvBand', kind: 'enum', values: ['3', '1', '0'], required: true, label: 'Mechanical ventilation before ECMO (points)' },
      { dom: 'resp-dx', arg: 'diagnosis', kind: 'enum', values: ['3', '11', '5', '1', '0'], required: true, label: 'Acute respiratory diagnosis (points)' },
      { dom: 'resp-immuno', arg: 'immunocompromised', kind: 'bool', required: false, label: 'Immunocompromised (−2)' },
      { dom: 'resp-cns', arg: 'cns', kind: 'bool', required: false, label: 'CNS dysfunction (−7)' },
      { dom: 'resp-infxn', arg: 'nonPulmInfection', kind: 'bool', required: false, label: 'Non-pulmonary infection (−3)' },
      { dom: 'resp-nmb', arg: 'nmb', kind: 'bool', required: false, label: 'Neuromuscular blockade (+1)' },
      { dom: 'resp-no', arg: 'nitricOxide', kind: 'bool', required: false, label: 'Inhaled nitric oxide (−1)' },
      { dom: 'resp-bicarb', arg: 'bicarbonate', kind: 'bool', required: false, label: 'Bicarbonate infusion (−2)' },
      { dom: 'resp-arrest', arg: 'cardiacArrest', kind: 'bool', required: false, label: 'Cardiac arrest (−2)' },
      { dom: 'resp-paco2', arg: 'paco2High', kind: 'bool', required: false, label: 'PaCO₂ ≥ 75 mmHg (−1)' },
      { dom: 'resp-pip', arg: 'pipHigh', kind: 'bool', required: false, label: 'Peak inspiratory pressure ≥ 42 (−1)' },
    ],
  },
  {
    id: 'ild-gap',
    summary: 'ILD-GAP score (Ryerson 2014): ILD subtype, sex, age band, FVC % predicted, and DLCO band give a score mapping to stage I–IV mortality in interstitial lung disease.',
    compute: F.ildGap,
    fields: [
      { dom: 'ild-sub', arg: 'subtype', kind: 'enum', values: ['0', '-2'], required: true, label: 'ILD subtype (points)' },
      { dom: 'ild-age', arg: 'ageBand', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Age band (points)' },
      { dom: 'ild-fvc', arg: 'fvc', kind: 'number', required: true, label: 'FVC % predicted' },
      { dom: 'ild-dlco', arg: 'dlcoBand', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'DLCO % predicted band (points)' },
      { dom: 'ild-male', arg: 'male', kind: 'bool', required: false, label: 'Male sex (+1)' },
    ],
  },
  {
    id: 'du-bois-ipf',
    summary: 'du Bois IPF score (du Bois 2011): age, respiratory hospitalization, baseline FVC % predicted, and 24-week FVC change give a 0–61 score predicting 1-year mortality in idiopathic pulmonary fibrosis.',
    compute: F.duBoisIpf,
    fields: [
      { dom: 'db-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'db-fvc', arg: 'fvc', kind: 'number', required: true, label: 'Baseline FVC % predicted' },
      { dom: 'db-dfvc', arg: 'deltaFvc', kind: 'number', required: true, label: '24-week change in FVC % predicted (signed)' },
      { dom: 'db-hosp', arg: 'hospitalization', kind: 'bool', required: false, label: 'Respiratory hospitalization in prior 6 months (+14)' },
    ],
  },
  {
    id: 'pneumothorax-volume',
    summary: 'Collins pneumothorax-size estimate (Collins 1995): percent = 4.2 + 4.7 × (A + B + C), where A, B, and C are the interpleural distances (cm) at the apex, mid-upper, and mid-lower lung.',
    compute: F.pneumothoraxVolume,
    fields: [
      { dom: 'ptx-a', arg: 'apex', kind: 'number', required: true, label: 'Apex interpleural distance', unit: 'cm' },
      { dom: 'ptx-b', arg: 'midUpper', kind: 'number', required: true, label: 'Mid-upper interpleural distance', unit: 'cm' },
      { dom: 'ptx-c', arg: 'midLower', kind: 'number', required: true, label: 'Mid-lower interpleural distance', unit: 'cm' },
    ],
  },
];
