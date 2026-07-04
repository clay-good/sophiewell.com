// spec-v183 MCP wave 15: adapters for the five acute-coronary / primary-PCI /
// cardiogenic-shock risk instruments in lib/acs-v193.js — the CRUSADE
// major-bleeding score for NSTEMI, the SCAI SHOCK stage, the Zwolle primary-PCI
// early-discharge score, the TIMI Risk Index, and the CADILLAC post-PCI
// mortality score. dom keys mirror views/group-v193.js.

import * as F from '../../lib/acs-v193.js';

export default [
  {
    id: 'crusade',
    summary: 'CRUSADE major-bleeding risk score for NSTEMI (Subherwal 2009): hematocrit, creatinine clearance, heart rate, sex, heart-failure signs, prior vascular disease, diabetes, and a U-shaped systolic-BP term map to in-hospital major-bleeding risk bands.',
    compute: F.crusade,
    fields: [
      { dom: 'crusade-hct', arg: 'hct', kind: 'number', required: true, label: 'Baseline hematocrit', unit: '%' },
      { dom: 'crusade-crcl', arg: 'crcl', kind: 'number', required: true, label: 'Creatinine clearance', unit: 'mL/min' },
      { dom: 'crusade-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'crusade-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: true, label: 'Sex' },
      { dom: 'crusade-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic blood pressure', unit: 'mmHg' },
      { dom: 'crusade-chf', arg: 'chf', kind: 'bool', required: false, label: 'Signs of heart failure at presentation' },
      { dom: 'crusade-vasc', arg: 'vasc', kind: 'bool', required: false, label: 'Prior vascular disease (PAD or stroke)' },
      { dom: 'crusade-dm', arg: 'dm', kind: 'bool', required: false, label: 'Diabetes mellitus' },
    ],
  },
  {
    id: 'scai-shock',
    summary: 'SCAI SHOCK cardiogenic-shock stage A–E (Naidu 2022; Kadosh/Kapur operationalization) from systolic BP, lactate, and the level of vasoactive/mechanical support, with a cardiac-arrest modifier.',
    compute: F.scaiShock,
    fields: [
      { dom: 'scai-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic blood pressure', unit: 'mmHg' },
      { dom: 'scai-lactate', arg: 'lactate', kind: 'number', required: true, label: 'Serum lactate', unit: 'mmol/L' },
      { dom: 'scai-support', arg: 'support', kind: 'enum', values: ['none', 'one', 'multiple', 'maximal'], required: true, label: 'Vasoactive / mechanical support level' },
      { dom: 'scai-arrest', arg: 'arrest', kind: 'bool', required: false, label: 'Cardiac arrest / circulatory collapse' },
      { dom: 'scai-persist', arg: 'persist', kind: 'bool', required: false, label: 'Hypotension/hypoperfusion persisting despite initial support' },
    ],
  },
  {
    id: 'zwolle-pci',
    summary: 'Zwolle primary-PCI risk score (De Luca 2004): Killip class, post-PCI TIMI flow, age ≥ 60, three-vessel disease, anterior MI, and ischemic time > 4 h sum to 0–16; ≤ 3 marks a low-risk early-discharge candidate.',
    compute: F.zwollePci,
    fields: [
      { dom: 'zwolle-killip', arg: 'killip', kind: 'enum', values: ['1', '2', '3-4'], required: true, label: 'Killip class' },
      { dom: 'zwolle-timi', arg: 'timi', kind: 'enum', values: ['3', '2', '0-1'], required: true, label: 'Post-PCI TIMI flow' },
      { dom: 'zwolle-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'zwolle-3vd', arg: 'threeVessel', kind: 'bool', required: false, label: 'Three-vessel disease' },
      { dom: 'zwolle-ant', arg: 'anterior', kind: 'bool', required: false, label: 'Anterior infarction' },
      { dom: 'zwolle-time', arg: 'longIschemia', kind: 'bool', required: false, label: 'Ischemic time > 4 hours' },
    ],
  },
  {
    id: 'timi-risk-index',
    summary: 'TIMI Risk Index (Wiviott 2006; Morrow 2001): heart rate × (age/10)² / systolic BP; a higher index marks higher 30-day and long-term mortality across the published quintiles.',
    compute: F.timiRiskIndex,
    fields: [
      { dom: 'tri-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'tri-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'tri-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic blood pressure', unit: 'mmHg' },
    ],
  },
  {
    id: 'cadillac-risk',
    summary: 'CADILLAC post-PCI mortality risk score (Halkin 2005): LVEF < 40%, CrCl < 60, Killip 2–3, post-PCI TIMI 0–2, age > 65, anemia, and three-vessel disease sum to 0–18 with low/intermediate/high 30-day and 1-year mortality bands.',
    compute: F.cadillacRisk,
    fields: [
      { dom: 'cad-lvef', arg: 'lvef', kind: 'number', required: true, label: 'LVEF', unit: '%' },
      { dom: 'cad-crcl', arg: 'crcl', kind: 'number', required: true, label: 'Creatinine clearance', unit: 'mL/min' },
      { dom: 'cad-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'cad-killip', arg: 'killip', kind: 'enum', values: ['1', '2-3'], required: true, label: 'Killip class' },
      { dom: 'cad-timi', arg: 'timi', kind: 'enum', values: ['3', '0-2'], required: true, label: 'Post-PCI TIMI flow' },
      { dom: 'cad-anemia', arg: 'anemia', kind: 'bool', required: false, label: 'Anemia (Hct < 39% men / < 36% women)' },
      { dom: 'cad-3vd', arg: 'threeVessel', kind: 'bool', required: false, label: 'Three-vessel disease' },
    ],
  },
];
