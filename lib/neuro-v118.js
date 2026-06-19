// spec-v118 (Wave 4 of the spec-v100 MDCalc Parity Completion program): five
// deterministic hemorrhagic-stroke / SAH / IVH / unruptured-aneurysm instruments
// the neuro-ICU and neurosurgery teams grade once the NCCT or CTA is read. v117
// covered the ischemic-stroke imaging-prognosis side; v118 covers the
// hemorrhagic side. None duplicates a live tile; each takes the clinician's
// imaging *read* (blood thickness, compartment grades, NCCT markers, aneurysm
// measurements) as input -- v118 parses no DICOM, no pixels, no radiology report
// (spec-v118 §7).
//
//   modifiedFisher - Modified Fisher Scale (SAH cisternal-blood + IVH -> 0-4)
//   graebIvh       - Modified Graeb Score (per-compartment IVH burden, 0-32)
//   batScore       - BAT Score (NCCT hematoma-expansion risk, 0-5)
//   phases         - PHASES Score (5-yr unruptured-aneurysm rupture risk)
//   elapss         - ELAPSS Score (3- and 5-yr unruptured-aneurysm growth risk)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v118.js wire these to the home grid and
// render the spec-v50 §3 clinical-posture note. Each tile reports the grade /
// score and the source's stated risk framing; the management decision (coiling,
// clipping, surveillance, surgery) stays with the neurosurgery / neurocritical-
// care team and local protocol -- none authors that order in Sophie's voice
// (spec-v11 §5.3).
//
// POINT TABLES / OUTCOME BANDS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each
// cross-verified across >= 2 independent sources (the derivation paper + MDCalc /
// PMC / validation-cohort reproductions). NO-FABRICATION notes:
//   - modifiedFisher (Frontera 2006, Neurosurgery): grades 0-4 by cisternal SAH
//     thickness (none/thin/thick) x IVH (present/absent): 0 = no SAH or IVH,
//     1 = thin SAH no IVH, 2 = thin SAH + IVH, 3 = thick SAH no IVH, 4 = thick
//     SAH + IVH. Frontera Table 2 symptomatic-vasospasm incidence is verbatim:
//     grade 1 -> 24%, 2 -> 33%, 3 -> 33% (grades 2 and 3 carry essentially equal
//     risk, OR 1.58 vs 1.59), 4 -> 40%. Grade 0 (n=20, 2% of the cohort) is the
//     reference stratum -- the paper does NOT publish a standalone grade-0
//     vasospasm rate, so the tile labels it the lowest/reference grade and
//     invents no percentage. Frontera applied a SUBJECTIVE thin/thick visual read
//     ("Explicit criteria for classifying blood as thick or thin ... were not
//     applied"); the < 1 mm / >= 1 mm convention carried by MDCalc/Radiopaedia is
//     surfaced in the renderer text, not hard-coded as a measurement. Isolated
//     IVH with no SAH is outside the modified-Fisher SAH grading, so none + IVH
//     reports grade 0 with a note rather than inventing a grade.
//   - graebIvh (Morgan 2013, Stroke): the modified Graeb sums 8 compartments to a
//     max of 32. Four LARGE compartments (right + left lateral ventricle, third,
//     fourth) carry a fill grade 0-4 (0 none, 1 trace, 2 < 50% filled, 3 > 50%,
//     4 filled) PLUS a SEPARATE +1 if that compartment is expanded beyond normal
//     anatomic limits by clot, so each large compartment maxes at 5. Four horns
//     (right + left occipital, right + left temporal) carry a fill grade 0-2
//     (0 none, 1 partially filled, 2 completely filled) PLUS the same +1
//     expansion bonus, so each horn maxes at 3. The maximum is therefore
//     (4 x 5) + (4 x 3) = 32 -- the +1 expansion is an INDEPENDENT additive
//     modifier on top of the fill grade (verified against the PMC6800016
//     reproduction: "the maximum possible score is 32, in which every compartment
//     is filled with blood and expanded"), NOT folded into the top fill step. The
//     expansion bonus only counts when that compartment has blood (fill > 0).
//     Frontal-horn blood is scored under the lateral-ventricle body, not as a
//     separate compartment. The derivation treats the score continuously (each
//     1-point rise ~ 12% higher odds of poor 180-day outcome, OR 1.12) and
//     publishes NO fixed cutoff, so the tile reports the total and the per-point
//     odds framing only.
//   - batScore (Morotti 2018, Stroke): BAT = Blend sign (+1), Any hypodensity
//     (+2), Timing onset-to-NCCT < 2.5 h (+2); total 0-5. The validated
//     dichotomy is >= 3 predicts hematoma expansion (sensitivity 0.50,
//     specificity 0.89 in the derivation cohort). The paper publishes NO
//     per-score expansion-probability table, so the tile frames risk via the
//     >= 3 threshold and the cited operating characteristics only -- it invents
//     no continuous probability.
//   - phases (Greving 2014, Lancet Neurol): Population (North American/European
//     0, Japanese 3, Finnish 5), Hypertension (+1), Age >= 70 (+1), Size
//     (< 7.0 mm 0, 7.0-9.9 +3, 10.0-19.9 +6, >= 20 +10), Earlier SAH from another
//     aneurysm (+1), Site (ICA 0, MCA +2, ACA/Pcom/posterior +4); total 0-22.
//     5-year cumulative rupture risk verbatim from Figure 3: <= 2 -> 0.4%,
//     3 -> 0.7%, 4 -> 0.9%, 5 -> 1.3%, 6 -> 1.7%, 7 -> 2.4%, 8 -> 3.2%,
//     9 -> 4.3%, 10 -> 5.3%, 11 -> 7.2%, >= 12 -> 17.8%.
//   - elapss (Backes 2017, Neurology): Earlier SAH (No +1, Yes 0 -- the inverted
//     direction is intentional: a prior treated SAH associates with LOWER growth
//     risk of the remaining aneurysm), Location (ICA/ACA/ACOM 0, MCA +3,
//     PCOM/posterior +5), Age (<= 60 -> 0, then +1 per 5-year band: 61-65 +1 ...
//     > 95 +8), Population (North America/China/Europe-non-Finland 0, Japan +1,
//     Finland +7), Size (1.0-2.9 mm 0, 3.0-4.9 +4, 5.0-6.9 +10, 7.0-9.9 +13,
//     >= 10 +22), Shape (regular 0, irregular +4). The paper states the score
//     range as 0-40 (the literal row maxima sum to 47, an inconsistency the
//     paper itself does not reconcile), so the total is clamped to the published
//     40 ceiling -- the risk lookup tops out at >= 25 so the clamp never changes
//     the clinical band. 3-/5-year cumulative growth risk from Table 3: < 5 ->
//     5.0%/8.4%, 5-9 -> 7.8%/13.0%, 10-14 -> 11.7%/19.3%, 15-19 -> 17.5%/28.1%,
//     20-24 -> 25.8%/39.9%, >= 25 -> 42.7%/60.8% (the four middle rows are
//     single-sourced from a verbatim reproduction of Backes Table 3; the < 5 and
//     >= 25 endpoints are multiply confirmed).

