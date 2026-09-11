// spec-v1241: the AO Spine Thoracolumbar Injury Classification, and the TL AOSIS severity score
// that is summed from it.
//
// Sources:
//   Vaccaro AR, Oner C, Kepler CK, et al. AOSpine thoracolumbar spine injury classification system:
//   fracture description, neurological status, and key modifiers. Spine. 2013;38(23):2028-2037.
//   PMID 23970107 -- the classification.
//   Kepler CK, Vaccaro AR, Schroeder GD, et al. The Thoracolumbar AOSpine Injury Score. Global Spine
//   J. 2016;6(4):329-334. PMC4868575 -- the point values, reproduced below from its own table.
//   Lambrechts MJ, Schroeder GD, Tran K, et al. Validation of the AO Spine Thoracolumbar Injury
//   Classification System Treatment Algorithm. Spine. 2023;48(14):994-1002. PMID 37141491 -- the
//   thresholds, which the scoring paper deliberately did not publish.
//
// THE SCORING PAPER PUBLISHED NO THRESHOLDS. Kepler 2016 gives the points and says in as many words
// that the surgical thresholds "will be established later". The <=3 / 4-5 / >=6 bands quoted here
// are Lambrechts 2023's, applied to 815 injuries. Attaching them to Kepler would credit a paper with
// a recommendation it declined to make, so the tile names which paper each half comes from.
//
// M2 IS WORTH ZERO POINTS AND STILL MATTERS. A patient-specific comorbidity -- ankylosing
// spondylitis, DISH, severe osteoporosis -- changes the operation without changing the score. A tool
// that only printed the total would make M2 look like nothing was entered.
//
// THIS IS NOT TLICS. `tlics` is in this catalog and is a different system with a different score and
// different thresholds; the two agree often and not always. Neither converts into the other.
//
// Pure: no DOM, no clock, no network.

import { AO_NEURO, parseNeuro, isBlank, NEURO_UNEXAMINABLE_NOTE, AO_POSTURE_NOTE } from './ao-spine-neuro-v1241.js';

export { AO_NEURO };

export const AO_TL_NOTE = 'The AO Spine thoracolumbar classification (Vaccaro 2013) describes an injury as a morphology type, a neurological status, and case-specific modifiers. The TL AOSIS severity score (Kepler 2016) assigns points to each and sums them; the treatment bands below 4 and from 6 upward come from a later validation (Lambrechts 2023), because the scoring paper published no thresholds of its own. It is a different system from TLICS, which this catalog also carries, and the two do not convert into one another.';

// Kepler 2016, Table: morphology points.
export const AO_TL_MORPHOLOGY = [
  { value: 'A0', text: 'A0 - no injury, or a minor non-structural fracture (transverse or spinous process)', points: 0 },
  { value: 'A1', text: 'A1 - wedge compression of one endplate, posterior wall intact', points: 1 },
  { value: 'A2', text: 'A2 - split or pincer fracture through both endplates, posterior wall intact', points: 2 },
  { value: 'A3', text: 'A3 - incomplete burst: one endplate, with the posterior wall involved', points: 3 },
  { value: 'A4', text: 'A4 - complete burst: both endplates, with the posterior wall involved', points: 5 },
  { value: 'B1', text: 'B1 - transosseous tension band disruption (Chance fracture)', points: 5 },
  { value: 'B2', text: 'B2 - posterior tension band disruption, with or without a type A fracture', points: 6 },
  { value: 'B3', text: 'B3 - hyperextension injury: anterior tension band disrupted, posterior hinge intact', points: 7 },
  { value: 'C', text: 'C - displacement or translation in any plane', points: 8 },
];

// Kepler 2016: M1 scores, M2 does not.
export const AO_TL_MODIFIERS = [
  { key: 'm1', code: 'M1', points: 1, label: 'M1 - posterior ligamentous complex injury that imaging leaves indeterminate' },
  { key: 'm2', code: 'M2', points: 0, label: 'M2 - patient-specific comorbidity (ankylosing spondylitis, DISH, severe osteoporosis, burns)' },
];

