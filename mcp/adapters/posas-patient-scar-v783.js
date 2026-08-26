// spec-v783 MCP adapter: POSAS Patient Scale in lib/posas-patient-scar-v783.js.
// The dom keys mirror the browser renderer (views/group-v783.js) and
// META['posas-patient-scar'].example. Six required 1-10 numbers plus an optional overall
// opinion that is deliberately excluded from the total. Clinical domain.

import { posasPatientScar } from '../../lib/posas-patient-scar-v783.js';

export default [
  {
    id: 'posas-patient-scar',
    summary: 'POSAS Patient Scale (Draaijers 2004; v2.0 van de Kar 2005): the patient-rated half of the Patient and Observer Scar Assessment Scale. The patient rates pain, itch, color, pliability, thickness and relief of their own scar, each 1 (not at all / like normal skin) to 10 (very much / worst imaginable). Total is the sum of the six, 6-60, higher is worse. A seventh overall-opinion item is recorded on the same scale but is NOT part of the total. Pain and itch exist only on this half - no observer can rate them.',
    compute: posasPatientScar,
    fields: [
      { dom: 'posasp-pain', arg: 'pain', kind: 'number', required: true, label: 'Pain in the scar (1-10)' },
      { dom: 'posasp-itch', arg: 'itch', kind: 'number', required: true, label: 'Itch in the scar (1-10)' },
      { dom: 'posasp-color', arg: 'color', kind: 'number', required: true, label: 'Color difference (1-10)' },
      { dom: 'posasp-pliab', arg: 'pliability', kind: 'number', required: true, label: 'Pliability or stiffness (1-10)' },
      { dom: 'posasp-thick', arg: 'thickness', kind: 'number', required: true, label: 'Thickness difference (1-10)' },
      { dom: 'posasp-relief', arg: 'relief', kind: 'number', required: true, label: 'Relief or irregularity (1-10)' },
      { dom: 'posasp-overall', arg: 'overallOpinion', kind: 'number', required: false, label: 'Overall opinion (1-10, not in total)' },
    ],
  },
];
