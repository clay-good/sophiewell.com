// spec-v605: the Harrington classification of periacetabular metastatic disease. A COMPANION ON A DIFFERENT
// BONE to `mirels-score`, already in the catalog: Mirels grades an IMPENDING PATHOLOGICAL FRACTURE OF A LONG
// BONE, while this classifies ACETABULAR destruction and the reconstruction it demands. Every slug spelling
// and filename search returned 0.
//
// **CLASSES I TO III GRADE BONE DESTRUCTION. CLASS IV DOES NOT, AND IS NOT "WORSE THAN CLASS III".** Classes
// I to III are an ascending ladder of acetabular loss: intact subchondral bone; medial wall and quadrilateral
// plate deficient with the lateral wall and roof spared; and medial wall, lateral wall and roof all
// deficient. CLASS IV IS DEFINED BY THE LESION BEING SOLITARY AND AMENABLE TO EN-BLOC RESECTION WITH
// CURATIVE INTENT -- a statement about the disease ELSEWHERE IN THE BODY and about the TREATMENT GOAL, not
// about the acetabulum at all. The classification therefore changes what it measures between III and IV, and
// CLASS III IS THE ONE DESCRIBED AS MOST CHALLENGING TO RECONSTRUCT.
//
// **A WIDELY REPRODUCED RENDERING RE-DEFINES CLASS IV AS THE MOST DESTRUCTIVE, AND THAT INVERTS ITS
// MEANING.** Some secondary sources describe class IV as "widespread destruction all the way to the wing of
// the ilium". The source that restates the original in order to EXTEND it defines class IV by en-bloc
// resectability of a solitary lesion, and that is what is applied here. A patient classified IV under the
// destruction rendering is being told the opposite of what the original class means: not a hopeless
// acetabulum, but the one patient in the series who might be cured (spec-v97).
//
// **THE CLASSES MAP TO NAMED RECONSTRUCTIONS, NOT TO SEVERITY BANDS.** Each class carries a specific
// construct -- cemented total hip arthroplasty; an anti-protrusion device such as a flanged cup;
// acetabuloplasty with large Steinmann pins; and a saddle prosthesis after resection. The class is a
// statement about what operation the bone will accept, and reading it as a severity grade loses that.
//
// HIGH-STAKES: this classifies a PATTERN OF BONE DESTRUCTION and the reconstruction it demands. It does NOT
// decide whether to operate at all, does not estimate survival -- that is a separate axis, and the catalog's
// `bauer-score`, `tokuhashi-revised` and `tomita-score` cover it -- and does not weigh radiotherapy,
// radiofrequency ablation, cementoplasty or non-operative management against surgery. The named
// reconstructions are the classification's own, from an era before modern implants and systemic therapy, and
// they are reported as provenance rather than as a recommendation (spec-v11 section 5.3).
//
// CLASS DEFINITIONS RE-FETCHED AND ADJUDICATED ACROSS THREE SOURCES, NEVER RECALLED (spec-v97): two
// renderings disagreed on class IV, and a third -- a paper whose purpose is to restate the original
// classification in order to propose an extension to it -- resolved it in favour of the resectability
// definition:
//   - Harrington KD. The management of acetabular insufficiency secondary to metastatic malignant disease.
//     J Bone Joint Surg Am. 1981;63(4):653-664.

export const CLASSES = [
  {
    klass: 'I',
    rank: 1,
    text: 'Intact subchondral bone; a contained cavitary defect with the walls and columns intact',
    gradesDestruction: true,
    reconstruction: 'intralesional excision and conventional cemented total hip arthroplasty',
  },
  {
    klass: 'II',
    rank: 2,
    text: 'Medial wall and quadrilateral plate deficient, with the lateral wall and acetabular roof SPARED',
    gradesDestruction: true,
    reconstruction: 'excision and total hip prosthesis with an anti-protrusion device such as a flanged cup',
  },
  {
    klass: 'III',
    rank: 3,
    text: 'Medial wall, lateral wall AND acetabular roof all deficient',
    gradesDestruction: true,
    reconstruction: 'intralesional excision, total hip prosthesis and acetabuloplasty with large Steinmann pins',
  },
  {
    klass: 'IV',
    rank: 4,
    text: 'A SOLITARY metastasis amenable to en-bloc resection with curative intent - defined by resectability and disease burden, NOT by the extent of acetabular destruction',
    gradesDestruction: false,
    reconstruction: 'en-bloc resection, with reconstruction such as a saddle prosthesis',
  },
];

export const HARDEST_CLASS = 'III';

