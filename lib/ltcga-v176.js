// spec-v176 (fourth feature spec of the spec-v172 Long-Term Care & Geriatric
// Assessment program, cluster §3.4): falls-risk, balance, and gait instruments
// for the community / long-term-care surface — the performance-based battery and
// the CDC STEADI screening algorithm the catalog's inpatient `morse-falls` /
// `hendrich-ii` screens do not cover. v176 ships all six proposed tiles; every
// weight, band, norm, and cut-point was re-fetched and cross-verified against
// >= 2 independent sources at implementation (spec-v97).
//
//   stratify          - STRATIFY inpatient falls tool, 5 items 0-5, >= 2 high risk.
//   chairStand30s     - 30-Second Chair Stand vs the CDC STEADI below-average
//                       age/sex norm -> fall-risk flag.
//   fourStageBalance  - 4-Stage Balance Test: full-tandem hold time vs 10 s cut.
//   functionalReach   - Functional Reach Test: forward reach vs the published
//                       cut-points, with the age/sex normative mean for context.
//   gaitSpeed         - 4-meter / habitual gait speed (distance / time, m/s),
//                       mapped to the published cut-points. Guarded ratio.
//   steadiAlgorithm   - CDC STEADI fall-risk screening pathway -> low/moderate/high.
//
// Per the spec-v100 §2 doctrine each consumes the clinician's measurement /
// observation and returns a value or band mapped to the source's published
// thresholds; none authors an exercise prescription or fall-prevention order in
// Sophie's voice (spec-v11 §5.3). Citations live inline in lib/meta.js. No AI,
// no runtime network call.
//
// SCORING / NORMS / BANDS RE-FETCHED, NEVER RECALLED (spec-v97):
//   - stratify: 5 yes/no factors (Oliver D, et al, BMJ 1997) — a recent fall;
//     agitation; visual impairment affecting function; frequent toileting; and a
//     combined transfer + mobility (Barthel 0-3 each) score of 3 or 4. Each
//     present factor scores 1; total 0-5; >= 2 is high fall risk.
//   - chairStand30s: stands completed in 30 s vs the CDC STEADI below-average
//     age/sex norm (Jones CJ, et al, Res Q Exerc Sport 1999; CDC STEADI). A
//     count below the listed value for the age band and sex = below average =
//     increased fall risk. Bands 60-64 .. 90-94 by sex; outside that range the
//     stratum is unavailable -> valid:false (never a guessed band).
//   - fourStageBalance: the 4-stage progressive stances (CDC STEADI). Inability
//     to hold the full tandem stance for >= 10 s indicates increased fall risk;
//     the value compared is the full-tandem hold time in seconds vs 10 s.
//   - functionalReach: forward reach distance (canonical cm) vs the published
//     cut-points (Duncan PW, et al, J Gerontol 1990; Weiner classification):
//     < 15.24 cm (6 in) markedly increased (~4x) risk, 15.24-25.40 cm (6-10 in)
//     increased (~2x), > 25.40 cm lower risk; the Duncan age/sex normative means
//     (cm) are shown for context. Outside the normed age/sex strata -> valid:false.
//   - gaitSpeed: distance / time = m/s (Studenski S, et al, JAMA 2011; Fritz &
//     Lusardi 2009). Cut-points: < 0.6 high risk of adverse outcomes, < 0.8
//     limited community ambulation, >= 1.0 healthy / well-functioning. The time
//     denominator is finite/positive-guarded; a zero/blank/non-finite time
//     returns valid:false, never Infinity/NaN.
//   - steadiAlgorithm: the CDC STEADI pathway (Stevens JA, Phelan EA, Health
//     Promot Pract 2013) — a negative screen (no fall, not unsteady, not
//     worried) is low risk; a positive screen is high risk when there is a
//     recurrent (>= 2) or injurious fall or a gait/strength/balance problem,
//     otherwise moderate risk.

import { r2 } from './num.js';