import { r1 } from './num.js';

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);

// --- 2.1 modified-fisher ------------------------------------------------------
const MFISHER_NOTE = 'Modified Fisher Scale (Frontera JA, Claassen J, Schmidt JM, et al, Neurosurgery 2006): grades the radiographic blood burden after aneurysmal subarachnoid hemorrhage to predict symptomatic vasospasm, from the cisternal SAH thickness (none / thin / thick) and the presence of intraventricular hemorrhage. Grade 0 = no SAH or IVH; grade 1 = thin SAH, no IVH; grade 2 = thin SAH with IVH; grade 3 = thick SAH, no IVH; grade 4 = thick SAH with IVH. The derivation reports symptomatic-vasospasm incidence of about 24% at grade 1, 33% at grades 2 and 3, and 40% at grade 4 (grades 2 and 3 carry essentially equal risk). Frontera used a subjective thin-vs-thick visual read and applied no measured cutoff; the < 1 mm / >= 1 mm convention is a downstream calculator convention. It grades the blood burden; the surveillance and management decisions stay with the neurosurgery / neurocritical-care team and local protocol.';
const MFISHER_RISK = ['the reference (lowest) grade', '~24%', '~33%', '~33%', '~40%'];

export function modifiedFisher(input = {}) {
  const sah = input.sah === 'thin' || input.sah === 'thick' ? input.sah : 'none';
  const ivh = onFlag(input.ivh);
  let grade;
  let detail;
  if (sah === 'none') {
    grade = 0;
    detail = ivh
      ? 'no subarachnoid blood entered; isolated intraventricular hemorrhage is outside the modified Fisher SAH grading (graded grade 0 here -- consider the modified Graeb score for IVH burden)'
      : 'no subarachnoid or intraventricular hemorrhage';
  } else if (sah === 'thin') {
    grade = ivh ? 2 : 1;
    detail = ivh ? 'thin SAH with IVH' : 'thin SAH, no IVH';
  } else {
    grade = ivh ? 4 : 3;
    detail = ivh ? 'thick SAH with IVH' : 'thick SAH, no IVH';
  }
  const risk = MFISHER_RISK[grade];
  const riskText = grade === 0
    ? `symptomatic-vasospasm risk: ${risk}`
    : `symptomatic-vasospasm risk ${risk}`;
  return {
    valid: true, grade,
    abnormal: grade >= 3,
    band: `Modified Fisher grade ${grade} (${detail}): ${riskText}.`,
    note: MFISHER_NOTE,
  };
}