export const INTENT_NOTE = 'Classes I to III grade bone destruction. CLASS IV DOES NOT, and is not "worse than class III": it is defined by the lesion being SOLITARY and amenable to en-bloc resection with curative intent - a statement about the disease elsewhere in the body and about the treatment goal, not about the acetabulum. The classification changes what it measures between III and IV.';
export const CORRUPTION_NOTE = 'A widely reproduced rendering re-defines class IV as "widespread destruction all the way to the wing of the ilium", which INVERTS its meaning. The source that restates the original in order to extend it defines class IV by en-bloc resectability of a solitary lesion, and that is what is applied here. Under the destruction rendering a patient is told the opposite of what the class means: not a hopeless acetabulum, but the one patient who might be cured.';
export const HARDEST_NOTE = `Because class IV is about resectability rather than destruction, CLASS ${HARDEST_CLASS} is the one described as the most challenging to reconstruct - not class IV.`;
export const RECONSTRUCTION_NOTE = 'The classes map to NAMED RECONSTRUCTIONS rather than to severity bands: cemented total hip arthroplasty; an anti-protrusion device such as a flanged cup; acetabuloplasty with large Steinmann pins; and a saddle prosthesis after resection. The class states what operation the bone will accept.';

const NOTE = `The Harrington classification (Harrington 1981) describes periacetabular metastatic destruction and the reconstruction it demands. Class I has intact subchondral bone, a contained cavitary defect with walls and columns intact, and is managed with intralesional excision and conventional cemented total hip arthroplasty. Class II has a deficient medial wall and quadrilateral plate with the lateral wall and roof spared, and calls for an anti-protrusion device such as a flanged cup. Class III has the medial wall, lateral wall and acetabular roof all deficient, and calls for acetabuloplasty with large Steinmann pins alongside a total hip prosthesis. Class IV is a solitary metastasis amenable to en-bloc resection with curative intent, reconstructed with something such as a saddle prosthesis. Classes I to III grade bone destruction and class IV does not: it is defined by resectability and by the disease burden elsewhere rather than by the acetabulum, so the classification changes what it measures between III and IV, class IV is not worse than class III, and class ${HARDEST_CLASS} is the one described as the most challenging to reconstruct. A widely reproduced rendering re-defines class IV as widespread destruction reaching the wing of the ilium, which inverts its meaning; the definition applied here is the one given by the source that restates the original in order to extend it. The classes map to named reconstructions rather than severity bands, so the class states what operation the bone will accept. This classifies a pattern of bone destruction and the reconstruction it demands. It does not decide whether to operate at all, does not estimate survival, which is a separate axis covered by other tiles in this catalog, and does not weigh radiotherapy, radiofrequency ablation, cementoplasty or non-operative management against surgery. The named reconstructions are the classification's own, from an era before modern implants and systemic therapy, and are reported as provenance rather than as a recommendation.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: solitaryResectableForCure, medialWallDeficient, lateralWallOrRoofDeficient.
export function harringtonAcetabular(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let solitary, medial, lateral;
  try {
    solitary = readBool(o.solitaryResectableForCure, 'Solitary lesion resectable with curative intent');
    medial = readBool(o.medialWallDeficient, 'Medial wall or quadrilateral plate deficient');
    lateral = readBool(o.lateralWallOrRoofDeficient, 'Lateral wall or acetabular roof deficient');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (solitary === null || medial === null || lateral === null) {
    return { valid: false, message: 'Answer all three. Note that the solitary-and-resectable question decides class IV on its own, because class IV is defined by resectability and NOT by the extent of acetabular destruction.' };
  }

  let klass;
  if (solitary) klass = 'IV';
  else if (lateral) klass = 'III';
  else if (medial) klass = 'II';
  else klass = 'I';

  const entry = CLASSES.find((c) => c.klass === klass);
  const assignedByIntent = klass === 'IV';
  // What the destruction ladder alone would have given, carried so the override is visible.
  const destructionOnlyClass = lateral ? 'III' : (medial ? 'II' : 'I');

  const parts = [];
  parts.push(`Harrington class ${klass}: ${entry.text}.`);
  parts.push(`Reconstruction described for this class: ${entry.reconstruction}.`);
  if (assignedByIntent) {
    parts.push(`THIS CLASS WAS ASSIGNED BY RESECTABILITY AND INTENT, NOT BY DESTRUCTION. On the destruction ladder alone this acetabulum would be class ${destructionOnlyClass}. ${INTENT_NOTE}`);
    parts.push(CORRUPTION_NOTE);
  } else {
    parts.push(INTENT_NOTE);
  }
  parts.push(HARDEST_NOTE);
  parts.push(RECONSTRUCTION_NOTE);
  parts.push('This classifies a pattern of bone destruction and the reconstruction it demands. It does not decide whether to operate, does not estimate survival, and does not weigh radiotherapy, ablation, cementoplasty or non-operative management against surgery. The named reconstructions are the classification’s own, from an era before modern implants, and are provenance rather than a recommendation.');

  return {
    valid: true,
    class: klass,               // a Roman numeral STRING
    rank: entry.rank,
    definition: entry.text,
    reconstruction: entry.reconstruction,
    gradesDestruction: entry.gradesDestruction,
    assignedByIntent,
    destructionOnlyClass,
    hardestToReconstruct: HARDEST_CLASS,
    band: `Harrington class ${klass}`,
    bandLabel: `Harrington class ${klass}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
