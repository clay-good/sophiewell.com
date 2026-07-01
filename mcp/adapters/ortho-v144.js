// MCP wave 12: adapters for lib/ortho-v144.js — the Gustilo-Anderson open-
// fracture, Garden femoral-neck, Danis-Weber ankle, Schatzker tibial-plateau,
// Salter-Harris physeal, and Neer proximal-humerus fracture classifications.
// dom keys mirror views/group-v144.js.

import * as F from '../../lib/ortho-v144.js';

export default [
  {
    id: 'gustilo-anderson',
    summary: 'Gustilo-Anderson open-fracture classification: the Type III subtype is set by coverage and perfusion (arterial injury → IIIC, flap coverage → IIIB), not wound size alone.',
    compute: F.gustiloAnderson,
    fields: [
      { dom: 'gust-wound', arg: 'wound', kind: 'enum', values: ['lt1', '1to10', 'gt10'], required: true, label: 'Wound size (< 1 cm / 1–10 cm / > 10 cm)' },
      { dom: 'gust-severe', arg: 'severeSoftTissue', kind: 'bool', required: false, label: 'Extensive soft-tissue injury / high-energy mechanism' },
      { dom: 'gust-flap', arg: 'flapCoverage', kind: 'bool', required: false, label: 'Inadequate coverage requiring a flap (→ IIIB)' },
      { dom: 'gust-arterial', arg: 'arterial', kind: 'bool', required: false, label: 'Arterial injury requiring repair (→ IIIC)' },
    ],
  },
  {
    id: 'garden-classification',
    summary: 'Garden classification of a femoral-neck fracture (I–IV) by completeness and displacement; I–II stable/nondisplaced, III–IV unstable/displaced.',
    compute: F.gardenClassification,
    fields: [
      { dom: 'garden-pat', arg: 'pattern', kind: 'enum', values: ['incomplete', 'complete', 'partial', 'full'], required: true, label: 'Displacement pattern' },
    ],
  },
  {
    id: 'weber-ankle',
    summary: 'Danis-Weber ankle classification (A/B/C) of a distal-fibula fracture by its level relative to the syndesmosis; higher fracture, higher type.',
    compute: F.weberAnkle,
    fields: [
      { dom: 'weber-lvl', arg: 'level', kind: 'enum', values: ['below', 'at', 'above'], required: true, label: 'Fracture level relative to the syndesmosis' },
    ],
  },
  {
    id: 'schatzker-classification',
    summary: 'Schatzker classification of a tibial-plateau fracture (I–VI); I–III typically low-energy, IV–VI high-energy with the worst prognosis.',
    compute: F.schatzkerClassification,
    fields: [
      { dom: 'schatz-pat', arg: 'pattern', kind: 'enum', values: ['lateralSplit', 'lateralSplitDepression', 'lateralDepression', 'medial', 'bicondylar', 'dissociation'], required: true, label: 'Fracture pattern' },
    ],
  },
  {
    id: 'salter-harris',
    summary: 'Salter-Harris classification of a physeal (growth-plate) fracture (I–V) by the SALTR mnemonic; growth-disturbance risk rises I to V.',
    compute: F.salterHarris,
    fields: [
      { dom: 'salter-pat', arg: 'pattern', kind: 'enum', values: ['physis', 'metaphysis', 'epiphysis', 'both', 'crush'], required: true, label: 'Physeal-fracture pattern' },
    ],
  },
  {
    id: 'neer-classification',
    summary: 'Neer classification of a proximal-humerus fracture by how many of four segments are displaced (> 1 cm or > 45°); part count = 1 + displaced segments (max four-part).',
    compute: F.neerClassification,
    fields: [
      { dom: 'neer-art', arg: 'articular', kind: 'bool', required: false, label: 'Articular surface (anatomic neck) displaced' },
      { dom: 'neer-gt', arg: 'greaterTuberosity', kind: 'bool', required: false, label: 'Greater tuberosity displaced' },
      { dom: 'neer-lt', arg: 'lesserTuberosity', kind: 'bool', required: false, label: 'Lesser tuberosity displaced' },
      { dom: 'neer-shaft', arg: 'shaft', kind: 'bool', required: false, label: 'Surgical neck / shaft displaced' },
      { dom: 'neer-disloc', arg: 'dislocation', kind: 'bool', required: false, label: 'Fracture-dislocation present' },
    ],
  },
];
