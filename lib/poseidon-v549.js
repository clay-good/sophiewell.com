// spec-v549: the POSEIDON classification of low-prognosis patients in assisted reproductive technology.
// WHOLE-CONCEPT GAP: "poseidon", "oocyte", "amh", "afc", "antral", "folliculogenesis", "low-prognosis" and
// "ivf" were ALL zero-hit across corpus.json, app.js, and lib/meta.js. The catalog had no reproductive
// endocrinology content of any kind.
//
// FOUR GROUPS ON TWO AXES -- AGE AND OVARIAN RESERVE -- WITH ONLY THE FIRST TWO SUBDIVIDED:
//   Group 1  age under 35, ADEQUATE reserve, prior conventional stimulation yielding fewer than 10 oocytes
//              1a  fewer than 4 oocytes        1b  4 to 9 oocytes
//   Group 2  age 35 or over, ADEQUATE reserve, prior cycle yielding fewer than 10 oocytes
//              2a  fewer than 4 oocytes        2b  4 to 9 oocytes
//   Group 3  age under 35, POOR reserve
//   Group 4  age 35 or over, POOR reserve
//
// **GROUPS 3 AND 4 ARE NOT SUBDIVIDED, AND THAT ASYMMETRY IS THE MOST COMMONLY MISREPRODUCED PART OF THE
// CLASSIFICATION.** There is no group 3a or 4b. The subdivision by oocyte yield exists only where a prior
// cycle has actually happened, which is exactly what separates the two halves of the scheme.
//
// **GROUPS 1 AND 2 REQUIRE A PRIOR CONVENTIONAL-STIMULATION CYCLE; GROUPS 3 AND 4 DO NOT.** This is the
// structural consequence of the same fact. A patient with adequate reserve and no prior cycle is NOT
// POSEIDON group 1 or 2 and is not "group 1 pending" either -- she is simply unclassifiable until a cycle
// has been done, because the defining criterion is an unexpectedly poor response that has not yet had the
// chance to occur. Groups 3 and 4 are assignable before any stimulation, since poor reserve is measurable
// up front. This tile refuses to classify rather than guessing, and says which fact is missing.
//
// **ADEQUATE RESERVE PLUS MORE THAN 9 OOCYTES IS NOT POSEIDON AT ALL.** The classification describes
// LOW-PROGNOSIS patients. A normal responder falls outside it, and the tile returns that as a real answer
// rather than forcing a group. A classifier that always emits a group would label every patient
// low-prognosis, which is the opposite of what the scheme is for.
//
// THE RESERVE MARKERS ARE ALTERNATIVES, NOT BOTH REQUIRED. The criterion is antral follicle count of 5 or
// more AND/OR anti-Mullerian hormone of 1.2 ng/mL or more. Either marker suffices, so this tile accepts
// either or both and requires only one. When both are given and they DISAGREE -- one adequate, one poor --
// the tile grades reserve as adequate, because that is what "and/or" means, and it says the markers
// disagreed in the result rather than resolving the conflict silently. Marker discordance is common and it
// changes which half of the scheme a patient falls into, so it is reported, not hidden.
//
// HIGH-STAKES: this is a descriptive stratification for research and counseling. It does NOT diagnose
// infertility, does not measure ovarian reserve (it reads markers already measured), does not predict
// whether a given patient will conceive, and is NOT a protocol selector: it does not choose a stimulation
// regimen, a gonadotropin dose, an adjuvant, or a decision about donor oocytes (spec-v11 section 5.3). The
// groups describe expected oocyte yield, not live birth, and the marker thresholds are population cut points
// that perform poorly as individual predictions. Care decisions stay with the clinician and the patient.
//
// GROUPS, THRESHOLDS AND SUBDIVISIONS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the original
// proposal and an independent review by the same working group that agree on every criterion:
//   - Poseidon Group (Patient-Oriented Strategies Encompassing IndividualizeD Oocyte Number). A new more
//     detailed stratification of low responders to ovarian stimulation: from a poor ovarian response to a
//     low prognosis concept. Fertil Steril. 2016;105(6):1452-1453.
//   - Humaidan P, Alviggi C, Fischer R, Esteves SC. The novel POSEIDON stratification of low prognosis
//     patients in ART and its proposed marker of successful outcome. F1000Res. 2016;5:2911.

export const AFC_THRESHOLD = 5;      // antral follicle count of 5 or more is adequate
export const AMH_THRESHOLD = 1.2;    // anti-Mullerian hormone of 1.2 ng/mL or more is adequate
export const AGE_THRESHOLD = 35;     // under 35 versus 35 or over