const MORPH_BY_VALUE = new Map(AO_TL_MORPHOLOGY.map((m) => [m.value, m]));

// Lambrechts 2023, 815 injuries.
const BANDS = [
  { max: 3, label: 'conservative treatment preferred', text: 'A TL AOSIS of 3 or less was managed non-operatively in 99% of the 815 injuries Lambrechts 2023 reviewed.' },
  { max: 5, label: 'either treatment is considered appropriate', text: 'A TL AOSIS of 4 or 5 is the indeterminate band: both operative and non-operative management are considered appropriate, and 75% of these injuries were in fact managed non-operatively.' },
  { max: Infinity, label: 'surgical treatment preferred', text: 'A TL AOSIS of 6 or more is the band where surgery is the preferred initial management; 87% of these injuries were managed operatively.' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function aoSpineTl(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  if (isBlank(o.morphology)) {
    return { valid: false, message: 'Choose the morphology type (A0 to A4, B1 to B3, or C). It is the one part of the code that has no default.' };
  }
  const morph = MORPH_BY_VALUE.get(String(o.morphology).trim().toUpperCase());
  if (!morph) {
    return { valid: false, message: 'The morphology type must be one of A0, A1, A2, A3, A4, B1, B2, B3 or C.' };
  }

  // Neurology is its own question and its own refusal: a missing N is not an N0. Scoring a blank as
  // "neurologically intact" would move a cord injury's 4 points to zero and, at the bands below,
  // move the answer a whole category (spec-v1194's family rule).
  if (isBlank(o.neuro)) {
    return {
      valid: false,
      message: 'Choose the neurological status (N0 to N4, or NX if the patient cannot be examined). A blank is not an N0, and the difference is four points.',
    };
  }
  const neuro = parseNeuro(o.neuro);
  if (!neuro) {
    return { valid: false, message: 'The neurological status must be one of N0, N1, N2, N3, N4 or NX.' };
  }

  const modifiers = AO_TL_MODIFIERS.filter((m) => on(o[m.key]));
  const modifierPoints = modifiers.reduce((t, m) => t + m.points, 0);
  const score = morph.points + neuro.points + modifierPoints;

  const band = BANDS.find((b) => score <= b.max);
  const code = `${morph.value} ${neuro.value}${modifiers.length ? ` ${modifiers.map((m) => m.code).join(' ')}` : ''}`;

  // M2 scores nothing, so the total alone hides it. Say it where the total is read.
  const unscoredModifier = modifiers.some((m) => m.points === 0)
    ? 'M2 was recorded and adds no points. It is a comorbidity that changes the operation rather than the injury, so the score is unchanged and the decision it bears on is not.'
    : null;

  return {
    valid: true,
    code,
    morphology: morph.value,
    neuro: neuro.value,
    modifiers: modifiers.map((m) => m.code),
    parts: { morphology: morph.points, neuro: neuro.points, modifiers: modifierPoints },
    score,
    abnormal: score >= 6,
    bandLabel: `TL AOSIS ${score}`,
    band: `AO Spine ${code}, TL AOSIS ${score} of a possible 13: ${band.label}. ${band.text}`,
    // Where each half of the answer came from, because they came from different papers.
    provenanceNote: 'The points are Kepler 2016’s. The treatment bands are Lambrechts 2023’s: the scoring paper published points and said its surgical thresholds would be established later.',
    unscoredModifier,
    neuroNote: neuro.value === 'NX' ? NEURO_UNEXAMINABLE_NOTE : null,
    tlicsNote: 'TLICS is a different system, also in this catalog, with its own score and its own thresholds. The two agree often and not always, and neither converts into the other.',
    postureNote: AO_POSTURE_NOTE,
    note: AO_TL_NOTE,
  };
}
