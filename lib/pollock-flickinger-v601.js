// spec-v601: the Pollock-Flickinger radiosurgery-based AVM score, in both its original and modified forms.
// An AXIS GAP: `spetzler-ponce` is already in the catalog and grades MICROSURGICAL risk. This grades the
// expected outcome of STEREOTACTIC RADIOSURGERY -- a different treatment, a different question, and a
// different answer for the same malformation. Every slug spelling and filename search returned 0.
//
// **THE MODIFICATION CHANGED NO COEFFICIENT. IT HALVED THE LOCATION VARIABLE'S RANGE.** Both versions are
// 0.1 x volume + 0.02 x age + 0.3 x location. What changed is that LOCATION went from a THREE-tier variable
// (0, 1, 2) to a TWO-tier one (0, 1), so its maximum contribution fell from 0.6 to 0.3. A widely circulated
// rendering states the modified coefficient as 0.5; both primary abstracts state 0.3, and 0.3 is applied
// here with the divergence disclosed (spec-v97).
//
// **THE MODIFIED SCORE IS EXACTLY 0.3 LOWER THAN THE ORIGINAL FOR EVERY LOCATION EXCEPT FRONTAL AND
// TEMPORAL.** This is the consequence and it is exactly computable. A parietal, occipital, corpus callosum
// or cerebellar AVM scored 1 originally (0.3) and scores 0 in the modification. A basal ganglia, thalamic or
// brainstem AVM scored 2 (0.6) and now scores 1 (0.3). Only frontal and temporal lesions are unchanged, at
// 0 in both. Because the outcome bands sit at 1.00, 1.50 and 2.00, A CONSTANT SHIFT OF 0.3 CAN MOVE A
// PATIENT A WHOLE BAND, and this lib reports both scores, the difference, and whether the band changed.
//
// **INTRAVENTRICULAR LOCATION HAS NO HOME IN THE MODIFIED LIST.** The original names it explicitly in tier
// 1. The modified list names hemispheric, corpus callosum and cerebellar for 0, and basal ganglia, thalamus
// and brainstem for 1 -- and does not mention intraventricular at all. That is the source's own hole; this
// lib reports it rather than assigning a tier by analogy.
//
// **THE PUBLISHED OUTCOME BANDS OVERLAP AT EXACTLY 2.00.** They are printed as 1.51 to 2.00 and "2.00 or
// more", so a score of exactly 2.00 appears in two rows. The higher band is applied here, and the overlap is
// stated rather than hidden.
//
// **IT IS A CONTINUOUS SCORE, NOT A GRADE.** There is no maximum: volume and age are unbounded inputs, so
// the score has no ceiling and no "x of y" reading. That is the opposite of the Spetzler-Ponce grade beside
// it, which is a small ordinal.
//
// HIGH-STAKES: this predicts the outcome of RADIOSURGERY at a group level for a patient in whom radiosurgery
// is already being considered. It does NOT choose between radiosurgery, microsurgery, embolization and
// observation -- and observation is a real option, since the ARUBA trial found medical management superior
// to intervention for UNRUPTURED AVMs over its follow-up. It does not plan a dose or a target volume, does
// not estimate rupture risk without treatment, and a favourable score is NOT by itself an indication to
// treat (spec-v11 section 5.3).
//
// BOTH FORMULAS AND BOTH LOCATION LADDERS RE-FETCHED AND CONFIRMED FROM THE TWO PRIMARY ABSTRACTS
// THEMSELVES, NEVER RECALLED (spec-v97):
//   - Pollock BE, Flickinger JC. A proposed radiosurgery-based grading system for arteriovenous
//     malformations. J Neurosurg. 2002;96(1):79-85.
//   - Pollock BE, Flickinger JC. Modification of the radiosurgery-based arteriovenous malformation grading
//     system. Neurosurgery. 2008;63(2):239-243.

export const VOLUME_COEFFICIENT = 0.1;
export const AGE_COEFFICIENT = 0.02;
export const LOCATION_COEFFICIENT = 0.3;
export const DIVERGENT_LOCATION_COEFFICIENT = 0.5;   // the rendering that is not applied

// The original three-tier location ladder.
export const ORIGINAL_LOCATIONS = [
  { value: 'frontal-temporal', tier: 0, text: 'Frontal or temporal' },
  { value: 'parietal-occipital-intraventricular-callosal-cerebellar', tier: 1, text: 'Parietal, occipital, intraventricular, corpus callosum or cerebellar' },
  { value: 'basal-ganglia-thalamus-brainstem', tier: 2, text: 'Basal ganglia, thalamus or brainstem' },
];
// The modified two-tier ladder. Intraventricular is absent from the source's list.
export const MODIFIED_LOCATIONS = [
  { value: 'hemispheric-callosal-cerebellar', tier: 0, text: 'Hemispheric, corpus callosum or cerebellar' },
  { value: 'basal-ganglia-thalamus-brainstem', tier: 1, text: 'Basal ganglia, thalamus or brainstem' },
];

