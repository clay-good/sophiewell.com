// spec-v602: the Virginia Radiosurgery AVM Scale (VRAS). A COMPANION WITH A DIFFERENT CONSTRUCTION to
// `pollock-flickinger`, shipped one wave earlier: both predict the outcome of stereotactic radiosurgery for
// the same malformation, but this is a 0-to-4 ORDINAL POINT SCALE and that one is a CONTINUOUS formula with
// no maximum. Every slug spelling and filename search returned 0.
//
// **THE SCALE HAS FIVE VALUES BUT ONLY THREE PUBLISHED OUTCOME BANDS.** Favorable outcome is reported for
// 0-to-1, for 2, and for 3-to-4. So A SCORE OF 0 AND A SCORE OF 1 SHARE THE SAME PUBLISHED FIGURE, as do 3
// and 4: the scale is FINER THAN THE EVIDENCE BEHIND IT, and distinguishing a 0 from a 1 has no published
// consequence. This lib reports the band rather than inventing a per-score rate.
//
// **VOLUME IS THE ONLY GRADED ITEM AND IT CARRIES HALF THE SCALE.** Volume scores 0, 1 or 2 while eloquence
// and prior hemorrhage score 1 each. A LARGE AVM WITH NEITHER OTHER FEATURE SCORES 2, EXACTLY LIKE A TINY
// ELOQUENT AVM THAT HAS BLED. The two patients are indistinguishable to this scale.
//
// **THE VOLUME ITEM SATURATES AT 4 CUBIC CENTIMETRES AND THE COMPANION'S DOES NOT.** Above 4 cm3 every
// malformation scores the same 2 points, so a 5 cm3 and a 40 cm3 AVM are identical here. In
// `pollock-flickinger` volume is LINEAR AND UNBOUNDED at 0.1 per cubic centimetre, so those same two
// malformations differ by 3.5 points there. This lib computes that companion volume contribution alongside,
// because the saturation is invisible from the VRAS score alone.
//
// **THE TWO SCALES SHARE ONLY VOLUME.** VRAS uses eloquent location and PRIOR HEMORRHAGE; the companion uses
// AGE and a location TIER. Apart from volume they have no variable in common, so they can rank two patients
// in opposite orders, and a VRAS score cannot be converted into a Pollock-Flickinger score or the reverse.
//
// **"FAVORABLE OUTCOME" IS A COMPOSITE OF THREE CONDITIONS, ALL OF WHICH MUST HOLD**: obliteration of the
// malformation, AND no post-treatment hemorrhage, AND no permanent symptomatic radiation-induced
// complication. Failing any one makes the outcome unfavorable. It is a demanding definition, and a reported
// rate against it is not the obliteration rate.
//
// HIGH-STAKES: this predicts the outcome of RADIOSURGERY at a group level for a patient in whom radiosurgery
// is already being considered. It does NOT choose between radiosurgery, microsurgery, embolization and
// observation -- and observation is a real option, since the ARUBA trial found medical management superior
// to intervention for UNRUPTURED malformations over its follow-up. It does not plan a dose or a target
// volume, does not estimate rupture risk without treatment, and a favourable score is NOT by itself an
// indication to treat (spec-v11 section 5.3).
//
// SCALE AND OUTCOME BANDS RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT SOURCES, NEVER RECALLED
// (spec-v97):
//   - Starke RM, Yen CP, Ding D, Sheehan JP. A practical grading scale for predicting outcome after
//     radiosurgery for arteriovenous malformations: analysis of 1012 treated patients. J Neurosurg.
//     2013;119(4):981-987.

export const VOLUME_SMALL_MAX = 2;    // below this scores 0
export const VOLUME_LARGE_MIN = 4;    // above this scores 2
export const ELOQUENCE_POINTS = 1;
export const HEMORRHAGE_POINTS = 1;
export const VRAS_MAX = 4;

// The companion's volume coefficient, carried only so the saturation can be shown.
export const COMPANION_VOLUME_COEFFICIENT = 0.1;