// --- 2.2 graeb-ivh ------------------------------------------------------------
const GRAEB_NOTE = 'Modified Graeb Score (Morgan TC, Dawson J, Spengler D, et al, Stroke 2013): quantifies intraventricular-hemorrhage burden across eight compartments for a total of 0-32. Each of the four large compartments -- the right and left lateral ventricles, the third ventricle, and the fourth ventricle -- carries a fill grade of 0 (no blood), 1 (trace), 2 (less than half filled), 3 (more than half filled), or 4 (filled), plus 1 more point if that compartment is expanded beyond its normal anatomic limits by clot. Each of the four horns -- the right and left occipital and the right and left temporal horns -- carries a fill grade of 0 (no blood), 1 (partially filled), or 2 (completely filled), plus the same 1-point expansion bonus. The maximum is therefore (4 x 5) + (4 x 3) = 32. The total correlates with IVH volume, and each one-point rise raises the odds of poor functional outcome by about 12%; the derivation publishes no fixed cutoff. It reports the burden; the management decision stays with the clinician and local protocol.';
const GRAEB_LARGE = [
  ['rightLateral', 'right lateral ventricle'],
  ['leftLateral', 'left lateral ventricle'],
  ['third', 'third ventricle'],
  ['fourth', 'fourth ventricle'],
];
const GRAEB_HORNS = [
  ['rightOccipital', 'right occipital horn'],
  ['leftOccipital', 'left occipital horn'],
  ['rightTemporal', 'right temporal horn'],
  ['leftTemporal', 'left temporal horn'],
];

export function graebIvh(input = {}) {
  let total = 0;
  const scored = [];
  for (const [key, label] of GRAEB_LARGE) {
    const raw = fin(input[key]);
    const fill = raw == null ? 0 : clamp(Math.round(raw), 0, 4);
    const exp = fill > 0 && onFlag(input[`${key}Exp`]) ? 1 : 0;
    const pts = fill + exp;
    total += pts;
    if (pts > 0) scored.push(`${label} +${pts}${exp ? ' (expanded)' : ''}`);
  }
  for (const [key, label] of GRAEB_HORNS) {
    const raw = fin(input[key]);
    const fill = raw == null ? 0 : clamp(Math.round(raw), 0, 2);
    const exp = fill > 0 && onFlag(input[`${key}Exp`]) ? 1 : 0;
    const pts = fill + exp;
    total += pts;
    if (pts > 0) scored.push(`${label} +${pts}${exp ? ' (expanded)' : ''}`);
  }
  total = clamp(total, 0, 32);
  return {
    valid: true, total,
    abnormal: total >= 16,
    band: `Modified Graeb ${total}/32: intraventricular-hemorrhage burden; each one-point rise raises the odds of poor functional outcome by about 12%.`,
    scored: scored.length ? scored.join(', ') : 'no intraventricular blood scored (total 0)',
    note: GRAEB_NOTE,
  };
}

// --- 2.3 bat-score ------------------------------------------------------------
const BAT_NOTE = 'BAT score (Morotti A, Dowlatshahi D, Boulouis G, et al, Stroke 2018): predicts hematoma expansion in intracerebral hemorrhage from three non-contrast CT markers -- the Blend sign (+1), Any intrahematoma hypodensity (+2), and Timing of onset-to-baseline-NCCT under 2.5 hours (+2) -- for a total of 0-5. The derivation dichotomizes at a total of 3 or more, which predicts hematoma expansion with a sensitivity of about 0.50 and a specificity of about 0.89. It frames expansion risk; the monitoring and surgical decisions stay with the neurosurgery / neurocritical-care team and local protocol.';