// How an anatomical site maps into each ladder. `modifiedTier: null` marks the source's hole.
export const SITES = [
  { value: 'frontal', text: 'Frontal', originalTier: 0, modifiedTier: 0 },
  { value: 'temporal', text: 'Temporal', originalTier: 0, modifiedTier: 0 },
  { value: 'parietal', text: 'Parietal', originalTier: 1, modifiedTier: 0 },
  { value: 'occipital', text: 'Occipital', originalTier: 1, modifiedTier: 0 },
  { value: 'corpus-callosum', text: 'Corpus callosum', originalTier: 1, modifiedTier: 0 },
  { value: 'cerebellar', text: 'Cerebellar', originalTier: 1, modifiedTier: 0 },
  { value: 'intraventricular', text: 'Intraventricular', originalTier: 1, modifiedTier: null },
  { value: 'basal-ganglia', text: 'Basal ganglia', originalTier: 2, modifiedTier: 1 },
  { value: 'thalamus', text: 'Thalamus', originalTier: 2, modifiedTier: 1 },
  { value: 'brainstem', text: 'Brainstem', originalTier: 2, modifiedTier: 1 },
];

// Outcome bands from the modification paper. The published rows overlap at exactly 2.00.
export const OUTCOME_BANDS = [
  { max: 1.00, label: '1.00 or less', obliterationWithoutDeficit: 89, mrsDecline: 0 },
  { max: 1.50, label: '1.01 to 1.50', obliterationWithoutDeficit: 70, mrsDecline: 13 },
  { max: 2.00, label: '1.51 to 2.00', obliterationWithoutDeficit: 64, mrsDecline: 20 },
  { max: Infinity, label: '2.00 or more', obliterationWithoutDeficit: 46, mrsDecline: 36 },
];

export const COEFFICIENT_NOTE = `The modification changed NO coefficient. Both versions are ${VOLUME_COEFFICIENT} x volume + ${AGE_COEFFICIENT} x age + ${LOCATION_COEFFICIENT} x location. What changed is that LOCATION went from a THREE-tier variable to a TWO-tier one, halving its maximum contribution from 0.6 to ${LOCATION_COEFFICIENT}. A widely circulated rendering states the modified coefficient as ${DIVERGENT_LOCATION_COEFFICIENT}; both primary abstracts state ${LOCATION_COEFFICIENT}, which is what is applied here.`;
export const SHIFT_NOTE = `The modified score is exactly ${LOCATION_COEFFICIENT} lower than the original for every location EXCEPT frontal and temporal, which are unchanged at tier 0 in both. Because the outcome bands sit at 1.00, 1.50 and 2.00, a constant shift of ${LOCATION_COEFFICIENT} can move a patient a whole band.`;
export const INTRAVENTRICULAR_NOTE = 'Intraventricular location has NO home in the modified list. The original names it explicitly in tier 1; the modified list names hemispheric, corpus callosum and cerebellar for 0 and basal ganglia, thalamus and brainstem for 1, and does not mention intraventricular at all. That is the source’s own hole, reported rather than filled by analogy.';
export const OVERLAP_NOTE = 'The published outcome bands OVERLAP at exactly 2.00: they are printed as "1.51 to 2.00" and "2.00 or more", so a score of exactly 2.00 appears in two rows. The higher band is applied here.';
export const CONTINUOUS_NOTE = 'It is a CONTINUOUS score, not a grade. Volume and age are unbounded, so there is no maximum and no "x of y" reading - the opposite of the Spetzler-Ponce grade beside it, which is a small ordinal.';

const NOTE = `The Pollock-Flickinger radiosurgery-based AVM score predicts the outcome of stereotactic radiosurgery for a brain arteriovenous malformation, as ${VOLUME_COEFFICIENT} times the volume in cubic centimeters plus ${AGE_COEFFICIENT} times the age in years plus ${LOCATION_COEFFICIENT} times a location tier. The 2008 modification changed no coefficient: it reduced location from a three-tier variable, where frontal or temporal scored 0, parietal, occipital, intraventricular, corpus callosum or cerebellar scored 1 and basal ganglia, thalamus or brainstem scored 2, to a two-tier one where hemispheric, corpus callosum or cerebellar scores 0 and basal ganglia, thalamus or brainstem scores 1. The consequence is exact: the modified score is ${LOCATION_COEFFICIENT} lower than the original for every location except frontal and temporal, and because the outcome bands sit at 1.00, 1.50 and 2.00 that constant shift can move a patient a whole band. A widely circulated rendering gives the modified location coefficient as ${DIVERGENT_LOCATION_COEFFICIENT}; both primary abstracts give ${LOCATION_COEFFICIENT}. Intraventricular location has no home in the modified list, which is the source's own hole and is reported rather than filled. The published outcome bands overlap at exactly 2.00. Reported outcomes by modified score are 89 percent obliteration without new deficit at 1.00 or less, 70 percent from 1.01 to 1.50, 64 percent from 1.51 to 2.00 and 46 percent at 2.00 or more, with decline in the modified Rankin scale of 0, 13, 20 and 36 percent across the same bands. It is a continuous score with no maximum, unlike the Spetzler-Ponce grade in this catalog, which grades MICROSURGICAL risk and answers a different question about the same malformation. This predicts the outcome of radiosurgery at a group level for a patient in whom radiosurgery is already being considered. It does not choose between radiosurgery, microsurgery, embolization and observation, and observation is a real option, since the ARUBA trial found medical management superior to intervention for unruptured malformations over its follow-up. It does not plan a dose or a target volume, does not estimate rupture risk without treatment, and a favorable score is not by itself an indication to treat.`;

