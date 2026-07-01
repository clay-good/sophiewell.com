// MCP wave 12: adapters for lib/rheum-v160.js — the RAPID3 and DAPSA
// disease-activity indices, and the SLICC 2012 and 2019 EULAR/ACR SLE
// classification criteria. dom keys mirror views/group-v160.js.

import * as F from '../../lib/rheum-v160.js';

export default [
  {
    id: 'rapid3',
    summary: 'Routine Assessment of Patient Index Data 3 (RAPID3, 0–30): the MDHAQ function sum (÷3) plus pain and patient-global VAS, banded near-remission / low / moderate / high.',
    compute: F.rapid3,
    fields: [
      { dom: 'rapid3-fn', arg: 'fnRaw', kind: 'number', required: true, label: 'MDHAQ function sum (0–30)' },
      { dom: 'rapid3-pain', arg: 'pain', kind: 'number', required: true, label: 'Pain VAS (0–10)' },
      { dom: 'rapid3-global', arg: 'global', kind: 'number', required: true, label: 'Patient-global VAS (0–10)' },
    ],
  },
  {
    id: 'dapsa',
    summary: 'Disease Activity in Psoriatic Arthritis (DAPSA): 68-joint tender + 66-joint swollen counts + patient-global + pain VAS + CRP (mg/dL); banded remission / low / moderate / high.',
    compute: F.dapsa,
    fields: [
      { dom: 'dapsa-tjc', arg: 'tjc68', kind: 'number', required: true, label: '68-joint tender count' },
      { dom: 'dapsa-sjc', arg: 'sjc66', kind: 'number', required: true, label: '66-joint swollen count' },
      { dom: 'dapsa-global', arg: 'global', kind: 'number', required: true, label: 'Patient-global VAS (0–10)' },
      { dom: 'dapsa-pain', arg: 'pain', kind: 'number', required: true, label: 'Pain VAS (0–10)' },
      { dom: 'dapsa-crp', arg: 'crp', kind: 'number', required: true, label: 'CRP', unit: 'mg/dL' },
    ],
  },
  {
    id: 'slicc-sle',
    summary: 'SLICC 2012 SLE classification: ≥ 4 of 17 criteria with ≥ 1 clinical and ≥ 1 immunologic, OR biopsy-proven lupus nephritis with ANA or anti-dsDNA.',
    compute: F.sliccSle,
    fields: [
      { dom: 'slicc-acuteCutaneous', arg: 'acuteCutaneous', kind: 'bool', required: false, label: 'Acute cutaneous lupus' },
      { dom: 'slicc-chronicCutaneous', arg: 'chronicCutaneous', kind: 'bool', required: false, label: 'Chronic cutaneous lupus' },
      { dom: 'slicc-oralNasalUlcers', arg: 'oralNasalUlcers', kind: 'bool', required: false, label: 'Oral / nasal ulcers' },
      { dom: 'slicc-alopecia', arg: 'alopecia', kind: 'bool', required: false, label: 'Nonscarring alopecia' },
      { dom: 'slicc-synovitis', arg: 'synovitis', kind: 'bool', required: false, label: 'Synovitis' },
      { dom: 'slicc-serositis', arg: 'serositis', kind: 'bool', required: false, label: 'Serositis' },
      { dom: 'slicc-renal', arg: 'renal', kind: 'bool', required: false, label: 'Renal involvement' },
      { dom: 'slicc-neurologic', arg: 'neurologic', kind: 'bool', required: false, label: 'Neurologic involvement' },
      { dom: 'slicc-hemolyticAnemia', arg: 'hemolyticAnemia', kind: 'bool', required: false, label: 'Hemolytic anemia' },
      { dom: 'slicc-leukopenia', arg: 'leukopenia', kind: 'bool', required: false, label: 'Leukopenia' },
      { dom: 'slicc-thrombocytopenia', arg: 'thrombocytopenia', kind: 'bool', required: false, label: 'Thrombocytopenia' },
      { dom: 'slicc-ana', arg: 'ana', kind: 'bool', required: false, label: 'ANA (immunologic)' },
      { dom: 'slicc-antiDsDna', arg: 'antiDsDna', kind: 'bool', required: false, label: 'Anti-dsDNA (immunologic)' },
      { dom: 'slicc-antiSm', arg: 'antiSm', kind: 'bool', required: false, label: 'Anti-Sm (immunologic)' },
      { dom: 'slicc-antiphospholipid', arg: 'antiphospholipid', kind: 'bool', required: false, label: 'Antiphospholipid antibody (immunologic)' },
      { dom: 'slicc-lowComplement', arg: 'lowComplement', kind: 'bool', required: false, label: 'Low complement (immunologic)' },
      { dom: 'slicc-directCoombs', arg: 'directCoombs', kind: 'bool', required: false, label: 'Direct Coombs (immunologic)' },
      { dom: 'slicc-biopsyNephritis', arg: 'biopsyNephritis', kind: 'bool', required: false, label: 'Biopsy-proven lupus nephritis (shortcut pathway)' },
    ],
  },
  {
    id: 'sle-2019-eular-acr',
    summary: '2019 EULAR/ACR SLE classification: a positive ANA ≥ 1:80 entry gate, then the single highest-weighted item per domain summed; classify if entry met, total ≥ 10, and ≥ 1 clinical.',
    compute: F.sle2019EularAcr,
    fields: [
      { dom: 'sle19-anaEntry', arg: 'anaEntry', kind: 'bool', required: false, label: 'Entry: ANA ≥ 1:80 ever' },
      { dom: 'sle19-fever', arg: 'fever', kind: 'bool', required: false, label: 'Fever (+2)' },
      { dom: 'sle19-leukopenia', arg: 'leukopenia', kind: 'bool', required: false, label: 'Leukopenia (+3)' },
      { dom: 'sle19-thrombocytopenia', arg: 'thrombocytopenia', kind: 'bool', required: false, label: 'Thrombocytopenia (+4)' },
      { dom: 'sle19-hemolysis', arg: 'hemolysis', kind: 'bool', required: false, label: 'Autoimmune hemolysis (+4)' },
      { dom: 'sle19-delirium', arg: 'delirium', kind: 'bool', required: false, label: 'Delirium (+2)' },
      { dom: 'sle19-psychosis', arg: 'psychosis', kind: 'bool', required: false, label: 'Psychosis (+3)' },
      { dom: 'sle19-seizure', arg: 'seizure', kind: 'bool', required: false, label: 'Seizure (+5)' },
      { dom: 'sle19-alopecia', arg: 'alopecia', kind: 'bool', required: false, label: 'Nonscarring alopecia (+2)' },
      { dom: 'sle19-oralUlcers', arg: 'oralUlcers', kind: 'bool', required: false, label: 'Oral ulcers (+2)' },
      { dom: 'sle19-subacuteOrDiscoid', arg: 'subacuteOrDiscoid', kind: 'bool', required: false, label: 'Subacute cutaneous or discoid lupus (+4)' },
      { dom: 'sle19-acuteCutaneous', arg: 'acuteCutaneous', kind: 'bool', required: false, label: 'Acute cutaneous lupus (+6)' },
      { dom: 'sle19-effusion', arg: 'effusion', kind: 'bool', required: false, label: 'Pleural or pericardial effusion (+5)' },
      { dom: 'sle19-pericarditis', arg: 'pericarditis', kind: 'bool', required: false, label: 'Acute pericarditis (+6)' },
      { dom: 'sle19-jointInvolvement', arg: 'jointInvolvement', kind: 'bool', required: false, label: 'Joint involvement (+6)' },
      { dom: 'sle19-proteinuria', arg: 'proteinuria', kind: 'bool', required: false, label: 'Proteinuria > 0.5 g/24 h (+4)' },
      { dom: 'sle19-biopsyClass2or5', arg: 'biopsyClass2or5', kind: 'bool', required: false, label: 'Renal biopsy class II or V (+8)' },
      { dom: 'sle19-biopsyClass3or4', arg: 'biopsyClass3or4', kind: 'bool', required: false, label: 'Renal biopsy class III or IV (+10)' },
      { dom: 'sle19-antiphospholipid', arg: 'antiphospholipid', kind: 'bool', required: false, label: 'Antiphospholipid antibodies (+2)' },
      { dom: 'sle19-lowC3orC4', arg: 'lowC3orC4', kind: 'bool', required: false, label: 'Low C3 or C4 (+3)' },
      { dom: 'sle19-lowC3andC4', arg: 'lowC3andC4', kind: 'bool', required: false, label: 'Low C3 and C4 (+4)' },
      { dom: 'sle19-dsDnaOrSm', arg: 'dsDnaOrSm', kind: 'bool', required: false, label: 'Anti-dsDNA or anti-Sm (+6)' },
    ],
  },
];
