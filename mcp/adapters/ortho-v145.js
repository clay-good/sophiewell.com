// MCP wave 12: adapters for lib/ortho-v145.js — the Frykman distal-radius
// classification, the Mirels impending-fracture score, the Kellgren-Lawrence
// osteoarthritis grade, the Pittsburgh knee rule, and the compartment delta
// pressure. dom keys mirror views/group-v145.js.

import * as F from '../../lib/ortho-v145.js';

export default [
  {
    id: 'frykman-classification',
    summary: 'Frykman classification of a distal-radius fracture (I–VIII) on two axes: joint involvement and whether there is an associated distal-ulna (ulnar-styloid) fracture.',
    compute: F.frykmanClassification,
    fields: [
      { dom: 'fryk-joint', arg: 'joint', kind: 'enum', values: ['extraArticular', 'radiocarpal', 'radioulnar', 'both'], required: true, label: 'Joint-involvement pattern' },
      { dom: 'fryk-ulnar', arg: 'ulnarStyloid', kind: 'bool', required: false, label: 'Associated ulnar-styloid fracture' },
    ],
  },
  {
    id: 'mirels-score',
    summary: 'Mirels Score (4–12) for the risk that a long-bone metastasis will progress to a pathologic fracture; ≥ 9 (> 33% risk) recommends prophylactic fixation.',
    compute: F.mirelsScore,
    fields: [
      { dom: 'mir-site', arg: 'site', kind: 'enum', values: ['upper', 'lower', 'peritrochanteric'], required: true, label: 'Site' },
      { dom: 'mir-pain', arg: 'pain', kind: 'enum', values: ['mild', 'moderate', 'functional'], required: true, label: 'Pain' },
      { dom: 'mir-lesion', arg: 'lesion', kind: 'enum', values: ['blastic', 'mixed', 'lytic'], required: true, label: 'Radiographic nature' },
      { dom: 'mir-size', arg: 'size', kind: 'enum', values: ['small', 'mid', 'large'], required: true, label: 'Size relative to cortical diameter' },
    ],
  },
  {
    id: 'kellgren-lawrence',
    summary: 'Kellgren-Lawrence radiographic osteoarthritis grade (0–4); grade ≥ 2 (osteophyte plus narrowing) is the threshold for definite radiographic OA.',
    compute: F.kellgrenLawrence,
    fields: [
      { dom: 'kl-grade', arg: 'grade', kind: 'number', required: true, label: 'Radiographic grade (0–4)' },
    ],
  },
  {
    id: 'pittsburgh-knee-rule',
    summary: 'Pittsburgh Knee Rules for whether a knee radiograph is indicated after acute injury: given a blunt-trauma/fall mechanism, image if age < 12 or > 50 or unable to bear weight four steps.',
    compute: F.pittsburghKneeRule,
    fields: [
      { dom: 'pitt-mech', arg: 'mechanism', kind: 'bool', required: false, label: 'Blunt-trauma or fall mechanism (entry gate)' },
      { dom: 'pitt-young', arg: 'ageUnder12', kind: 'bool', required: false, label: 'Age < 12 years' },
      { dom: 'pitt-old', arg: 'ageOver50', kind: 'bool', required: false, label: 'Age > 50 years' },
      { dom: 'pitt-weight', arg: 'cannotBearWeight', kind: 'bool', required: false, label: 'Unable to take 4 weight-bearing steps' },
    ],
  },
  {
    id: 'compartment-delta-pressure',
    summary: 'Compartment delta pressure ΔP = diastolic blood pressure − measured intracompartmental pressure (mmHg); ΔP < 30 mmHg is the published fasciotomy threshold.',
    compute: F.compartmentDeltaPressure,
    fields: [
      { dom: 'comp-dia', arg: 'diastolic', kind: 'number', required: true, label: 'Diastolic blood pressure', unit: 'mmHg' },
      { dom: 'comp-icp', arg: 'compartment', kind: 'number', required: true, label: 'Measured compartment pressure', unit: 'mmHg' },
    ],
  },
];