export const VOLUME_BANDS = [
  { value: 'under-2', points: 0, text: `Less than ${VOLUME_SMALL_MAX} cm^3` },
  { value: '2-to-4', points: 1, text: `${VOLUME_SMALL_MAX} to ${VOLUME_LARGE_MIN} cm^3` },
  { value: 'over-4', points: 2, text: `More than ${VOLUME_LARGE_MIN} cm^3` },
];

// The published outcome bands. Five scores, three bands.
export const OUTCOME_BANDS = [
  { scores: [0, 1], label: '0 to 1', favorablePercent: 80 },
  { scores: [2], label: '2', favorablePercent: 70 },
  { scores: [3, 4], label: '3 to 4', favorablePercent: 45 },
];

export const FAVORABLE_DEFINITION = 'Obliteration of the malformation, AND no post-treatment hemorrhage, AND no permanent symptomatic radiation-induced complication. All three must hold.';

export const GRANULARITY_NOTE = `The scale has ${VRAS_MAX + 1} values but only ${OUTCOME_BANDS.length} published outcome bands: 0 and 1 share a figure, and 3 and 4 share a figure. The scale is FINER THAN THE EVIDENCE BEHIND IT, and distinguishing a 0 from a 1 has no published consequence.`;
export const VOLUME_WEIGHT_NOTE = 'Volume is the ONLY graded item and it carries half the scale: 0, 1 or 2 against 1 each for eloquence and prior hemorrhage. A large AVM with neither other feature scores 2, exactly like a tiny eloquent AVM that has bled - the two are indistinguishable to this scale.';
export const SATURATION_NOTE = `The volume item SATURATES at ${VOLUME_LARGE_MIN} cm^3: above it every malformation scores the same 2 points, so a 5 cm^3 and a 40 cm^3 AVM are identical here. In the Pollock-Flickinger score volume is LINEAR AND UNBOUNDED at ${COMPANION_VOLUME_COEFFICIENT} per cubic centimetre, so those same two differ by 3.5 points there.`;
export const SHARED_VARIABLE_NOTE = 'The two radiosurgery scales share ONLY volume. This one uses eloquent location and PRIOR HEMORRHAGE; the Pollock-Flickinger score uses AGE and a location TIER. They can rank two patients in opposite orders, and neither score converts into the other.';
export const COMPOSITE_NOTE = `"Favorable outcome" is a COMPOSITE of three conditions, all of which must hold: ${FAVORABLE_DEFINITION} Failing any one makes the outcome unfavorable, so a reported rate against it is NOT the obliteration rate.`;

const NOTE = `The Virginia Radiosurgery AVM Scale (Starke and colleagues 2013) predicts the outcome of stereotactic radiosurgery for a brain arteriovenous malformation, scoring 0 to ${VRAS_MAX}: volume under ${VOLUME_SMALL_MAX} cubic centimetres 0, ${VOLUME_SMALL_MAX} to ${VOLUME_LARGE_MIN} cubic centimetres 1, over ${VOLUME_LARGE_MIN} cubic centimetres 2, plus 1 for eloquent location and 1 for prior hemorrhage. Favorable outcome was reported in 80 percent at a score of 0 to 1, 70 percent at 2, and 45 percent at 3 to 4. The scale has five values but only three published outcome bands, so a 0 and a 1 share a figure as do a 3 and a 4, and the scale is finer than the evidence behind it. Volume is the only graded item and carries half the scale, so a large malformation with neither other feature scores 2 exactly like a tiny eloquent one that has bled. The volume item saturates above ${VOLUME_LARGE_MIN} cubic centimetres, where every malformation scores the same 2 points, while in the Pollock-Flickinger score volume is linear and unbounded, so a 5 and a 40 cubic centimetre malformation are identical here and 3.5 points apart there. The two scales share only volume, since this one uses eloquence and prior hemorrhage while the other uses age and a location tier, so they can rank patients in opposite orders and neither converts into the other. Favorable outcome is a composite of three conditions that must all hold: obliteration, no post-treatment hemorrhage, and no permanent symptomatic radiation-induced complication, so a rate against it is not the obliteration rate. This predicts the outcome of radiosurgery at a group level for a patient in whom radiosurgery is already being considered. It does not choose between radiosurgery, microsurgery, embolization and observation, and observation is a real option, since the ARUBA trial found medical management superior to intervention for unruptured malformations over its follow-up. It does not plan a dose or a target volume, does not estimate rupture risk without treatment, and a favourable score is not by itself an indication to treat.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}
function readNum(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${name} must be a number above 0.`);
  return n;
}
const round2 = (n) => Number(n.toFixed(2));