export function batScore(input = {}) {
  const counted = [];
  let total = 0;
  if (onFlag(input.blend)) { total += 1; counted.push('blend sign (+1)'); }
  if (onFlag(input.hypodensity)) { total += 2; counted.push('any hypodensity (+2)'); }
  if (onFlag(input.timing)) { total += 2; counted.push('onset-to-NCCT < 2.5 h (+2)'); }
  total = clamp(total, 0, 5);
  const high = total >= 3;
  return {
    valid: true, total,
    abnormal: high,
    band: `BAT ${total}/5: ${high ? 'BAT >= 3 -- predicts hematoma expansion (sensitivity ~0.50, specificity ~0.89)' : 'below the BAT >= 3 expansion-prediction threshold'}.`,
    counted: counted.length ? counted.join(', ') : 'no BAT markers present',
    note: BAT_NOTE,
  };
}

// --- 2.4 phases ---------------------------------------------------------------
const PHASES_NOTE = 'PHASES score (Greving JP, Wermer MJH, Brown RD Jr, et al, Lancet Neurol 2014): estimates the 5-year cumulative rupture risk of an unruptured intracranial aneurysm from Population (North American/European 0, Japanese +3, Finnish +5), Hypertension (+1), Age >= 70 (+1), Size of aneurysm (< 7.0 mm 0, 7.0-9.9 +3, 10.0-19.9 +6, >= 20 +10), Earlier SAH from a different aneurysm (+1), and Site (ICA 0, MCA +2, ACA/Pcom/posterior circulation +4), for a total of 0-22. The derivation maps the total to a 5-year rupture risk rising from about 0.4% at <= 2 points to about 17.8% at >= 12. It frames rupture risk; the treatment decision stays with the neurosurgery team and local protocol.';
const PHASES_POP = { na: 0, japanese: 3, finnish: 5 };
const PHASES_SITE = { ica: 0, mca: 2, acaPcomPost: 4 };
const PHASES_RISK = ['0.4%', '0.4%', '0.4%', '0.7%', '0.9%', '1.3%', '1.7%', '2.4%', '3.2%', '4.3%', '5.3%', '7.2%'];

function phasesRisk(total) {
  if (total >= 12) return '17.8%';
  return PHASES_RISK[total];
}

export function phases(input = {}) {
  const age = fin(input.age);
  const size = fin(input.size);
  if (age == null || size == null) {
    return { valid: false, band: 'Enter the patient age (years) and the aneurysm size (mm), then choose the population and site and mark the hypertension and earlier-SAH items, to compute the PHASES score.', note: PHASES_NOTE };
  }
  if (age < 0 || size < 0) {
    return { valid: false, band: 'Age and aneurysm size must be non-negative.', note: PHASES_NOTE };
  }
  const counted = [];
  let total = 0;
  const popKey = PHASES_POP[input.population] != null ? input.population : 'na';
  total += PHASES_POP[popKey];
  if (PHASES_POP[popKey] !== 0) counted.push(`population ${popKey === 'finnish' ? 'Finnish' : 'Japanese'} (+${PHASES_POP[popKey]})`);
  if (onFlag(input.htn)) { total += 1; counted.push('hypertension (+1)'); }
  if (age >= 70) { total += 1; counted.push('age >= 70 (+1)'); }
  const sizePts = size >= 20 ? 10 : size >= 10 ? 6 : size >= 7 ? 3 : 0;
  total += sizePts;
  if (sizePts !== 0) counted.push(`size ${size >= 20 ? '>= 20 mm' : size >= 10 ? '10.0-19.9 mm' : '7.0-9.9 mm'} (+${sizePts})`);
  if (onFlag(input.earlierSah)) { total += 1; counted.push('earlier SAH (+1)'); }
  const siteKey = PHASES_SITE[input.site] != null ? input.site : 'ica';
  total += PHASES_SITE[siteKey];
  if (PHASES_SITE[siteKey] !== 0) counted.push(`site ${siteKey === 'mca' ? 'MCA' : 'ACA/Pcom/posterior'} (+${PHASES_SITE[siteKey]})`);
  total = clamp(total, 0, 22);
  const risk = phasesRisk(total);
  return {
    valid: true, total, risk,
    abnormal: total >= 12,
    band: `PHASES ${total}/22: 5-year cumulative rupture risk ~${risk}.`,
    counted: counted.length ? counted.join(', ') : 'no PHASES points (lowest-risk profile)',
    note: PHASES_NOTE,
  };
}