function yn(v) {
  if (v === true || v === 'yes' || v === '1' || v === 1) return true;
  if (v === false || v === 'no' || v === '0' || v === 0) return false;
  return null;
}
function intIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < lo || n > hi) return null;
  return n;
}
function numFinite(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// --- 2.1 STRATIFY -------------------------------------------------------------
const STRATIFY_NOTE = 'STRATIFY — St Thomas’s Risk Assessment Tool in Falling Elderly Inpatients (Oliver D, et al, BMJ 1997). Five factors each score 1 when present: a fall as the presenting complaint or since admission; agitation; visual impairment affecting everyday function; especially frequent toileting; and a combined transfer + mobility score (each scored 0–3 on the Barthel system) of 3 or 4. Total 0–5; a score of 2 or more is high fall risk.';

export function stratify(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fall = yn(o.recentFall);
  const agitated = yn(o.agitated);
  const visual = yn(o.visualImpairment);
  const toilet = yn(o.frequentToileting);
  const transfer = intIn(o.transfer, 0, 3);
  const mobility = intIn(o.mobility, 0, 3);
  if ([fall, agitated, visual, toilet].some((x) => x === null) || transfer === null || mobility === null) {
    return { valid: false, message: 'Answer all 4 yes/no factors and rate transfer and mobility 0–3.' };
  }
  const tm = transfer + mobility; // 0–6
  const tmPoint = tm === 3 || tm === 4 ? 1 : 0;
  const total = (fall ? 1 : 0) + (agitated ? 1 : 0) + (visual ? 1 : 0) + (toilet ? 1 : 0) + tmPoint; // 0–5
  const highRisk = total >= 2;
  return {
    valid: true,
    total,
    highRisk,
    bandLabel: `STRATIFY ${total}/5`,
    band: `STRATIFY ${total}/5 — ${highRisk ? 'high fall risk (≥ 2)' : 'lower fall risk (0–1)'}`,
    detail: `Recent fall ${fall ? 'yes' : 'no'}, agitated ${agitated ? 'yes' : 'no'}, visual impairment ${visual ? 'yes' : 'no'}, frequent toileting ${toilet ? 'yes' : 'no'}, transfer+mobility ${tm} (${tmPoint ? 'scores 1' : 'scores 0'}).`,
    note: STRATIFY_NOTE,
  };
}

// --- 2.2 30-Second Chair Stand ------------------------------------------------
// CDC STEADI below-average thresholds: a stand count BELOW the listed value for
// the age band and sex is below average (increased fall risk).
const CHAIR_NORMS = {
  male:   [[60, 64, 14], [65, 69, 12], [70, 74, 12], [75, 79, 11], [80, 84, 10], [85, 89, 8], [90, 94, 7]],
  female: [[60, 64, 12], [65, 69, 11], [70, 74, 10], [75, 79, 10], [80, 84, 9], [85, 89, 8], [90, 94, 4]],
};
const CHAIR_NOTE = 'The 30-Second Chair Stand Test (Jones CJ, et al, Res Q Exerc Sport 1999; CDC STEADI norms). The number of full sit-to-stands completed in 30 seconds is compared with the CDC STEADI below-average cut-point for the patient’s age band and sex; a count below the cut-point is below average and indicates increased fall risk. Norm bands cover ages 60–94.';

function chairThreshold(sex, age) {
  const table = CHAIR_NORMS[sex];
  if (!table) return null;
  for (const [lo, hi, thr] of table) if (age >= lo && age <= hi) return thr;
  return null;
}

export function chairStand30s(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const stands = intIn(o.stands, 0, 100);
  const age = intIn(o.age, 0, 130);
  const sex = o.sex === 'male' || o.sex === 'female' ? o.sex : null;
  if (stands === null || age === null || !sex) {
    return { valid: false, message: 'Enter the stand count, age, and sex.' };
  }
  const threshold = chairThreshold(sex, age);
  if (threshold === null) {
    return { valid: false, message: 'The CDC STEADI norm covers ages 60–94; no stratum for this age.' };
  }
  const belowAverage = stands < threshold;
  return {
    valid: true,
    stands,
    threshold,
    belowAverage,
    bandLabel: `${stands} stands`,
    band: `${stands} stands in 30 s — ${belowAverage ? 'below average for age/sex, increased fall risk' : 'at or above average for age/sex'}`,
    detail: `Compared with the CDC STEADI below-average cut-point of ${threshold} for ${sex === 'male' ? 'men' : 'women'} aged ${age}.`,
    note: CHAIR_NOTE,
  };
}

// --- 2.3 4-Stage Balance Test -------------------------------------------------
const BALANCE_NOTE = 'The 4-Stage Balance Test (CDC STEADI). The patient holds four progressively harder stances — feet side-by-side, semi-tandem (instep to big toe), full tandem (heel to toe), and single leg — for up to 10 seconds each, advancing only after holding the prior stance. Inability to hold the full tandem stance for 10 seconds indicates increased fall risk.';

export function fourStageBalance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const seconds = numFinite(o.tandemSeconds);
  if (seconds === null || seconds < 0) {
    return { valid: false, message: 'Enter the time (seconds) the full tandem stance was held.' };
  }
  const held = seconds >= 10;
  const shown = r2(seconds);
  return {
    valid: true,
    tandemSeconds: shown,
    held,
    bandLabel: held ? 'tandem held' : 'tandem not held',
    band: `Full tandem held ${shown} s — ${held ? 'held ≥ 10 s, not flagged by this test' : 'held < 10 s, increased fall risk'}`,
    detail: `The value compared is the full-tandem hold time (${shown} s) against the 10 s cut-point.`,
    note: BALANCE_NOTE,
  };
}

