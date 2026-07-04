// spec-v183 MCP wave 51: adapters for the four CBC-derived indices in
// lib/hematology-v229.js — the absolute eosinophil count (AEC), the
// neutrophil-to-lymphocyte ratio (NLR), the platelet-to-lymphocyte ratio (PLR),
// and the systemic immune-inflammation index (SII). dom keys mirror
// views/group-v229.js; all inputs are numeric.

import * as F from '../../lib/hematology-v229.js';

export default [
  {
    id: 'aec',
    summary: 'Absolute eosinophil count: total WBC × eosinophil percentage; ~500–1500 is mild, 1500–5000 moderate, and > 5000 cells/µL marked hypereosinophilia.',
    compute: F.aec,
    fields: [
      { dom: 'aec-wbc', arg: 'wbc', kind: 'number', required: true, label: 'Total WBC', unit: '×10⁹/L' },
      { dom: 'aec-eos', arg: 'eosPct', kind: 'number', required: true, label: 'Eosinophil percentage', unit: '%' },
    ],
  },
  {
    id: 'nlr',
    summary: 'Neutrophil-to-lymphocyte ratio: absolute neutrophil count / absolute lymphocyte count; a typical reference is roughly 1–3 and > 3 is often considered elevated.',
    compute: F.nlr,
    fields: [
      { dom: 'nlr-anc', arg: 'anc', kind: 'number', required: true, label: 'Absolute neutrophil count', unit: '×10⁹/L' },
      { dom: 'nlr-alc', arg: 'alc', kind: 'number', required: true, label: 'Absolute lymphocyte count', unit: '×10⁹/L' },
    ],
  },
  {
    id: 'plr',
    summary: 'Platelet-to-lymphocyte ratio: platelet count / absolute lymphocyte count; > 180 is often considered elevated.',
    compute: F.plr,
    fields: [
      { dom: 'plr-plt', arg: 'plt', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
      { dom: 'plr-alc', arg: 'alc', kind: 'number', required: true, label: 'Absolute lymphocyte count', unit: '×10⁹/L' },
    ],
  },
  {
    id: 'sii',
    summary: 'Systemic immune-inflammation index: platelets × neutrophils / lymphocytes; a composite inflammatory marker whose interpretation is context-dependent.',
    compute: F.sii,
    fields: [
      { dom: 'sii-plt', arg: 'plt', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
      { dom: 'sii-anc', arg: 'anc', kind: 'number', required: true, label: 'Absolute neutrophil count', unit: '×10⁹/L' },
      { dom: 'sii-alc', arg: 'alc', kind: 'number', required: true, label: 'Absolute lymphocyte count', unit: '×10⁹/L' },
    ],
  },
];
