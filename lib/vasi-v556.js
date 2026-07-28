// spec-v556: the Vitiligo Area Scoring Index (VASI). WHOLE-CONCEPT GAP: "vasi" and "vitiligo" were both
// zero-hit across corpus.json, app.js and lib/meta.js. The catalog had no vitiligo content of any kind.
//
// VASI = the sum over body regions of (hand units of involvement) x (residual depigmentation).
//
// **DEPIGMENTATION IS A SEVEN-LEVEL ORDINAL LADDER, NOT A FREE PERCENTAGE.** The only permitted values are
// 0, 10, 25, 50, 75, 90 and 100 percent, and the assessor snaps to the nearest by DESCRIPTION rather than
// by measuring: 100 no pigment present, 90 specks of pigment present, 75 depigmented area exceeds pigmented
// area, 50 the two are equal, 25 pigmented area exceeds depigmented area, 10 only specks of depigmentation.
// A field that accepted 63 percent would look more precise and would be scoring a different instrument --
// the ladder is deliberately coarse because the underlying judgment is a visual comparison, not a
// measurement. This lib rejects any other value.
//
// **THE UNIT OF AREA IS A "HAND UNIT" AND IT IS PATIENT-RELATIVE, NOT ABSOLUTE.** One hand unit is the
// PATIENT'S OWN palmar surface including the fingers, defined as 1 percent of their total body surface
// area. It is not a fixed number of square centimetres, and the same patch of skin is a different number of
// hand units on a small child and a large adult. That is intended: the score is a proportion of that
// person's body.
//
// **THE REGION SET DIVERGED AFTER THE ORIGINAL PAPER, AND THIS TILE NAMES THE ONE IT IMPLEMENTS.** The
// original description used FIVE regions -- hands, upper extremities INCLUDING the axillae, trunk, lower
// extremities INCLUDING inguinal regions and buttocks, and feet -- with head and neck added by later work.
// Modern trial protocols use SIX MUTUALLY EXCLUSIVE regions in which the upper extremities EXCLUDE the
// hands and the lower extremities EXCLUDE the feet. Those two sets are not interchangeable: under the
// original five, a hand could be counted both in "hands" and within "upper extremities". This lib
// implements the SIX-REGION MUTUALLY EXCLUSIVE set and says so in the result, because a VASI reported
// without its region set is not reproducible.
//
// **T-VASI AND F-VASI ARE DIFFERENT SCALES AND MUST NOT SHARE A BAND TABLE.** Total-body VASI runs 0 to
// 100; facial VASI runs 0 to 3, because the face is only about 3 percent of body surface area. A facial
// score of 2 is severe; a total-body score of 2 is trivial. This lib computes the TOTAL-BODY score and
// states its range in the result, so the two cannot be silently compared.
//
// HIGHER IS WORSE, and the score FALLS as repigmentation occurs -- it is used in trials as a percent change
// from baseline rather than as a threshold.
//
// HIGH-STAKES: an extent-and-severity measure. It does NOT diagnose vitiligo or distinguish it from the
// other causes of hypopigmentation -- pityriasis alba, tinea versicolor, post-inflammatory hypopigmentation,
// nevus depigmentosus, and in some settings leprosy -- several of which are treated entirely differently. It
// does not assess DISEASE ACTIVITY, which is a separate axis: a large stable patch and a small rapidly
// spreading one can score alike, and activity is what usually drives urgency. It measures neither the
// psychological burden nor the effect on quality of life, which are frequently the reason for treatment and
// track poorly with area. It does not select therapy or phototherapy dosing (spec-v11 section 5.3). The
// treatment decision stays with the clinician.
//
// GRADES, HAND-UNIT DEFINITION AND FORMULA RE-FETCHED, NEVER RECALLED (spec-v97). One fetched source
// contains a typographic error, listing "5%" in its enumeration while defining 25% in its own prose; the
// correct ladder of 0, 10, 25, 50, 75, 90, 100 is confirmed verbatim by an independent second source, so
// the erroneous value is not carried:
//   - Hamzavi I, Jain H, McLean D, Shapiro J, Zeng H, Lui H. Parametric modeling of narrowband UV-B
//     phototherapy for vitiligo using a novel quantitative tool: the Vitiligo Area Scoring Index.
//     Arch Dermatol. 2004;140(6):677-683.
//   - Two independent reviews reproducing the granular depigmentation values and the hand-unit method.