// --- 2.4 Functional Reach Test ------------------------------------------------
// Duncan 1990 age/sex normative means (cm). Absolute Weiner cut-points classify
// fall risk; the norm mean is shown for context.
const REACH_NORMS = {
  male:   [[20, 40, 42.49], [41, 69, 38.05], [70, 87, 33.43]],
  female: [[20, 40, 37.49], [41, 69, 35.10], [70, 87, 26.60]],
};
const REACH_NOTE = 'The Functional Reach Test (Duncan PW, et al, J Gerontol 1990). The maximum forward reach with a fixed base of support is classified against the published cut-points: under 15.24 cm (6 in) is a markedly increased (≈ 4×) fall risk, 15.24–25.40 cm (6–10 in) an increased (≈ 2×) risk, and over 25.40 cm a lower risk. The age/sex normative mean is shown for context.';

function reachNorm(sex, age) {
  const table = REACH_NORMS[sex];
  if (!table) return null;
  for (const [lo, hi, mean] of table) if (age >= lo && age <= hi) return mean;
  return null;
}

export function functionalReach(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const reach = numFinite(o.reachCm);
  const age = intIn(o.age, 0, 130);
  const sex = o.sex === 'male' || o.sex === 'female' ? o.sex : null;
  if (reach === null || reach < 0 || age === null || !sex) {
    return { valid: false, message: 'Enter the forward reach distance, age, and sex.' };
  }
  const mean = reachNorm(sex, age);
  if (mean === null) {
    return { valid: false, message: 'The Duncan normative means cover ages 20–87; no stratum for this age.' };
  }
  let band;
  if (reach < 15.24) band = 'markedly increased fall risk (< 15.24 cm / 6 in)';
  else if (reach <= 25.40) band = 'increased fall risk (15.24–25.40 cm / 6–10 in)';
  else band = 'lower fall risk (> 25.40 cm / 10 in)';
  const shown = r2(reach);
  return {
    valid: true,
    reachCm: shown,
    normMean: mean,
    bandLabel: `${shown} cm reach`,
    band: `Reach ${shown} cm — ${band}`,
    detail: `Age/sex normative mean for ${sex === 'male' ? 'men' : 'women'} aged ${age}: ${mean} cm.`,
    note: REACH_NOTE,
  };
}

