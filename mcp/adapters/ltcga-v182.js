// spec-v183 MCP wave 10: adapters for lib/ltcga-v182.js — continence severity, caregiver strain, and wound-status quantitation — Sandvik, ICIQ-UI-SF, MCSI, CSI, and the BWAT.
// dom keys mirror views/group-v182.js; the compute arg names are the
// verbatim keys those renderers pass. Kind is number for graded / free-numeric
// inputs and enum for the yes/no and sex selects. Default makeToArgs round-trips.

import * as F from '../../lib/ltcga-v182.js';

export default [
  {
    id: 'sandvik-incontinence',
    summary: 'Sandvik Severity Index for urinary incontinence: leakage frequency (1–4) × amount (1–3), banded slight / moderate / severe / very severe.',
    compute: F.sandvikIncontinence,
    fields: [
    { dom: 'sandvik-freq', arg: 'frequency', kind: 'number', required: true, label: 'Frequency' },
    { dom: 'sandvik-amount', arg: 'amount', kind: 'number', required: true, label: 'Amount' },
    ],
  },
  {
    id: 'iciq-ui-sf',
    summary: 'ICIQ-UI Short Form: frequency (0–5) + amount (0–6) + impact (0–10). Total 0–21, banded slight to very severe urinary incontinence.',
    compute: F.iciqUiSf,
    fields: [
    { dom: 'iciq-freq', arg: 'frequency', kind: 'number', required: true, label: 'Frequency' },
    { dom: 'iciq-amount', arg: 'amount', kind: 'number', required: true, label: 'Amount' },
    { dom: 'iciq-impact', arg: 'impact', kind: 'number', required: true, label: 'Impact' },
    ],
  },
  {
    id: 'modified-caregiver-strain-index',
    summary: 'Modified Caregiver Strain Index: 13 items each 0 (no) / 1 (sometimes) / 2 (yes, regularly). Total 0–26; higher indicates greater caregiver strain.',
    compute: F.modifiedCaregiverStrainIndex,
    fields: [
    { dom: 'mcsi-sleep', arg: 'sleep', kind: 'number', required: true, label: 'Sleep' },
    { dom: 'mcsi-physical', arg: 'physical', kind: 'number', required: true, label: 'Physical' },
    { dom: 'mcsi-confining', arg: 'confining', kind: 'number', required: true, label: 'Confining' },
    { dom: 'mcsi-family', arg: 'family', kind: 'number', required: true, label: 'Family' },
    { dom: 'mcsi-plans', arg: 'plans', kind: 'number', required: true, label: 'Plans' },
    { dom: 'mcsi-other', arg: 'otherDemands', kind: 'number', required: true, label: 'Other Demands' },
    { dom: 'mcsi-emotional', arg: 'emotional', kind: 'number', required: true, label: 'Emotional' },
    { dom: 'mcsi-upsetting', arg: 'upsetting', kind: 'number', required: true, label: 'Upsetting' },
    { dom: 'mcsi-changed', arg: 'changed', kind: 'number', required: true, label: 'Changed' },
    { dom: 'mcsi-work', arg: 'work', kind: 'number', required: true, label: 'Work' },
    { dom: 'mcsi-financial', arg: 'financial', kind: 'number', required: true, label: 'Financial' },
    { dom: 'mcsi-overwhelmed', arg: 'overwhelmed', kind: 'number', required: true, label: 'Overwhelmed' },
    { dom: 'mcsi-completely', arg: 'completelyOverwhelmed', kind: 'number', required: true, label: 'Completely Overwhelmed' },
    ],
  },
  {
    id: 'caregiver-strain-index',
    summary: 'Caregiver Strain Index: 13 yes/no strain items. Total 0–13; ≥ 7 indicates a high level of caregiver strain.',
    compute: F.caregiverStrainIndex,
    fields: [
    { dom: 'csi-sleep', arg: 'sleep', kind: 'enum', values: ["yes","no"], required: true, label: 'Sleep' },
    { dom: 'csi-inconvenient', arg: 'inconvenient', kind: 'enum', values: ["yes","no"], required: true, label: 'Inconvenient' },
    { dom: 'csi-physical', arg: 'physical', kind: 'enum', values: ["yes","no"], required: true, label: 'Physical' },
    { dom: 'csi-confining', arg: 'confining', kind: 'enum', values: ["yes","no"], required: true, label: 'Confining' },
    { dom: 'csi-family', arg: 'family', kind: 'enum', values: ["yes","no"], required: true, label: 'Family' },
    { dom: 'csi-plans', arg: 'plans', kind: 'enum', values: ["yes","no"], required: true, label: 'Plans' },
    { dom: 'csi-other', arg: 'otherDemands', kind: 'enum', values: ["yes","no"], required: true, label: 'Other Demands' },
    { dom: 'csi-emotional', arg: 'emotional', kind: 'enum', values: ["yes","no"], required: true, label: 'Emotional' },
    { dom: 'csi-upsetting', arg: 'upsetting', kind: 'enum', values: ["yes","no"], required: true, label: 'Upsetting' },
    { dom: 'csi-changed', arg: 'changed', kind: 'enum', values: ["yes","no"], required: true, label: 'Changed' },
    { dom: 'csi-work', arg: 'work', kind: 'enum', values: ["yes","no"], required: true, label: 'Work' },
    { dom: 'csi-financial', arg: 'financial', kind: 'enum', values: ["yes","no"], required: true, label: 'Financial' },
    { dom: 'csi-overwhelmed', arg: 'overwhelmed', kind: 'enum', values: ["yes","no"], required: true, label: 'Overwhelmed' },
    ],
  },
  {
    id: 'bwat',
    summary: 'Bates-Jensen Wound Assessment Tool: 13 wound attributes each 1 (healthy) to 5 (severe degeneration). Total 13–65; track the trajectory over time.',
    compute: F.bwat,
    fields: [
    { dom: 'bwat-size', arg: 'size', kind: 'number', required: true, label: 'Size' },
    { dom: 'bwat-depth', arg: 'depth', kind: 'number', required: true, label: 'Depth' },
    { dom: 'bwat-edges', arg: 'edges', kind: 'number', required: true, label: 'Edges' },
    { dom: 'bwat-undermining', arg: 'undermining', kind: 'number', required: true, label: 'Undermining' },
    { dom: 'bwat-nectype', arg: 'necroticType', kind: 'number', required: true, label: 'Necrotic Type' },
    { dom: 'bwat-necamount', arg: 'necroticAmount', kind: 'number', required: true, label: 'Necrotic Amount' },
    { dom: 'bwat-exutype', arg: 'exudateType', kind: 'number', required: true, label: 'Exudate Type' },
    { dom: 'bwat-exuamount', arg: 'exudateAmount', kind: 'number', required: true, label: 'Exudate Amount' },
    { dom: 'bwat-skin', arg: 'skinColor', kind: 'number', required: true, label: 'Skin Color' },
    { dom: 'bwat-edema', arg: 'edema', kind: 'number', required: true, label: 'Edema' },
    { dom: 'bwat-induration', arg: 'induration', kind: 'number', required: true, label: 'Induration' },
    { dom: 'bwat-granulation', arg: 'granulation', kind: 'number', required: true, label: 'Granulation' },
    { dom: 'bwat-epithelialization', arg: 'epithelialization', kind: 'number', required: true, label: 'Epithelialization' },
    ],
  },
];