// The six mutually exclusive regions used by modern protocols. Hands and feet are separate from the
// extremities that contain them, which is exactly what distinguishes this set from the original five.
export const VASI_REGIONS = [
  { key: 'headNeck', text: 'Head and neck' },
  { key: 'hands', text: 'Hands' },
  { key: 'upperExtremities', text: 'Upper extremities, EXCLUDING the hands' },
  { key: 'trunk', text: 'Trunk' },
  { key: 'lowerExtremities', text: 'Lower extremities, EXCLUDING the feet' },
  { key: 'feet', text: 'Feet' },
];

// The only permitted depigmentation values, with the descriptions that drive the choice.
export const DEPIGMENTATION_GRADES = [
  { value: 0, text: 'No depigmentation' },
  { value: 10, text: 'Only specks of depigmentation are present' },
  { value: 25, text: 'The pigmented area exceeds the depigmented area' },
  { value: 50, text: 'The depigmented and pigmented areas are equal' },
  { value: 75, text: 'The depigmented area exceeds the pigmented area' },
  { value: 90, text: 'Specks of pigment are present' },
  { value: 100, text: 'No pigment is present' },
];

export const VASI_MAX = 100;          // total-body: 100 hand units at full depigmentation
export const F_VASI_MAX = 3;          // face only, for contrast. Not computed here.
export const MAX_HAND_UNITS = 100;    // one hand unit is 1 percent of body surface area

const HAND_UNIT_TEXT = 'Area is counted in HAND UNITS, where one unit is the PATIENT’S OWN palm including the fingers, taken as 1 percent of their body surface area. It is patient-relative rather than an absolute area, so the same patch is a different number of units on a child and on a large adult.';

const REGION_SET_TEXT = 'Computed over the SIX mutually exclusive regions used by modern protocols, in which the upper extremities exclude the hands and the lower extremities exclude the feet. The original description used five regions, with the head and neck added by later work and without those exclusions, so a VASI reported without naming its region set is not reproducible.';

const SCALE_TEXT = `This is the TOTAL-BODY score, which runs 0 to ${VASI_MAX}. Facial VASI runs 0 to ${F_VASI_MAX}, because the face is only about 3 percent of body surface area, so a facial score of 2 is severe while a total-body score of 2 is trivial. The two are different scales and must not be compared or share a band table.`;

const NOTE = 'The Vitiligo Area Scoring Index (Hamzavi and colleagues 2004) is the sum, over body regions, of the hand units of involvement multiplied by the residual depigmentation in that region. Depigmentation is a seven-level ordinal ladder rather than a free percentage: only 0, 10, 25, 50, 75, 90 and 100 percent are permitted, and the assessor chooses by description rather than measurement, with 100 meaning no pigment present, 90 specks of pigment present, 75 the depigmented area exceeding the pigmented area, 50 the two equal, 25 the pigmented area exceeding the depigmented area, and 10 only specks of depigmentation. A field accepting an arbitrary percentage would look more precise while scoring a different instrument, because the ladder is deliberately coarse: the underlying judgment is a visual comparison. Area is counted in hand units, where one unit is the patient’s own palm including the fingers, taken as 1 percent of their body surface area, so the unit is patient-relative rather than an absolute area. The region set diverged after the original paper: the original used five regions, with upper extremities including the axillae and lower extremities including the inguinal regions and buttocks, and the head and neck added by later work, while modern protocols use six mutually exclusive regions in which the upper extremities exclude the hands and the lower extremities exclude the feet. Those sets are not interchangeable, and this computes the six-region version and says so. Total-body VASI runs 0 to 100 while facial VASI runs 0 to 3, because the face is only about 3 percent of body surface area, so the two are different scales that must not share a band table. Higher is worse, and the score falls as repigmentation occurs; trials use it as a percent change from baseline rather than as a threshold. This measures extent and severity. It does not diagnose vitiligo or distinguish it from the other causes of hypopigmentation, including pityriasis alba, tinea versicolor, post-inflammatory hypopigmentation, nevus depigmentosus and in some settings leprosy, several of which are treated entirely differently. It does not assess disease activity, which is a separate axis: a large stable patch and a small rapidly spreading one can score alike, and activity is usually what drives urgency. It measures neither psychological burden nor quality of life, which are frequently the reason for treatment and track poorly with area. It does not select therapy or phototherapy dosing.';