// --- 2.5 Gait Speed -----------------------------------------------------------
const GAIT_NOTE = 'Habitual / 4-meter gait speed (Studenski S, et al, JAMA 2011; Fritz & Lusardi, “walking speed: the sixth vital sign,” 2009). Speed = distance ÷ time. Published cut-points: under 0.6 m/s is a high risk of adverse outcomes, under 0.8 m/s is limited community ambulation, and 1.0 m/s or more is healthy / well-functioning.';

export function gaitSpeed(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const distance = numFinite(o.distanceM);
  const time = numFinite(o.timeS);
  if (distance === null || distance <= 0 || time === null) {
    return { valid: false, message: 'Enter the walked distance (m) and the time taken (s).' };
  }
  if (!(time > 0)) {
    return { valid: false, message: 'Time must be greater than zero.' };
  }
  const speed = r2(distance / time); // m/s, guarded denominator
  let band;
  if (speed < 0.6) band = 'high risk of adverse outcomes (< 0.6 m/s)';
  else if (speed < 0.8) band = 'limited community ambulation (0.6–0.79 m/s)';
  else if (speed < 1.0) band = 'reduced, below the healthy norm (0.8–0.99 m/s)';
  else band = 'healthy / well-functioning (≥ 1.0 m/s)';
  return {
    valid: true,
    speed,
    value: speed,
    bandLabel: `${speed} m/s`,
    band: `Gait speed ${speed} m/s — ${band}`,
    detail: `${r2(distance)} m walked in ${r2(time)} s.`,
    note: GAIT_NOTE,
  };
}

// --- 2.6 CDC STEADI Fall-Risk Screening Algorithm -----------------------------
const STEADI_NOTE = 'CDC STEADI fall-risk screening algorithm (Stevens JA, Phelan EA, Health Promot Pract 2013). The three key questions (a fall in the past year, feeling unsteady, worrying about falling) screen for increased risk; a negative screen is low risk. A positive screen is high risk when there is a recurrent (2 or more) or injurious fall or a gait/strength/balance problem, and moderate risk otherwise. The pathway guides the depth of assessment and intervention; the decision stays with the clinician.';

export function steadiAlgorithm(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fell = yn(o.fellPastYear);
  const unsteady = yn(o.feelsUnsteady);
  const worried = yn(o.worriesAboutFalling);
  const gaitProblem = yn(o.gaitBalanceProblem);
  if ([fell, unsteady, worried, gaitProblem].some((x) => x === null)) {
    return { valid: false, message: 'Answer all four screening items yes or no.' };
  }
  // Fall details are required only when a fall is reported.
  let recurrent = false;
  let injurious = false;
  if (fell) {
    const count = intIn(o.numberOfFalls, 1, 2); // 1 = one fall, 2 = two or more
    const injury = yn(o.fallWithInjury);
    if (count === null || injury === null) {
      return { valid: false, message: 'A fall was reported — enter whether it was a single or recurrent fall and whether any fall caused injury.' };
    }
    recurrent = count >= 2;
    injurious = injury;
  }
  const positiveScreen = fell || unsteady || worried;
  const drivers = [];
  let risk;
  if (!positiveScreen) {
    risk = 'low';
  } else if (recurrent || injurious || gaitProblem) {
    risk = 'high';
    if (recurrent) drivers.push('recurrent falls (≥ 2)');
    if (injurious) drivers.push('an injurious fall');
    if (gaitProblem) drivers.push('a gait/strength/balance problem');
  } else {
    risk = 'moderate';
    if (fell) drivers.push('a fall in the past year');
    if (unsteady) drivers.push('feeling unsteady');
    if (worried) drivers.push('worry about falling');
  }
  const label = { low: 'Low fall risk', moderate: 'Moderate fall risk', high: 'High fall risk' }[risk];
  return {
    valid: true,
    risk,
    bandLabel: label,
    band: `${label} — ${risk === 'low' ? 'negative screen' : `driven by ${drivers.join(', ')}`}`,
    detail: risk === 'low'
      ? 'No fall, not unsteady, and no worry about falling — the negative-screen pathway.'
      : `Positive screen; ${risk} pathway.`,
    note: STEADI_NOTE,
  };
}
