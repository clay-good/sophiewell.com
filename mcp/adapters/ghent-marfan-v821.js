// spec-v821 MCP adapter: revised Ghent nosology in lib/ghent-marfan-v821.js.
// The dom keys mirror the browser renderer (views/group-v821.js) and
// META['ghent-marfan'].example. fbn1 is a THREE-way enum, not a boolean, because a mutation
// known to be associated with aortic disease and one not known with it give different
// diagnoses in the same patient. Clinical domain.

import { ghentMarfan } from '../../lib/ghent-marfan-v821.js';

export default [
  {
    id: 'ghent-marfan',
    summary: 'Applies the revised Ghent nosology for Marfan syndrome. Returns one of four diagnoses - Marfan syndrome, ectopia lentis syndrome, MASS phenotype or mitral valve prolapse syndrome - from the aortic root Z score, ectopia lentis, FBN1 status, family history and the 20-point systemic score. Note the aortic threshold rises to Z 3 under age 20 when there is a family history, and that FBN1 has three states, not two.',
    compute: ghentMarfan,
    fields: [
      { dom: 'gm-z', arg: 'aorticZScore', kind: 'number', required: false, label: 'Aortic root Z score' },
      { dom: 'gm-el', arg: 'ectopiaLentis', kind: 'boolean', required: false, label: 'Ectopia lentis' },
      { dom: 'gm-fh', arg: 'familyHistory', kind: 'boolean', required: false, label: 'Family history of Marfan syndrome' },
      { dom: 'gm-age', arg: 'age', kind: 'number', required: false, label: 'Age in years' },
      { dom: 'gm-fbn1', arg: 'fbn1', kind: 'enum', required: false, label: 'FBN1 status', values: ['none', 'known-with-ao', 'not-known-with-ao'] },
      { dom: 'gm-wristthumb', arg: 'wristThumb', kind: 'enum', required: false, label: 'Wrist and thumb signs', values: ['none', 'one', 'both'] },
      { dom: 'gm-pectus', arg: 'pectus', kind: 'enum', required: false, label: 'Chest wall', values: ['none', 'excavatum', 'carinatum'] },
      { dom: 'gm-hindfoot', arg: 'hindfoot', kind: 'enum', required: false, label: 'Foot', values: ['none', 'planus', 'deformity'] },
      { dom: 'gm-pneumothorax', arg: 'pneumothorax', kind: 'boolean', required: false, label: 'Spontaneous pneumothorax' },
      { dom: 'gm-dural', arg: 'duralEctasia', kind: 'boolean', required: false, label: 'Dural ectasia' },
      { dom: 'gm-protrusio', arg: 'protrusioAcetabuli', kind: 'boolean', required: false, label: 'Protrusio acetabuli' },
      { dom: 'gm-segment', arg: 'segmentRatio', kind: 'boolean', required: false, label: 'Segment ratio and arm span' },
      { dom: 'gm-scoliosis', arg: 'scoliosis', kind: 'boolean', required: false, label: 'Scoliosis or thoracolumbar kyphosis' },
      { dom: 'gm-elbow', arg: 'reducedElbowExtension', kind: 'boolean', required: false, label: 'Reduced elbow extension' },
      { dom: 'gm-facial', arg: 'facialFeatures', kind: 'boolean', required: false, label: 'Facial features, 3 of 5' },
      { dom: 'gm-striae', arg: 'skinStriae', kind: 'boolean', required: false, label: 'Skin striae' },
      { dom: 'gm-myopia', arg: 'myopia', kind: 'boolean', required: false, label: 'Myopia over 3 diopters' },
      { dom: 'gm-mvp', arg: 'mvp', kind: 'boolean', required: false, label: 'Mitral valve prolapse' },
      { dom: 'gm-differential', arg: 'differentialExcluded', kind: 'boolean', required: false, label: 'Differential excluded' },
    ],
  },
];
