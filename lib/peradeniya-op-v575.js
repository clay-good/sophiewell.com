// spec-v575: the Peradeniya Organophosphorus Poisoning (POP) scale. "peradeniya", "organophosphate" and
// "namba" were all zero-hit, and `grep -c "id: 'peradeniya-op-scale'" app.js` returned 0. The catalog had
// no organophosphate content of any kind.
//
// SIX PARAMETERS, MAXIMUM 11. Bands 0-3 mild, 4-7 moderate, 8-11 severe, which tile the range exactly.
//
// **THE HEART-RATE ROW HAS A HOLE, AND IT IS AN INTERVAL RATHER THAN A SINGLE VALUE.** The published
// levels are above 60 scoring 0, 41 to 60 scoring 1, and BELOW 40 scoring 2. Every rate from 40 up to but
// not including 41 falls in none of them -- so the hole is the interval [40, 41), not just the integer 40,
// which is easy to miss when reading the table as though rates are always whole numbers. Because two
// independent reproductions print it the same way, this is the instrument rather than one paper's typo, and
// a bradycardic poisoned patient at 40 is not a contrived case. This lib REFUSES anything in the interval
// and names the hole rather than quietly assigning it to whichever neighbouring level seems kinder
// (spec-v97).
//
// **THE PUPIL ROW OVERLAPS ITSELF, AND THE OVERLAP HAS TO BE RESOLVED BY PRECEDENCE.** Level 1 is "under 2
// mm" and level 2 is "pinpoint" -- but a pinpoint pupil IS under 2 mm, so on their face the two levels are
// not mutually exclusive. Pinpoint must be read as taking precedence, and this lib says so rather than
// letting the first matching row win by accident.
//
// **THE FASCICULATION ROW IS A TWO-ATTRIBUTE CONJUNCTION DRESSED AS A THREE-LEVEL SCALE.** One point is
// fasciculation that is generalized OR continuous; two points is BOTH generalized AND continuous. It is not
// an ordinal severity ladder, and a reader who treats it as one will score a patient with severe but
// localized twitching as though the distinction were about intensity. This lib takes the two attributes
// SEPARATELY so the conjunction is structural and testable rather than a judgment about "how bad".
//
// **THE LAST ITEM IS HALF-WEIGHT, AND THE MAXIMUM IS 11 RATHER THAN 12.** Five parameters score 0 to 2;
// seizures scores 0 or 1 only. The original describes five manifestations each on a three-point scale, with
// seizures effectively bolted on as a sixth item at half weight. Anyone assuming six symmetric items will
// compute a maximum of 12 and misjudge every band boundary.
//
// **THE SCALE MUST BE APPLIED BEFORE TREATMENT, AND THIS IS A PRECONDITION RATHER THAN AN INPUT.** Atropine
// reverses miosis and bradycardia -- two of the six parameters -- so a patient scored after atropine will
// score lower for reasons that have nothing to do with the poisoning. This lib states the precondition and
// cannot verify it.
//
// HIGH-STAKES: this grades SEVERITY. It does NOT diagnose organophosphate poisoning, and it does not
// distinguish it from carbamate poisoning, which presents almost identically and differs in the duration of
// enzyme inhibition and in whether pralidoxime is indicated. It does not measure cholinesterase activity.
// **IT IS NOT A DOSING INSTRUMENT**: it does not indicate atropine, does not titrate it, and does not decide
// pralidoxime or intubation, which is the use it would most damagingly be put to given that atropine
// titration in these patients is driven by secretions and oxygenation rather than by any score (spec-v11
// section 5.3). Intermediate syndrome and delayed neuropathy develop later and are invisible to a scale
// applied at presentation. The clinical decision stays with the clinician.
//
// PARAMETERS, LEVELS AND BANDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two independent
// reproductions whose tables are identical in every parameter, every level wording and every point value,
// including the heart-rate hole:
//   - Senanayake N, de Silva HJ, Karalliedde L. A scale to assess severity in organophosphorus
//     intoxication: POP scale. Hum Exp Toxicol. 1993;12(4):297-299.

export const PUPIL_LEVELS = [
  { value: 'at-least-2mm', points: 0, text: '2 mm or more' },
  { value: 'under-2mm', points: 1, text: 'Under 2 mm, but not pinpoint' },
  { value: 'pinpoint', points: 2, text: 'Pinpoint' },
];

export const RESPIRATORY_LEVELS = [
  { value: 'under-20', points: 0, text: 'Under 20 per minute' },
  { value: 'at-least-20', points: 1, text: '20 or more per minute' },
  { value: 'at-least-20-cyanosis', points: 2, text: '20 or more per minute with central cyanosis' },
];

