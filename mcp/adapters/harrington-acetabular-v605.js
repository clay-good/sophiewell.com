// spec-v605 MCP wave: adapter for the Harrington classification in lib/harrington-acetabular-v605.js. The
// dom keys mirror the browser renderer (views/group-v605.js) and META['harrington-acetabular'].example.
//
// **CLASSES I TO III GRADE BONE DESTRUCTION. CLASS IV DOES NOT, AND IS NOT "WORSE THAN CLASS III".** Class
// IV is defined by the lesion being SOLITARY and amenable to EN-BLOC RESECTION WITH CURATIVE INTENT - a
// statement about the disease ELSEWHERE and the TREATMENT GOAL, not about the acetabulum. A solitary
// resectable lesion in an INTACT acetabulum is class IV, and `destructionOnlyClass` reports what the
// destruction ladder alone would have given. `assignedByIntent` flags it.
//
// **A WIDELY REPRODUCED RENDERING RE-DEFINES CLASS IV AS THE MOST DESTRUCTIVE** ("widespread destruction all
// the way to the wing of the ilium"), which INVERTS its meaning: under the original, class IV is not a
// hopeless acetabulum but the one patient who might be cured. The resectability definition is applied here.
//
// **CLASS III, NOT CLASS IV, IS THE ONE DESCRIBED AS MOST CHALLENGING TO RECONSTRUCT** - which follows
// directly from class IV not being a destruction level.
//
// **THE CLASSES MAP TO NAMED RECONSTRUCTIONS, NOT SEVERITY BANDS**: cemented THA; an anti-protrusion device
// such as a flanged cup; acetabuloplasty with large Steinmann pins; a saddle prosthesis after resection.
//
// NOT MIRELS. `mirels-score` grades an IMPENDING PATHOLOGICAL FRACTURE OF A LONG BONE; this classifies
// ACETABULAR destruction. Different bone, different question.

import * as H from '../../lib/harrington-acetabular-v605.js';

export default [
  {
    id: 'harrington-acetabular',
    summary: `The Harrington classification of periacetabular metastatic disease (Harrington 1981). THE CLASSES: ${H.CLASSES.map((c) => `${c.klass} = ${c.text} (described reconstruction: ${c.reconstruction})`).join('; ')}. **CLASSES I TO III GRADE BONE DESTRUCTION. CLASS IV DOES NOT, AND IS NOT "WORSE THAN CLASS III"** - it is defined by the lesion being SOLITARY and amenable to EN-BLOC RESECTION WITH CURATIVE INTENT, a statement about the disease ELSEWHERE IN THE BODY and about the TREATMENT GOAL rather than about the acetabulum. **A SOLITARY RESECTABLE LESION IN AN INTACT ACETABULUM IS CLASS IV**; \`assignedByIntent\` flags that case and \`destructionOnlyClass\` reports what the destruction ladder alone would have given. **A WIDELY REPRODUCED RENDERING RE-DEFINES CLASS IV AS THE MOST DESTRUCTIVE** ("widespread destruction all the way to the wing of the ilium"), which **INVERTS ITS MEANING**: under the original, class IV is not a hopeless acetabulum but the one patient who might be CURED. The resectability definition is applied here, adjudicated against a source whose purpose is to restate the original in order to extend it. **CLASS ${H.HARDEST_CLASS}, NOT CLASS IV, IS THE ONE DESCRIBED AS MOST CHALLENGING TO RECONSTRUCT**, which follows directly from class IV not being a destruction level. **THE CLASSES MAP TO NAMED RECONSTRUCTIONS, NOT SEVERITY BANDS** - the class states what operation the bone will accept. **NOT MIRELS**: \`mirels-score\` in this catalog grades an IMPENDING PATHOLOGICAL FRACTURE OF A LONG BONE, a different bone and a different question. This classifies a PATTERN OF BONE DESTRUCTION and the reconstruction it demands. It does NOT decide whether to operate at all, does NOT estimate survival - a separate axis covered by \`bauer-score\`, \`tokuhashi-revised\` and \`tomita-score\` - and does NOT weigh radiotherapy, radiofrequency ablation, cementoplasty or non-operative management against surgery. The named reconstructions are the classification's own, from an era before modern implants and systemic therapy, and are PROVENANCE rather than a recommendation.`,
    compute: H.harringtonAcetabular,
    fields: [
      {
        dom: 'harr-solitary', arg: 'solitaryResectableForCure', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'A SOLITARY metastasis amenable to en-bloc resection with curative intent. THIS DECIDES CLASS IV ON ITS OWN, regardless of how intact the acetabulum is - class IV is defined by resectability, NOT by destruction.',
      },
      {
        dom: 'harr-medial', arg: 'medialWallDeficient', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Medial wall or quadrilateral plate deficient. With the lateral wall and roof spared this gives class II.',
      },
      {
        dom: 'harr-lateral', arg: 'lateralWallOrRoofDeficient', kind: 'enum', values: ['no', 'yes'], required: true,
        label: `Lateral wall or acetabular roof deficient. This gives class III - the class described as MOST CHALLENGING to reconstruct.`,
      },
    ],
  },
];