export const POSEIDON_GROUPS = [
  {
    value: '1a',
    label: 'POSEIDON group 1a',
    text: 'Age under 35 with adequate ovarian reserve, and a prior conventional stimulation cycle that yielded fewer than 4 oocytes.',
    detail: 'An unexpected poor response in a patient whose markers predicted a normal one.',
  },
  {
    value: '1b',
    label: 'POSEIDON group 1b',
    text: 'Age under 35 with adequate ovarian reserve, and a prior conventional stimulation cycle that yielded 4 to 9 oocytes.',
    detail: 'An unexpected suboptimal response in a patient whose markers predicted a normal one.',
  },
  {
    value: '2a',
    label: 'POSEIDON group 2a',
    text: 'Age 35 or over with adequate ovarian reserve, and a prior conventional stimulation cycle that yielded fewer than 4 oocytes.',
    detail: 'An unexpected poor response, with age as an added prognostic factor.',
  },
  {
    value: '2b',
    label: 'POSEIDON group 2b',
    text: 'Age 35 or over with adequate ovarian reserve, and a prior conventional stimulation cycle that yielded 4 to 9 oocytes.',
    detail: 'An unexpected suboptimal response, with age as an added prognostic factor.',
  },
  {
    value: '3',
    label: 'POSEIDON group 3',
    text: 'Age under 35 with poor ovarian reserve. This group is not subdivided.',
    detail: 'An expected poor response. Assignable before any stimulation cycle has been done.',
  },
  {
    value: '4',
    label: 'POSEIDON group 4',
    text: 'Age 35 or over with poor ovarian reserve. This group is not subdivided.',
    detail: 'An expected poor response, with age as an added prognostic factor. Assignable before any stimulation cycle has been done.',
  },
];

const NOT_POSEIDON = 'Not a POSEIDON group. Ovarian reserve markers are adequate and the prior cycle yielded 10 or more oocytes, which is a normal response. The classification describes low-prognosis patients, so a normal responder falls outside it entirely.';

const NEEDS_CYCLE = 'Not classifiable yet. Ovarian reserve markers are adequate, so this patient could only fall in group 1 or 2, and both require a prior conventional-stimulation cycle yielding fewer than 10 oocytes. The defining feature of those groups is an unexpectedly poor response, which has not yet had the chance to occur. Groups 3 and 4 need no prior cycle, but they require poor reserve, which is not the case here.';

const DISCORDANT = 'The two reserve markers disagree: one meets its adequate threshold and the other does not. The criterion is an antral follicle count of 5 or more AND/OR anti-Mullerian hormone of 1.2 ng/mL or more, so either marker suffices and reserve is graded adequate. This is reported rather than resolved silently, because marker discordance is common and it decides which half of the classification applies.';

const NOTE = 'The POSEIDON classification (POSEIDON Group, Fertility and Sterility 2016) stratifies low-prognosis patients in assisted reproduction on two axes, age and ovarian reserve, into four groups. Group 1 is age under 35 with adequate reserve and a prior conventional stimulation cycle yielding fewer than 10 oocytes; group 2 is the same picture at age 35 or over. Group 3 is age under 35 with poor reserve, and group 4 is age 35 or over with poor reserve. Only groups 1 and 2 are subdivided, into a for fewer than 4 oocytes and b for 4 to 9 oocytes; there is no group 3a or 4b, and that asymmetry is the most commonly misreproduced part of the scheme. Groups 1 and 2 require a prior conventional-stimulation cycle because their defining feature is an unexpectedly poor response, so a patient with adequate reserve and no prior cycle is not classifiable rather than being group 1 pending. Groups 3 and 4 are assignable before any stimulation, since poor reserve is measurable up front. Adequate reserve together with 10 or more oocytes is not a POSEIDON group at all: the classification describes low-prognosis patients and a normal responder falls outside it. Reserve is defined by an antral follicle count of 5 or more and/or anti-Mullerian hormone of 1.2 ng/mL or more, so the two markers are alternatives rather than both being required, and when they disagree reserve is graded adequate and the disagreement is reported. This is a descriptive stratification for research and counseling. It does not diagnose infertility, does not measure ovarian reserve but reads markers already measured, does not predict whether a given patient will conceive, and does not select a stimulation protocol, a gonadotropin dose, an adjuvant, or a decision about donor oocytes. The groups describe expected oocyte yield rather than live birth, and the marker thresholds are population cut points that perform poorly as individual predictions.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

function readNumber(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n < 0) return NaN;
  return n;
}