export const CONSCIOUSNESS_LEVELS = [
  { value: 'conscious', points: 0, text: 'Conscious and rational' },
  { value: 'impaired', points: 1, text: 'Impaired response to verbal command' },
  { value: 'none', points: 2, text: 'No response to verbal command' },
];

export const SEIZURE_LEVELS = [
  { value: 'absent', points: 0, text: 'Absent' },
  { value: 'present', points: 1, text: 'Present' },
];

export const POP_MAX = 11;          // five items at 0-2 plus seizures at 0-1
export const NAIVE_SYMMETRIC_MAX = 12; // what six symmetric items would give, and why that is wrong
export const UNSCOREABLE_HEART_RATE = 40;

const BANDS = [
  { max: 3, label: 'Mild poisoning' },
  { max: 7, label: 'Moderate poisoning' },
  { max: POP_MAX, label: 'Severe poisoning' },
];

const HEART_RATE_HOLE = `A heart rate from ${UNSCOREABLE_HEART_RATE} up to but not including 41 per minute is UNSCOREABLE on this instrument. The published levels are above 60 scoring 0, 41 to 60 scoring 1, and BELOW 40 scoring 2, so the whole interval from 40 to under 41 falls in none of them. The hole is an INTERVAL, not the single value 40. Two independent reproductions print the table identically, so this is the instrument rather than a typographic error, and no level is assigned rather than choosing a neighbour.`;

const PUPIL_PRECEDENCE = 'The pupil levels overlap on their face, because a pinpoint pupil is also under 2 mm. Pinpoint takes precedence and scores 2; "under 2 mm" scores 1 only when the pupil is not pinpoint.';

const FASCICULATION_TEXT = 'Fasciculation is a two-attribute conjunction rather than a severity ladder: 1 point for fasciculation that is generalized OR continuous, and 2 points only when it is BOTH. Intensity is not the axis.';

const ASYMMETRY_TEXT = `Five parameters score 0 to 2 but seizures scores 0 or 1 only, so the maximum is ${POP_MAX}, not the ${NAIVE_SYMMETRIC_MAX} that six symmetric items would give. Assuming symmetry misplaces every band boundary.`;

const TIMING_TEXT = 'The scale must be applied BEFORE treatment. Atropine reverses miosis and bradycardia, two of the six parameters, so a patient scored after atropine scores lower for reasons unrelated to the poisoning. This is a precondition and cannot be verified from the inputs.';

const NOTE = 'The Peradeniya Organophosphorus Poisoning scale (Senanayake and colleagues 1993) grades the severity of acute organophosphate poisoning from six parameters, with a maximum of 11 and bands of 0 to 3 mild, 4 to 7 moderate and 8 to 11 severe. Pupil size scores 0 at 2 mm or more, 1 under 2 mm and 2 for pinpoint; respiratory rate scores 0 under 20 per minute, 1 at 20 or more and 2 at 20 or more with central cyanosis; heart rate scores 0 above 60, 1 at 41 to 60 and 2 below 40; fasciculation scores 1 when generalized or continuous and 2 when both; level of consciousness scores 0 conscious and rational, 1 impaired response to verbal command and 2 no response; and seizures score 0 absent or 1 present. The heart-rate row has a hole: a rate of exactly 40 per minute falls in none of the published levels, and because two independent reproductions print the table identically this is the instrument rather than one paper’s typographic error, so no level is assigned to it here. The pupil levels overlap on their face, since a pinpoint pupil is also under 2 mm, and pinpoint takes precedence. Fasciculation is a two-attribute conjunction dressed as a three-level scale rather than a severity ladder, scoring 1 for generalized or continuous and 2 only for both, so intensity is not the axis. The last item is half-weight and the maximum is 11 rather than the 12 that six symmetric items would give, because five parameters score 0 to 2 while seizures scores 0 or 1 only, and assuming symmetry misplaces every band boundary. The scale must be applied before treatment, since atropine reverses miosis and bradycardia, two of the six parameters, so a patient scored after atropine scores lower for reasons unrelated to the poisoning. This grades severity. It does not diagnose organophosphate poisoning and does not distinguish it from carbamate poisoning, which presents almost identically while differing in the duration of enzyme inhibition and in whether pralidoxime is indicated, and it does not measure cholinesterase activity. It is not a dosing instrument: it does not indicate atropine, does not titrate it, and does not decide pralidoxime or intubation, which is the use it would most damagingly be put to, since atropine titration in these patients is driven by secretions and oxygenation rather than by any score. Intermediate syndrome and delayed neuropathy develop later and are invisible to a scale applied at presentation.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

