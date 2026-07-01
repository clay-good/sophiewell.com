// MCP wave 12: adapters for lib/gyn-v139.js — the Flamm VBAC admission score,
// the ROMA and RMI ovarian-malignancy risk indices, the IOTA Simple Rules, the
// Rotterdam PCOS criteria, and POP-Q prolapse staging. dom keys mirror
// views/group-v139.js.

import * as F from '../../lib/gyn-v139.js';

export default [
  {
    id: 'flamm-vbac',
    summary: 'Flamm VBAC admission score (0–10) from maternal age, prior-vaginal-birth history, the reason for the prior cesarean, cervical effacement, and dilation, mapping to a success probability.',
    compute: F.flammVbac,
    fields: [
      { dom: 'fv-age', arg: 'ageUnder40', kind: 'bool', required: false, label: 'Age under 40 (+2)' },
      { dom: 'fv-vb', arg: 'vaginalBirth', kind: 'enum', values: ['none', 'before', 'after'], required: true, label: 'Prior vaginal-birth history' },
      { dom: 'fv-reason', arg: 'reasonNotFtp', kind: 'bool', required: false, label: 'Prior cesarean for a reason other than failure to progress (+1)' },
      { dom: 'fv-eff', arg: 'effacement', kind: 'enum', values: ['low', 'mid', 'high'], required: true, label: 'Cervical effacement' },
      { dom: 'fv-dil', arg: 'dilation4', kind: 'bool', required: false, label: 'Cervical dilation ≥ 4 cm (+1)' },
    ],
  },
  {
    id: 'roma-ovarian',
    summary: 'ROMA — Risk of Ovarian Malignancy Algorithm: a logistic model combining HE4, CA-125, and menopausal status; high-risk cut-points about 13.1% premenopausal and 27.7% postmenopausal.',
    compute: F.romaOvarian,
    fields: [
      { dom: 'ro-he4', arg: 'he4', kind: 'number', required: true, label: 'HE4', unit: 'pmol/L' },
      { dom: 'ro-ca125', arg: 'ca125', kind: 'number', required: true, label: 'CA-125', unit: 'U/mL' },
      { dom: 'ro-post', arg: 'postmenopausal', kind: 'bool', required: false, label: 'Postmenopausal' },
    ],
  },
  {
    id: 'rmi-ovarian',
    summary: 'Risk of Malignancy Index (RMI = U × M × CA-125) from the ultrasound-feature count, menopausal status, and CA-125; an RMI over 200 is the conventional high-risk threshold.',
    compute: F.rmiOvarian,
    fields: [
      { dom: 'rm-var', arg: 'variant', kind: 'enum', values: ['1', '2', '3'], required: false, label: 'RMI variant (I / II / III)' },
      { dom: 'rm-mult', arg: 'multilocular', kind: 'bool', required: false, label: 'Multilocular cyst' },
      { dom: 'rm-solid', arg: 'solidAreas', kind: 'bool', required: false, label: 'Solid areas' },
      { dom: 'rm-bilat', arg: 'bilateral', kind: 'bool', required: false, label: 'Bilateral lesions' },
      { dom: 'rm-asc', arg: 'ascites', kind: 'bool', required: false, label: 'Ascites' },
      { dom: 'rm-meta', arg: 'metastases', kind: 'bool', required: false, label: 'Intra-abdominal metastases' },
      { dom: 'rm-post', arg: 'postmenopausal', kind: 'bool', required: false, label: 'Postmenopausal' },
      { dom: 'rm-ca125', arg: 'ca125', kind: 'number', required: true, label: 'CA-125', unit: 'U/mL' },
    ],
  },
  {
    id: 'iota-simple-rules',
    summary: 'IOTA Simple Rules: five benign (B) and five malignant (M) ultrasound descriptors; benign if any B and no M, malignant if any M and no B, otherwise inconclusive.',
    compute: F.iotaSimpleRules,
    fields: [
      { dom: 'is-b1', arg: 'b1', kind: 'bool', required: false, label: 'Benign feature B1' },
      { dom: 'is-b2', arg: 'b2', kind: 'bool', required: false, label: 'Benign feature B2' },
      { dom: 'is-b3', arg: 'b3', kind: 'bool', required: false, label: 'Benign feature B3' },
      { dom: 'is-b4', arg: 'b4', kind: 'bool', required: false, label: 'Benign feature B4' },
      { dom: 'is-b5', arg: 'b5', kind: 'bool', required: false, label: 'Benign feature B5' },
      { dom: 'is-m1', arg: 'm1', kind: 'bool', required: false, label: 'Malignant feature M1' },
      { dom: 'is-m2', arg: 'm2', kind: 'bool', required: false, label: 'Malignant feature M2' },
      { dom: 'is-m3', arg: 'm3', kind: 'bool', required: false, label: 'Malignant feature M3' },
      { dom: 'is-m4', arg: 'm4', kind: 'bool', required: false, label: 'Malignant feature M4' },
      { dom: 'is-m5', arg: 'm5', kind: 'bool', required: false, label: 'Malignant feature M5' },
    ],
  },
  {
    id: 'rotterdam-pcos',
    summary: 'Rotterdam PCOS criteria: at least two of oligo-/anovulation, hyperandrogenism, and polycystic ovarian morphology, after exclusion of mimics; reports whether criteria are met and the phenotype.',
    compute: F.rotterdamPcos,
    fields: [
      { dom: 'rp-hyper', arg: 'hyperandrogenism', kind: 'bool', required: false, label: 'Clinical/biochemical hyperandrogenism' },
      { dom: 'rp-oligo', arg: 'oligoAnovulation', kind: 'bool', required: false, label: 'Oligo- or anovulation' },
      { dom: 'rp-pcom', arg: 'pcom', kind: 'bool', required: false, label: 'Polycystic ovarian morphology' },
      { dom: 'rp-excl', arg: 'mimicsExcluded', kind: 'bool', required: false, label: 'Mimics excluded' },
    ],
  },
  {
    id: 'popq-staging',
    summary: 'POP-Q prolapse staging from points Aa, Ba, C, D, Ap, Bp and total vaginal length (cm); the leading (most positive) edge sets the stage 0–IV.',
    compute: F.popqStaging,
    fields: [
      { dom: 'pq-aa', arg: 'aa', kind: 'number', required: true, label: 'Point Aa', unit: 'cm' },
      { dom: 'pq-ba', arg: 'ba', kind: 'number', required: true, label: 'Point Ba', unit: 'cm' },
      { dom: 'pq-c', arg: 'c', kind: 'number', required: true, label: 'Point C', unit: 'cm' },
      { dom: 'pq-d', arg: 'd', kind: 'number', required: false, label: 'Point D (absent after hysterectomy)', unit: 'cm' },
      { dom: 'pq-ap', arg: 'ap', kind: 'number', required: true, label: 'Point Ap', unit: 'cm' },
      { dom: 'pq-bp', arg: 'bp', kind: 'number', required: true, label: 'Point Bp', unit: 'cm' },
      { dom: 'pq-tvl', arg: 'tvl', kind: 'number', required: true, label: 'Total vaginal length', unit: 'cm' },
    ],
  },
];
