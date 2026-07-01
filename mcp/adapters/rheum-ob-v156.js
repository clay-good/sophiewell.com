// MCP wave 12: adapters for lib/rheum-ob-v156.js — the BASDAI and BASFI axial
// spondyloarthritis patient indices, the EULAR Sjögren's Syndrome Disease
// Activity Index (ESSDAI), and the Robson Ten-Group cesarean classification.
// dom keys mirror views/group-v156.js.

import * as F from '../../lib/rheum-ob-v156.js';

export default [
  {
    id: 'basdai',
    summary: 'Bath Ankylosing Spondylitis Disease Activity Index (BASDAI, 0–10) from six 0–10 items (the two morning-stiffness items averaged); ≥ 4 suggests active disease.',
    compute: F.basdai,
    fields: [
      { dom: 'basdai-q1', arg: 'q1', kind: 'number', required: true, label: 'Fatigue (0–10)' },
      { dom: 'basdai-q2', arg: 'q2', kind: 'number', required: true, label: 'Spinal pain (0–10)' },
      { dom: 'basdai-q3', arg: 'q3', kind: 'number', required: true, label: 'Peripheral joint pain/swelling (0–10)' },
      { dom: 'basdai-q4', arg: 'q4', kind: 'number', required: true, label: 'Enthesitis (0–10)' },
      { dom: 'basdai-q5', arg: 'q5', kind: 'number', required: true, label: 'Morning-stiffness severity (0–10)' },
      { dom: 'basdai-q6', arg: 'q6', kind: 'number', required: true, label: 'Morning-stiffness duration (0–10)' },
    ],
  },
  {
    id: 'basfi',
    summary: 'Bath Ankylosing Spondylitis Functional Index (BASFI, 0–10): the mean of ten 0–10 function/coping items; a higher index means poorer function.',
    compute: F.basfi,
    fields: [
      { dom: 'basfi-i1', arg: 'i1', kind: 'number', required: true, label: 'Item 1 (0–10)' },
      { dom: 'basfi-i2', arg: 'i2', kind: 'number', required: true, label: 'Item 2 (0–10)' },
      { dom: 'basfi-i3', arg: 'i3', kind: 'number', required: true, label: 'Item 3 (0–10)' },
      { dom: 'basfi-i4', arg: 'i4', kind: 'number', required: true, label: 'Item 4 (0–10)' },
      { dom: 'basfi-i5', arg: 'i5', kind: 'number', required: true, label: 'Item 5 (0–10)' },
      { dom: 'basfi-i6', arg: 'i6', kind: 'number', required: true, label: 'Item 6 (0–10)' },
      { dom: 'basfi-i7', arg: 'i7', kind: 'number', required: true, label: 'Item 7 (0–10)' },
      { dom: 'basfi-i8', arg: 'i8', kind: 'number', required: true, label: 'Item 8 (0–10)' },
      { dom: 'basfi-i9', arg: 'i9', kind: 'number', required: true, label: 'Item 9 (0–10)' },
      { dom: 'basfi-i10', arg: 'i10', kind: 'number', required: true, label: 'Item 10 (0–10)' },
    ],
  },
  {
    id: 'essdai',
    summary: 'EULAR Sjögren’s Syndrome Disease Activity Index (ESSDAI): twelve systemic domains each scored at its activity level (already weighted), summed and stratified low / moderate / high.',
    compute: F.essdai,
    fields: [
      { dom: 'essdai-constitutional', arg: 'constitutional', kind: 'enum', values: ['No', 'Low', 'Moderate'], required: false, label: 'Constitutional' },
      { dom: 'essdai-lymphadenopathy', arg: 'lymphadenopathy', kind: 'enum', values: ['No', 'Low', 'Moderate', 'High'], required: false, label: 'Lymphadenopathy' },
      { dom: 'essdai-glandular', arg: 'glandular', kind: 'enum', values: ['No', 'Low', 'Moderate'], required: false, label: 'Glandular' },
      { dom: 'essdai-articular', arg: 'articular', kind: 'enum', values: ['No', 'Low', 'Moderate', 'High'], required: false, label: 'Articular' },
      { dom: 'essdai-cutaneous', arg: 'cutaneous', kind: 'enum', values: ['No', 'Low', 'Moderate', 'High'], required: false, label: 'Cutaneous' },
      { dom: 'essdai-pulmonary', arg: 'pulmonary', kind: 'enum', values: ['No', 'Low', 'Moderate', 'High'], required: false, label: 'Pulmonary' },
      { dom: 'essdai-renal', arg: 'renal', kind: 'enum', values: ['No', 'Low', 'Moderate', 'High'], required: false, label: 'Renal' },
      { dom: 'essdai-muscular', arg: 'muscular', kind: 'enum', values: ['No', 'Low', 'Moderate', 'High'], required: false, label: 'Muscular' },
      { dom: 'essdai-pns', arg: 'pns', kind: 'enum', values: ['No', 'Low', 'Moderate', 'High'], required: false, label: 'Peripheral nervous system' },
      { dom: 'essdai-cns', arg: 'cns', kind: 'enum', values: ['No', 'Moderate', 'High'], required: false, label: 'Central nervous system' },
      { dom: 'essdai-hematological', arg: 'hematological', kind: 'enum', values: ['No', 'Low', 'Moderate', 'High'], required: false, label: 'Haematological' },
      { dom: 'essdai-biological', arg: 'biological', kind: 'enum', values: ['No', 'Low', 'Moderate'], required: false, label: 'Biological' },
    ],
  },
  {
    id: 'robson',
    summary: 'Robson Ten-Group Classification System: sorts a delivery into one of ten mutually-exclusive cesarean-audit groups by parity, previous cesarean, onset, presentation, plurality, and gestation.',
    compute: F.robson,
    fields: [
      { dom: 'robson-parity', arg: 'parity', kind: 'enum', values: ['nullipara', 'multipara'], required: true, label: 'Parity' },
      { dom: 'robson-previous-cs', arg: 'previousCs', kind: 'bool', required: false, label: 'Previous cesarean' },
      { dom: 'robson-fetuses', arg: 'fetuses', kind: 'enum', values: ['single', 'multiple'], required: true, label: 'Number of fetuses' },
      { dom: 'robson-presentation', arg: 'presentation', kind: 'enum', values: ['cephalic', 'breech', 'transverse-oblique'], required: true, label: 'Presentation' },
      { dom: 'robson-gestation', arg: 'gestation', kind: 'enum', values: ['term', 'preterm'], required: true, label: 'Gestational age' },
      { dom: 'robson-onset', arg: 'onset', kind: 'enum', values: ['spontaneous', 'induced', 'prelabor-cs'], required: false, label: 'Onset of labor (needed only for groups 1–4)' },
    ],
  },
];
