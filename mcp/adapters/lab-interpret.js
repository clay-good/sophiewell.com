// spec-v183 MCP wave 114: adapter for the plain-language lab-value interpreter
// in lib/lab-interpret.js. The compute (interpretLab / interpretLabs) and the
// reference-range tables already exist; this exposes them without any view or
// lib change. dom keys mirror views/group-v6.js (lab-<analyteId>, lab-sex,
// lab-pregnant). Enter one or more analyte values; each is classified against
// its published reference range (sex- and pregnancy-adjusted where relevant).
// Reference information, not a diagnosis.

import * as F from '../../lib/lab-interpret.js';

const ANALYTE_IDS = Object.keys(F.LAB_ANALYTES);

export default [
  {
    id: 'lab-interpret',
    summary: 'Plain-language lab-value interpreter: classifies each entered analyte (CBC, CMP, lipid panel, A1C, TSH) against its published reference range - within range, borderline, or flagged (mild / significant), sex- and pregnancy-adjusted where relevant - and returns the range and a short narrative. Reference information, not a diagnosis.',
    // Gather every provided analyte value and interpret the batch; sex /
    // pregnancy context applies to all. The default makeToArgs maps each
    // lab-<id> input to its analyte id.
    compute: (a) => {
      const opts = { sex: a.sex || null, pregnant: a.pregnant === true };
      const entries = [];
      for (const id of ANALYTE_IDS) {
        const v = a[id];
        if (v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v))) {
          entries.push({ analyteId: id, value: Number(v) });
        }
      }
      return { count: entries.length, interpretations: F.interpretLabs(entries, opts) };
    },
    fields: [
      { dom: 'lab-sex', arg: 'sex', kind: 'enum', values: ['', 'female', 'male'], label: 'Sex (affects creatinine, hemoglobin, hematocrit, HDL)' },
      { dom: 'lab-pregnant', arg: 'pregnant', kind: 'bool', label: 'Pregnant (pregnancy-adjusted hemoglobin range)' },
      ...ANALYTE_IDS.map((id) => ({ dom: `lab-${id}`, arg: id, kind: 'number', label: `${F.LAB_ANALYTES[id].label} (${F.LAB_ANALYTES[id].units})` })),
    ],
  },
];