// --- 2.5 elapss ---------------------------------------------------------------
const ELAPSS_NOTE = 'ELAPSS score (Backes D, Rinkel GJE, Greving JP, et al, Neurology 2017): estimates the 3- and 5-year cumulative growth risk of an unruptured intracranial aneurysm from Earlier SAH (no +1, yes 0 -- a prior treated SAH associates with lower growth risk of the remaining aneurysm), Location (ICA/ACA/ACOM 0, MCA +3, PCOM/posterior circulation +5), Age (<= 60 = 0, then +1 per 5-year band up to +8 above 95), Population (North America/China/Europe 0, Japan +1, Finland +7), Size (1.0-2.9 mm 0, 3.0-4.9 +4, 5.0-6.9 +10, 7.0-9.9 +13, >= 10 +22), and Shape (regular 0, irregular +4), for a published total range of 0-40. The derivation maps the total to a 3-/5-year growth risk rising from about 5.0%/8.4% below 5 points to about 42.7%/60.8% at 25 or more. It frames growth risk; the surveillance decision stays with the neurosurgery team and local protocol.';
const ELAPSS_LOC = { icaAcaAcom: 0, mca: 3, pcomPost: 5 };
const ELAPSS_POP = { na: 0, japan: 1, finland: 7 };
const ELAPSS_RISK = [
  { max: 4, three: '5.0%', five: '8.4%' },
  { max: 9, three: '7.8%', five: '13.0%' },
  { max: 14, three: '11.7%', five: '19.3%' },
  { max: 19, three: '17.5%', five: '28.1%' },
  { max: 24, three: '25.8%', five: '39.9%' },
  { max: Infinity, three: '42.7%', five: '60.8%' },
];

function elapssAgePoints(age) {
  if (age <= 60) return 0;
  return clamp(Math.ceil((age - 60) / 5), 0, 8);
}
function elapssRisk(total) {
  for (const band of ELAPSS_RISK) if (total <= band.max) return band;
  return ELAPSS_RISK[ELAPSS_RISK.length - 1];
}

export function elapss(input = {}) {
  const age = fin(input.age);
  const size = fin(input.size);
  if (age == null || size == null) {
    return { valid: false, band: 'Enter the patient age (years) and the aneurysm size (mm), then choose the earlier-SAH, location, population, and shape items, to compute the ELAPSS score.', note: ELAPSS_NOTE };
  }
  if (age < 0 || size < 0) {
    return { valid: false, band: 'Age and aneurysm size must be non-negative.', note: ELAPSS_NOTE };
  }
  const counted = [];
  let total = 0;
  if (!onFlag(input.earlierSah)) { total += 1; counted.push('no earlier SAH (+1)'); }
  const locKey = ELAPSS_LOC[input.location] != null ? input.location : 'icaAcaAcom';
  total += ELAPSS_LOC[locKey];
  if (ELAPSS_LOC[locKey] !== 0) counted.push(`location ${locKey === 'mca' ? 'MCA' : 'PCOM/posterior'} (+${ELAPSS_LOC[locKey]})`);
  const agePts = elapssAgePoints(age);
  total += agePts;
  if (agePts !== 0) counted.push(`age band (+${agePts})`);
  const popKey = ELAPSS_POP[input.population] != null ? input.population : 'na';
  total += ELAPSS_POP[popKey];
  if (ELAPSS_POP[popKey] !== 0) counted.push(`population ${popKey === 'finland' ? 'Finland' : 'Japan'} (+${ELAPSS_POP[popKey]})`);
  const sizePts = size >= 10 ? 22 : size >= 7 ? 13 : size >= 5 ? 10 : size >= 3 ? 4 : 0;
  total += sizePts;
  if (sizePts !== 0) counted.push(`size ${size >= 10 ? '>= 10 mm' : size >= 7 ? '7.0-9.9 mm' : size >= 5 ? '5.0-6.9 mm' : '3.0-4.9 mm'} (+${sizePts})`);
  if (onFlag(input.irregular)) { total += 4; counted.push('irregular shape (+4)'); }
  total = clamp(total, 0, 40);
  const risk = elapssRisk(total);
  return {
    valid: true, total, riskThree: risk.three, riskFive: risk.five,
    abnormal: total >= 20,
    band: `ELAPSS ${total}/40: aneurysm growth risk ~${risk.three} at 3 years, ~${risk.five} at 5 years.`,
    counted: counted.length ? counted.join(', ') : 'lowest-risk profile (total 0)',
    note: ELAPSS_NOTE,
  };
}