export function volumePoints(volume) {
  if (volume < VOLUME_SMALL_MAX) return 0;
  return volume > VOLUME_LARGE_MIN ? 2 : 1;
}

// input: volume (cm^3), eloquentLocation (yes/no), priorHemorrhage (yes/no).
export function vras(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let volume, eloquent, hemorrhage;
  try {
    volume = readNum(o.volume, 'AVM volume');
    eloquent = readBool(o.eloquentLocation, 'Eloquent location');
    hemorrhage = readBool(o.priorHemorrhage, 'Prior hemorrhage');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (volume === null || eloquent === null || hemorrhage === null) {
    return { valid: false, message: 'Enter the AVM volume in cubic centimetres, and say whether the location is eloquent and whether there has been a prior hemorrhage. Volume is the only graded item and carries half the scale.' };
  }

  const volPoints = volumePoints(volume);
  const total = volPoints + (eloquent ? ELOQUENCE_POINTS : 0) + (hemorrhage ? HEMORRHAGE_POINTS : 0);
  const outcome = OUTCOME_BANDS.find((b) => b.scores.includes(total));
  const volumeSaturated = volume > VOLUME_LARGE_MIN;
  const companionVolumeContribution = round2(COMPANION_VOLUME_COEFFICIENT * volume);

  const parts = [];
  parts.push(`VRAS ${total} of ${VRAS_MAX}: volume ${volPoints}, eloquence ${eloquent ? ELOQUENCE_POINTS : 0}, prior hemorrhage ${hemorrhage ? HEMORRHAGE_POINTS : 0}.`);
  parts.push(`Reported favorable outcome for the ${outcome.label} band: ${outcome.favorablePercent} percent. ${GRANULARITY_NOTE}`);
  if (volumeSaturated) {
    parts.push(`THE VOLUME ITEM IS SATURATED HERE: at ${volume} cm^3 this scores the same 2 points as any larger malformation. For contrast, the Pollock-Flickinger score would take ${companionVolumeContribution} from this volume alone, and would keep rising without limit. ${SATURATION_NOTE}`);
  } else {
    parts.push(SATURATION_NOTE);
  }
  parts.push(VOLUME_WEIGHT_NOTE);
  parts.push(SHARED_VARIABLE_NOTE);
  parts.push(COMPOSITE_NOTE);
  parts.push('This predicts the outcome of RADIOSURGERY at a group level. It does not choose between radiosurgery, microsurgery, embolization and observation - and observation is a real option, since the ARUBA trial found medical management superior to intervention for unruptured malformations over its follow-up. It does not plan a dose or a target volume.');

  return {
    valid: true,
    total,
    max: VRAS_MAX,
    volumePoints: volPoints,
    eloquencePoints: eloquent ? ELOQUENCE_POINTS : 0,
    hemorrhagePoints: hemorrhage ? HEMORRHAGE_POINTS : 0,
    outcomeBand: outcome.label,
    favorablePercent: outcome.favorablePercent,
    volumeSaturated,
    companionVolumeContribution,
    band: `VRAS ${total} of ${VRAS_MAX}`,
    bandLabel: `VRAS ${total} of ${VRAS_MAX}, ${outcome.favorablePercent}% favorable`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