function pick(levels, raw, name) {
  if (raw === '' || raw === null || raw === undefined) return { missing: name };
  const found = levels.find((l) => l.value === String(raw).trim().toLowerCase());
  return found ? { found } : { bad: name };
}

// The published heart-rate levels, with the hole at exactly 40 left open on purpose.
function heartRatePoints(hr) {
  if (hr > 60) return { points: 0, text: 'Above 60 per minute' };
  if (hr >= 41 && hr <= 60) return { points: 1, text: '41 to 60 per minute' };
  if (hr < UNSCOREABLE_HEART_RATE) return { points: 2, text: 'Below 40 per minute' };
  return { hole: true };
}

// input:
//   pupil, respiratory, consciousness, seizures -- level values from the exported ladders.
//   heartRate -- beats per minute.
//   fasciculationGeneralized, fasciculationContinuous -- yes/no, taken separately.
export function peradeniyaOp(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const pupil = pick(PUPIL_LEVELS, o.pupil, 'pupil');
  if (pupil.missing) return { valid: false, message: `Choose the pupil level. ${PUPIL_PRECEDENCE}` };
  if (pupil.bad) return { valid: false, message: `Pupil must be one of: ${PUPIL_LEVELS.map((l) => l.value).join(', ')}.` };

  const resp = pick(RESPIRATORY_LEVELS, o.respiratory, 'respiratory');
  if (resp.missing) return { valid: false, message: 'Choose the respiratory level.' };
  if (resp.bad) return { valid: false, message: `Respiratory must be one of: ${RESPIRATORY_LEVELS.map((l) => l.value).join(', ')}.` };

  const rawHr = o.heartRate;
  if (rawHr === '' || rawHr === null || rawHr === undefined) {
    return { valid: false, message: 'Enter the heart rate in beats per minute.' };
  }
  const hr = Number(String(rawHr).trim());
  if (!Number.isFinite(hr) || hr < 0 || hr > 300) {
    return { valid: false, message: 'Heart rate must be a number between 0 and 300 per minute.' };
  }
  const hrLevel = heartRatePoints(hr);
  if (hrLevel.hole) {
    return { valid: false, message: HEART_RATE_HOLE };
  }

  const generalized = readBool(o.fasciculationGeneralized);
  const continuous = readBool(o.fasciculationContinuous);
  if (generalized === null || continuous === null) {
    return { valid: false, message: `Answer both fasciculation attributes separately. ${FASCICULATION_TEXT}` };
  }
  if (Number.isNaN(generalized) || Number.isNaN(continuous)) {
    return { valid: false, message: 'Each fasciculation attribute must be yes or no.' };
  }

  const consciousness = pick(CONSCIOUSNESS_LEVELS, o.consciousness, 'consciousness');
  if (consciousness.missing) return { valid: false, message: 'Choose the level of consciousness.' };
  if (consciousness.bad) return { valid: false, message: `Consciousness must be one of: ${CONSCIOUSNESS_LEVELS.map((l) => l.value).join(', ')}.` };

  const seizures = pick(SEIZURE_LEVELS, o.seizures, 'seizures');
  if (seizures.missing) return { valid: false, message: `Say whether seizures are present. Note this item is HALF WEIGHT: 0 or 1 only, which is why the maximum is ${POP_MAX} and not ${NAIVE_SYMMETRIC_MAX}.` };
  if (seizures.bad) return { valid: false, message: `Seizures must be one of: ${SEIZURE_LEVELS.map((l) => l.value).join(', ')}.` };

  const fasciculationPoints = (generalized && continuous) ? 2 : ((generalized || continuous) ? 1 : 0);

  const total = pupil.found.points + resp.found.points + hrLevel.points
    + fasciculationPoints + consciousness.found.points + seizures.found.points;
  const band = BANDS.find((b) => total <= b.max);

  return {
    valid: true,
    total,
    max: POP_MAX,
    band: band.label,
    heartRatePoints: hrLevel.points,
    heartRateBand: hrLevel.text,
    fasciculationPoints,
    bothFasciculationAttributes: Boolean(generalized && continuous),
    bandLabel: `POP scale ${total} of ${POP_MAX}, ${band.label.toLowerCase()}`,
    bandText: `POP scale ${total} of ${POP_MAX}: ${band.label.toLowerCase()}. ${ASYMMETRY_TEXT} ${PUPIL_PRECEDENCE} ${FASCICULATION_TEXT} ${TIMING_TEXT} This grades severity and is NOT a dosing instrument: it does not indicate or titrate atropine, and it does not decide pralidoxime or intubation.`,
    note: NOTE,
  };
}
