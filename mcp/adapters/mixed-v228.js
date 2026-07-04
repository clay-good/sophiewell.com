// spec-v183 MCP wave 50: adapters for the five microcytic-anemia RBC
// discrimination indices in lib/mixed-v228.js — the England & Fraser
// discriminant function, the Sirdah, RDW, Srivastava, and Ehsani indices. Each
// screens beta-thalassemia trait versus iron-deficiency anemia from routine CBC
// parameters. dom keys mirror views/group-v228.js; all inputs are numeric.

import * as F from '../../lib/mixed-v228.js';

export default [
  {
    id: 'england-fraser-index',
    summary: 'England & Fraser discriminant function: MCV − RBC − (5 × Hb) − 3.4; a negative value favors beta-thalassemia trait over iron-deficiency anemia.',
    compute: F.englandFraser,
    fields: [
      { dom: 'ef-mcv', arg: 'mcv', kind: 'number', required: true, label: 'MCV', unit: 'fL' },
      { dom: 'ef-rbc', arg: 'rbc', kind: 'number', required: true, label: 'RBC count', unit: '×10¹²/L' },
      { dom: 'ef-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
    ],
  },
  {
    id: 'sirdah-index',
    summary: 'Sirdah index: MCV − RBC − (3 × Hb); a value below ~27 favors beta-thalassemia trait over iron-deficiency anemia.',
    compute: F.sirdah,
    fields: [
      { dom: 'sd-mcv', arg: 'mcv', kind: 'number', required: true, label: 'MCV', unit: 'fL' },
      { dom: 'sd-rbc', arg: 'rbc', kind: 'number', required: true, label: 'RBC count', unit: '×10¹²/L' },
      { dom: 'sd-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
    ],
  },
  {
    id: 'rdw-index',
    summary: 'RDW index (RDWI): (MCV × RDW) / RBC; a value below ~220 favors beta-thalassemia trait over iron-deficiency anemia.',
    compute: F.rdwi,
    fields: [
      { dom: 'rdwi-mcv', arg: 'mcv', kind: 'number', required: true, label: 'MCV', unit: 'fL' },
      { dom: 'rdwi-rdw', arg: 'rdw', kind: 'number', required: true, label: 'RDW', unit: '%' },
      { dom: 'rdwi-rbc', arg: 'rbc', kind: 'number', required: true, label: 'RBC count', unit: '×10¹²/L' },
    ],
  },
  {
    id: 'srivastava-index',
    summary: 'Srivastava index: MCH / RBC; a value below ~3.8 favors beta-thalassemia trait over iron-deficiency anemia.',
    compute: F.srivastava,
    fields: [
      { dom: 'sv-mch', arg: 'mch', kind: 'number', required: true, label: 'MCH', unit: 'pg' },
      { dom: 'sv-rbc', arg: 'rbc', kind: 'number', required: true, label: 'RBC count', unit: '×10¹²/L' },
    ],
  },
  {
    id: 'ehsani-index',
    summary: 'Ehsani index: MCV − (10 × RBC); a value below ~15 favors beta-thalassemia trait over iron-deficiency anemia.',
    compute: F.ehsani,
    fields: [
      { dom: 'eh-mcv', arg: 'mcv', kind: 'number', required: true, label: 'MCV', unit: 'fL' },
      { dom: 'eh-rbc', arg: 'rbc', kind: 'number', required: true, label: 'RBC count', unit: '×10¹²/L' },
    ],
  },
];