function readNum(v, name, { min = 0 } = {}) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n <= min) throw new Error(`${name} must be a number above ${min}.`);
  return n;
}
const round2 = (n) => Number(n.toFixed(2));
const bandFor = (score) => OUTCOME_BANDS.find((b) => score <= b.max);

// input: volume (cm^3), age (years), site (one of SITES).
export function pollockFlickinger(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let volume, age, site;
  try {
    volume = readNum(o.volume, 'AVM volume');
    age = readNum(o.age, 'Age');
    site = o.site === '' || o.site === undefined || o.site === null ? null : String(o.site).trim();
    if (site !== null && !SITES.some((s) => s.value === site)) {
      throw new Error(`Site must be one of: ${SITES.map((s) => s.value).join(', ')}.`);
    }
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (volume === null || age === null || site === null) {
    return { valid: false, message: 'Enter the AVM volume in cubic centimeters, the age in years, and the anatomical site. The site is scored differently by the two versions, which is the whole point of the comparison.' };
  }

  const entry = SITES.find((s) => s.value === site);
  const base = VOLUME_COEFFICIENT * volume + AGE_COEFFICIENT * age;
  const original = round2(base + LOCATION_COEFFICIENT * entry.originalTier);
  const modifiedAvailable = entry.modifiedTier !== null;
  const modified = modifiedAvailable ? round2(base + LOCATION_COEFFICIENT * entry.modifiedTier) : null;

  const difference = modifiedAvailable ? round2(original - modified) : null;
  const originalBand = bandFor(original);
  const modifiedBand = modifiedAvailable ? bandFor(modified) : null;
  const bandChanged = modifiedAvailable && originalBand.label !== modifiedBand.label;
  const atOverlapBoundary = original === 2 || modified === 2;

  const parts = [];
  parts.push(modifiedAvailable
    ? `Modified score ${modified}; original score ${original}.`
    : `Original score ${original}. THE MODIFIED SCORE CANNOT BE COMPUTED for this site.`);
  if (!modifiedAvailable) {
    parts.push(INTRAVENTRICULAR_NOTE);
  } else {
    parts.push(difference > 0
      ? `The modified score is ${difference} lower, because ${entry.text.toLowerCase()} drops from tier ${entry.originalTier} to tier ${entry.modifiedTier}. ${SHIFT_NOTE}`
      : `The two scores are identical, because ${entry.text.toLowerCase()} is tier 0 in both ladders. ${SHIFT_NOTE}`);
    if (bandChanged) {
      parts.push(`THE VERSIONS PUT THIS PATIENT IN DIFFERENT OUTCOME BANDS: ${originalBand.label} by the original and ${modifiedBand.label} by the modification, which is ${originalBand.obliterationWithoutDeficit} percent against ${modifiedBand.obliterationWithoutDeficit} percent obliteration without new deficit.`);
    }
    parts.push(`By the modified score, the reported outcome band is ${modifiedBand.label}: ${modifiedBand.obliterationWithoutDeficit} percent obliteration without new deficit and ${modifiedBand.mrsDecline} percent decline in the modified Rankin scale.`);
  }
  if (atOverlapBoundary) parts.push(OVERLAP_NOTE);
  parts.push(COEFFICIENT_NOTE);
  parts.push(CONTINUOUS_NOTE);
  parts.push('This predicts the outcome of RADIOSURGERY at a group level. It does not choose between radiosurgery, microsurgery, embolization and observation - and observation is a real option, since the ARUBA trial found medical management superior to intervention for unruptured malformations over its follow-up. It does not plan a dose or a target volume and does not estimate rupture risk without treatment.');

  return {
    valid: true,
    original,
    modified,
    modifiedAvailable,
    difference,
    site: entry.text,
    originalTier: entry.originalTier,
    modifiedTier: entry.modifiedTier,
    originalBand: originalBand.label,
    modifiedBand: modifiedBand ? modifiedBand.label : null,
    bandChanged,
    obliterationWithoutDeficitPercent: modifiedBand ? modifiedBand.obliterationWithoutDeficit : null,
    mrsDeclinePercent: modifiedBand ? modifiedBand.mrsDecline : null,
    atOverlapBoundary,
    band: modifiedAvailable ? `Modified score ${modified}` : `Original score ${original}, modified not computable`,
    bandLabel: modifiedAvailable ? `Modified ${modified} / original ${original}` : `Original ${original}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