// input:
//   age      -- years. Required. Splits at 35 (under 35 versus 35 or over).
//   afc      -- antral follicle count. Optional if amh is given.
//   amh      -- anti-Mullerian hormone in ng/mL. Optional if afc is given.
//   priorCycle -- yes/no, whether a prior conventional-stimulation cycle has been done.
//   oocytes  -- oocytes retrieved in that prior cycle. Required only when priorCycle is yes.
export function poseidon(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const age = readNumber(o.age);
  if (age === null) {
    return { valid: false, message: 'Enter the patient age in years. The classification splits at 35.' };
  }
  if (Number.isNaN(age) || age < 12 || age > 60) {
    return { valid: false, message: 'Age must be a number of years between 12 and 60.' };
  }

  const afc = readNumber(o.afc);
  const amh = readNumber(o.amh);
  if (Number.isNaN(afc)) {
    return { valid: false, message: 'The antral follicle count must be a number of follicles, or left blank if anti-Mullerian hormone is given instead.' };
  }
  if (Number.isNaN(amh)) {
    return { valid: false, message: 'Anti-Mullerian hormone must be a number in ng/mL, or left blank if the antral follicle count is given instead.' };
  }
  if (afc === null && amh === null) {
    return { valid: false, message: 'Enter an antral follicle count or an anti-Mullerian hormone level. The two markers are alternatives, so either one is enough.' };
  }

  const afcAdequate = afc === null ? null : afc >= AFC_THRESHOLD;
  const amhAdequate = amh === null ? null : amh >= AMH_THRESHOLD;
  const adequateReserve = afcAdequate === true || amhAdequate === true;
  const markersDiscordant = afcAdequate !== null && amhAdequate !== null && afcAdequate !== amhAdequate;

  const older = age >= AGE_THRESHOLD;

  // Groups 3 and 4: poor reserve. No prior cycle required, and no subdivision.
  if (!adequateReserve) {
    const group = POSEIDON_GROUPS.find((g) => g.value === (older ? '4' : '3'));
    return {
      valid: true,
      classified: true,
      group: group.value,
      groupLabel: group.label,
      subdivided: false,
      adequateReserve: false,
      markersDiscordant,
      afcAdequate,
      amhAdequate,
      bandLabel: group.label,
      band: `${group.label}. ${group.text} ${group.detail} This group is defined without reference to a prior cycle, because poor reserve is an expected poor response rather than an unexpected one.`,
      note: NOTE,
    };
  }

  // Adequate reserve: only groups 1 and 2 are reachable, and both need a prior cycle.
  const prior = readBool(o.priorCycle);
  if (prior === null) {
    return { valid: false, message: 'Say whether a prior conventional-stimulation cycle has been done. Reserve markers are adequate, so only groups 1 and 2 are reachable and both require one.' };
  }
  if (Number.isNaN(prior)) {
    return { valid: false, message: 'The prior-cycle answer must be yes or no.' };
  }

  if (!prior) {
    return {
      valid: true,
      classified: false,
      group: null,
      groupLabel: 'Not classifiable yet',
      adequateReserve: true,
      markersDiscordant,
      afcAdequate,
      amhAdequate,
      bandLabel: 'Not classifiable yet',
      band: `${NEEDS_CYCLE}${markersDiscordant ? ` ${DISCORDANT}` : ''}`,
      note: NOTE,
    };
  }

  const oocytes = readNumber(o.oocytes);
  if (oocytes === null) {
    return { valid: false, message: 'Enter the number of oocytes retrieved in the prior conventional-stimulation cycle. It decides both whether this is a POSEIDON group at all and, if so, the a or b subdivision.' };
  }
  if (Number.isNaN(oocytes) || !Number.isInteger(oocytes) || oocytes > 80) {
    return { valid: false, message: 'The oocyte count must be a whole number of oocytes from 0 to 80.' };
  }

  if (oocytes >= 10) {
    return {
      valid: true,
      classified: false,
      group: null,
      groupLabel: 'Not a POSEIDON group',
      adequateReserve: true,
      markersDiscordant,
      afcAdequate,
      amhAdequate,
      oocytes,
      bandLabel: 'Not a POSEIDON group',
      band: `${NOT_POSEIDON}${markersDiscordant ? ` ${DISCORDANT}` : ''}`,
      note: NOTE,
    };
  }

  const sub = oocytes < 4 ? 'a' : 'b';
  const group = POSEIDON_GROUPS.find((g) => g.value === `${older ? '2' : '1'}${sub}`);

  return {
    valid: true,
    classified: true,
    group: group.value,
    groupLabel: group.label,
    subdivided: true,
    subdivision: sub,
    adequateReserve: true,
    markersDiscordant,
    afcAdequate,
    amhAdequate,
    oocytes,
    bandLabel: group.label,
    band: `${group.label}. ${group.text} ${group.detail}${markersDiscordant ? ` ${DISCORDANT}` : ''} Only groups 1 and 2 carry an a or b subdivision; groups 3 and 4 are not subdivided.`,
    note: NOTE,
  };
}