function readHandUnits(raw) {
  if (raw === '' || raw === null || raw === undefined) return 0;
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0) return NaN;
  return n;
}

function readDepigmentation(raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  const grade = DEPIGMENTATION_GRADES.find((g) => g.value === n);
  return grade ? n : NaN;
}

// input: for each region key K in VASI_REGIONS -- `${K}Area` in hand units and `${K}Depigmentation` as one
// of the seven permitted values. A region left blank contributes 0.
export function vasi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const rows = [];
  for (const region of VASI_REGIONS) {
    const area = readHandUnits(o[`${region.key}Area`]);
    if (Number.isNaN(area)) {
      return { valid: false, message: `The involved area for ${region.text} must be a number of hand units of 0 or more, where one hand unit is 1 percent of body surface area.` };
    }

    const rawDepig = o[`${region.key}Depigmentation`];
    const depigmentation = readDepigmentation(rawDepig);
    if (Number.isNaN(depigmentation)) {
      return { valid: false, message: `Depigmentation for ${region.text} must be one of the seven permitted values: ${DEPIGMENTATION_GRADES.map((g) => g.value).join(', ')}. It is an ordinal ladder chosen by description, not a free percentage.` };
    }
    if (area > 0 && depigmentation === null) {
      return { valid: false, message: `${region.text} has an involved area, so it needs a depigmentation grade: one of ${DEPIGMENTATION_GRADES.map((g) => g.value).join(', ')}.` };
    }

    const effective = depigmentation === null ? 0 : depigmentation;
    rows.push({ key: region.key, area, depigmentation: effective, contribution: area * (effective / 100) });
  }

  // Compared with a tolerance: hand units are entered as fractions, and six regions of 100/6 sum to
  // 100.00000000000001 in floating point, which is not a data-entry error.
  const totalArea = rows.reduce((a, r) => a + r.area, 0);
  if (totalArea > MAX_HAND_UNITS + 1e-9) {
    return { valid: false, message: `The involved areas total ${totalArea} hand units, which exceeds 100. One hand unit is 1 percent of body surface area, so the whole body is 100 units.` };
  }

  const total = rows.reduce((a, r) => a + r.contribution, 0);
  const rounded = Math.round(total * 100) / 100;

  return {
    valid: true,
    total: rounded,
    max: VASI_MAX,
    totalHandUnits: totalArea,
    regions: rows,
    regionSet: 'six-region mutually exclusive',
    bandLabel: `T-VASI ${rounded} of ${VASI_MAX}`,
    bandText: `Total-body VASI ${rounded} of ${VASI_MAX}, from ${totalArea} hand units of involvement. ${SCALE_TEXT} ${HAND_UNIT_TEXT} ${REGION_SET_TEXT} Higher is worse, and the score falls as repigmentation occurs. It measures extent and severity, not disease activity, and does not diagnose vitiligo.`,
    note: NOTE,
  };
}
