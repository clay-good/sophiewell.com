// spec-v117 (Wave 4 of the spec-v100 MDCalc Parity Completion program, opens
// the wave): six deterministic acute-stroke imaging-prognosis and
// thrombolysis-risk instruments the stroke team computes the moment the
// NCCT/CTA is read and tPA is on the table. None duplicates a live tile; each
// takes the clinician's imaging *read* (regions affected, diameters measured,
// hyperdensity/hypodensity present) as input -- v117 parses no DICOM, no pixels,
// no radiology report (spec-v117 §7).
//
//   aspects        - Alberta Stroke Program Early CT Score (10 - affected regions)
//   ichVolumeAbc2  - intracerebral hemorrhage volume via the ABC/2 ellipsoid
//   dragonStroke   - DRAGON post-IV-tPA 3-month functional-outcome score
//   hatScore       - Hemorrhage After Thrombolysis (HAT) score
//   sedanScore     - SEDAN symptomatic-ICH-after-thrombolysis score
//   thriveStroke   - THRIVE post-ischemic-stroke outcome / mortality score
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v117.js wire these to the home grid and
// render the spec-v50 §3 clinical-posture note. Each tile reports the score /
// volume and the source's stated risk framing; the thrombolysis, thrombectomy,
// surveillance, or surgical decision stays with the stroke team and local
// protocol -- none authors that order in Sophie's voice (spec-v11 §5.3).
//
// POINT TABLES / OUTCOME BANDS RE-FETCHED, NEVER RECALLED (spec-v97 lesson),
// each cross-verified across >= 2 independent sources (the derivation paper +
// MDCalc / PMC reproductions). NO-FABRICATION notes:
//   - dragonStroke (Strbian 2012, Neurology): D dense-artery/early-infarct on CT
//     (neither 0 / either +1 / both +2), R prestroke mRS > 1 (+1), A age
//     < 65 = 0 / 65-79 = +1 / >= 80 = +2, G glucose > 8 mmol/L (> 144 mg/dL) +1,
//     O onset-to-treatment > 90 min +1, N NIHSS 0-4 = 0 / 5-9 = +1 / 10-15 = +2
//     / >= 16 = +3; total 0-10. The derivation publishes good outcome (mRS 0-2)
//     and miserable outcome (mRS 5-6) ONLY for the grouped extremes (0-1: ~96%
//     good, 0% miserable; 8: ~89% miserable; 9-10: ~97% miserable; 8-10: 0%
//     good). Per-score percentages for the middle range (4-7) are NOT published,
//     so the tile bands 0-3 favorable / 4-7 intermediate / 8-10 miserable and
//     quotes only the robust published anchors -- it invents no middle-band rate.
//   - hatScore (Lou 2008, Neurology): NIHSS < 15 = 0 / 15-20 = +1 / > 20 = +2,
//     CT hypodensity none = 0 / <= 1/3 MCA = +1 / > 1/3 MCA = +2, diabetes or
//     glucose > 200 mg/dL +1; total 0-5. SYMPTOMATIC-ICH series is verbatim from
//     the paper: 0 -> 2%, 1 -> 5%, 2 -> 10%, 3 -> 15%, > 3 -> 44%. The paper's
//     per-score "any ICH" series is figure-locked and was NOT recoverable, so
//     the tile reports the verbatim symptomatic-ICH series only.
//   - sedanScore (Strbian 2012, Ann Neurol): glucose <= 8.0 mmol/L
//     (<= 144 mg/dL) = 0 / 8.1-12.0 (145-216) = +1 / > 12.0 (> 216) = +2, early
//     infarct signs +1, (hyper)dense cerebral artery +1, age > 75 +1, NIHSS
//     >= 10 +1; total 0-6. sICH series verbatim: 0 -> 1.4%, 1 -> 2.9%,
//     2 -> 8.5%, 3 -> 12.2%, 4 -> 21.7%, 5 -> 33.3% (the derivation tabulates
//     through 5 as the top stratum; a score of 6 falls in that >= 5 stratum).
//   - thriveStroke (Flint 2010, AJNR): NIHSS <= 10 = 0 / 11-20 = +2 / >= 21 = +4,
//     age <= 59 = 0 / 60-79 = +1 / >= 80 = +2, +1 each for hypertension,
//     diabetes, atrial fibrillation; total 0-9. The derivation publishes good
//     outcome (mRS 0-2) and 90-day mortality for the extreme bands only (0-2 ->
//     64.7% good / 5.9% mortality; 6-9 -> 10.6% good / 56.4% mortality); the
//     middle band (3-5) original-derivation rates are NOT confidently published,
//     so the tile bands it intermediate with no fabricated percentage.
//   - aspects (Barber 2000, Lancet): ASPECTS = 10 - (count of the 10 affected
//     MCA-territory regions), clamped 0-10; the source dichotomizes at <= 7
//     (worse functional outcome and higher symptomatic-hemorrhage risk).
//   - ichVolumeAbc2 (Kothari 1996, Stroke): volume = A x B x C / 2 (cm -> mL),
//     a fixed geometric approximation; >= 30 mL is the ICH-score threshold.

import { r1 } from './num.js';

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);

// --- 2.1 aspects --------------------------------------------------------------
const ASPECTS_NOTE = 'Alberta Stroke Program Early CT Score (Barber PA, Demchuk AM, Zhang J, Buchan AM, Lancet 2000): a 10-point topographic score of early ischemic change on the baseline non-contrast CT in the middle-cerebral-artery territory. Ten regions are assessed -- caudate, lentiform nucleus, internal capsule, insular ribbon, and the cortical regions M1 through M6 -- and ONE point is subtracted from 10 for each region showing early ischemic change, so 10 is a normal scan and 0 is diffuse ischemia across the territory. The source dichotomizes at <= 7, where lower scores predict worse functional outcome and a higher risk of symptomatic hemorrhage after thrombolysis. It reports the imaging score; the reperfusion (thrombolysis / thrombectomy) decision is applied through evolving reperfusion guidelines and stays with the stroke team and local protocol.';
const ASPECTS_REGIONS = [
  ['caudate', 'caudate'],
  ['lentiform', 'lentiform nucleus'],
  ['internalCapsule', 'internal capsule'],
  ['insula', 'insular ribbon'],
  ['m1', 'M1'], ['m2', 'M2'], ['m3', 'M3'],
  ['m4', 'M4'], ['m5', 'M5'], ['m6', 'M6'],
];

export function aspects(input = {}) {
  const affected = [];
  for (const [key, label] of ASPECTS_REGIONS) {
    if (onFlag(input[key])) affected.push(label);
  }
  const n = clamp(affected.length, 0, 10);
  const score = clamp(10 - n, 0, 10);
  const low = score <= 7;
  return {
    valid: true, score, affected: n,
    abnormal: low,
    band: `ASPECTS ${score}/10 (${n} of 10 regions with early ischemic change): ${low ? 'ASPECTS <= 7 -- associated with worse functional outcome and higher symptomatic-hemorrhage risk' : 'favorable range (> 7)'}.`,
    regions: affected.length ? affected.join(', ') : 'no region marked (normal scan)',
    note: ASPECTS_NOTE,
  };
}

// --- 2.2 ich-volume-abc2 ------------------------------------------------------
const ICH_VOL_NOTE = 'ABC/2 intracerebral hemorrhage volume (Kothari RU, Brott T, Broderick JP, et al, Stroke 1996): a bedside ellipsoid approximation of hematoma volume from three orthogonal non-contrast CT diameters -- A (the greatest diameter on the slice with the largest hemorrhage), B (the diameter perpendicular to A on that slice), and C (the vertical extent, taken either as a measured craniocaudal diameter or as the number of slices with hemorrhage times the slice thickness). Volume in mL = A x B x C / 2 with all three lengths in cm. A volume of 30 mL or more is the threshold the ICH Score (Hemphill 2001) counts as a point. It reports the estimated volume; the surgical and monitoring decisions stay with the clinician and local protocol.';

export function ichVolumeAbc2(input = {}) {
  const a = fin(input.a);
  const b = fin(input.b);
  const c = fin(input.c);
  if (a == null || b == null || c == null) {
    return { valid: false, band: 'Enter the three orthogonal hematoma diameters A, B, and C (cm) from the CT to estimate the ABC/2 volume.', note: ICH_VOL_NOTE };
  }
  if (a < 0 || b < 0 || c < 0) {
    return { valid: false, band: 'Each hematoma diameter must be non-negative; enter the measured lengths in cm.', note: ICH_VOL_NOTE };
  }
  const vol = (a * b * c) / 2;
  if (!Number.isFinite(vol)) {
    return { valid: false, band: 'The hematoma volume could not be computed from the values entered; check the three diameters.', note: ICH_VOL_NOTE };
  }
  const v = r1(vol);
  const meets = v >= 30;
  return {
    valid: true, volume: v,
    abnormal: meets,
    band: `ICH volume ${v} mL by ABC/2${meets ? ' -- meets the ICH-score >= 30 mL threshold (+1 point)' : ' -- below the ICH-score 30 mL threshold'}.`,
    detail: `A ${r1(a)} x B ${r1(b)} x C ${r1(c)} cm / 2`,
    note: ICH_VOL_NOTE,
  };
}

// --- 2.3 dragon-stroke --------------------------------------------------------
const DRAGON_NOTE = 'DRAGON score (Strbian D, Meretoja A, Ahlhelm FJ, et al, Neurology 2012): predicts 3-month functional outcome after IV thrombolysis for ischemic stroke from (hyper)Dense cerebral artery sign / early infarct signs on baseline CT (neither 0, either +1, both +2), prestroke Rankin > 1 (+1), Age (< 65 = 0, 65-79 = +1, >= 80 = +2), Glucose > 8 mmol/L / > 144 mg/dL (+1), Onset-to-treatment > 90 min (+1), and baseline NIHSS (0-4 = 0, 5-9 = +1, 10-15 = +2, >= 16 = +3), for a total of 0-10. The derivation reports good outcome (mRS 0-2) of about 96% at scores 0-1 and 0% at scores 8-10, and miserable outcome (mRS 5-6) of about 89% at 8 and 97% at 9-10; the middle range is intermediate. It frames prognosis; the treatment decision stays with the stroke team and local protocol.';
const DRAGON_CT = { neither: 0, either: 1, both: 2 };

export function dragonStroke(input = {}) {
  const age = fin(input.age);
  const onset = fin(input.onset);
  const nihss = fin(input.nihss);
  if (age == null || onset == null || nihss == null) {
    return { valid: false, band: 'Enter the patient age, the onset-to-treatment time (min), and the baseline NIHSS, then choose the CT finding and mark the prestroke-mRS and glucose items, to compute the DRAGON score.', note: DRAGON_NOTE };
  }
  if (age < 0 || onset < 0 || nihss < 0) {
    return { valid: false, band: 'Age, onset-to-treatment time, and NIHSS must be non-negative.', note: DRAGON_NOTE };
  }
  const counted = [];
  let total = 0;
  const ctKey = DRAGON_CT[input.ct] != null ? input.ct : 'neither';
  total += DRAGON_CT[ctKey];
  if (DRAGON_CT[ctKey] !== 0) counted.push(`CT ${ctKey === 'both' ? 'dense artery + early infarct' : 'one CT sign'} (+${DRAGON_CT[ctKey]})`);
  if (onFlag(input.mrs)) { total += 1; counted.push('prestroke mRS > 1 (+1)'); }
  const agePts = age >= 80 ? 2 : age >= 65 ? 1 : 0;
  total += agePts;
  if (agePts !== 0) counted.push(`age ${age >= 80 ? '>= 80' : '65-79'} (+${agePts})`);
  if (onFlag(input.glucose)) { total += 1; counted.push('glucose > 8 mmol/L (+1)'); }
  if (onset > 90) { total += 1; counted.push('onset-to-treatment > 90 min (+1)'); }
  const nPts = nihss >= 16 ? 3 : nihss >= 10 ? 2 : nihss >= 5 ? 1 : 0;
  total += nPts;
  if (nPts !== 0) counted.push(`NIHSS ${nihss >= 16 ? '>= 16' : nihss >= 10 ? '10-15' : '5-9'} (+${nPts})`);
  const tier = total <= 3
    ? { name: 'favorable', text: 'favorable prognosis (good 3-month outcome, mRS 0-2, ~96% at scores 0-1)' }
    : total <= 7
      ? { name: 'intermediate', text: 'intermediate prognosis' }
      : { name: 'miserable', text: 'miserable prognosis (mRS 0-2 ~0%; miserable outcome, mRS 5-6, ~89-97% at scores 8-10)' };
  return {
    valid: true, total, tier: tier.name,
    abnormal: total >= 8,
    band: `DRAGON ${total}/10: ${tier.text}.`,
    counted: counted.length ? counted.join(', ') : 'no DRAGON points (all baseline)',
    note: DRAGON_NOTE,
  };
}

// --- 2.4 hat-score ------------------------------------------------------------
const HAT_NOTE = 'HAT score (Lou M, Safdar A, Mehdiratta M, et al, Neurology 2008): predicts hemorrhage after IV thrombolysis from baseline NIHSS (< 15 = 0, 15-20 = +1, > 20 = +2), hypodensity on the initial CT (none = 0, <= 1/3 of the MCA territory = +1, > 1/3 = +2), and a history of diabetes or admission glucose > 200 mg/dL (+1), for a total of 0-5. The derivation reports the rate of symptomatic intracranial hemorrhage as 2% at 0 points, 5% at 1, 10% at 2, 15% at 3, and 44% above 3. It frames hemorrhage risk; the thrombolysis decision stays with the stroke team and local protocol.';
const HAT_HYPO = { none: 0, third: 1, more: 2 };
const HAT_SICH = ['2%', '5%', '10%', '15%', '44%', '44%'];

export function hatScore(input = {}) {
  const nihss = fin(input.nihss);
  if (nihss == null) {
    return { valid: false, band: 'Enter the baseline NIHSS, then choose the CT hypodensity extent and mark the diabetes / glucose item, to compute the HAT score.', note: HAT_NOTE };
  }
  if (nihss < 0) {
    return { valid: false, band: 'The baseline NIHSS must be non-negative.', note: HAT_NOTE };
  }
  const counted = [];
  let total = 0;
  const nPts = nihss > 20 ? 2 : nihss >= 15 ? 1 : 0;
  total += nPts;
  if (nPts !== 0) counted.push(`NIHSS ${nihss > 20 ? '> 20' : '15-20'} (+${nPts})`);
  const hypoKey = HAT_HYPO[input.hypodensity] != null ? input.hypodensity : 'none';
  total += HAT_HYPO[hypoKey];
  if (HAT_HYPO[hypoKey] !== 0) counted.push(`CT hypodensity ${hypoKey === 'more' ? '> 1/3 MCA' : '<= 1/3 MCA'} (+${HAT_HYPO[hypoKey]})`);
  if (onFlag(input.diabetes)) { total += 1; counted.push('diabetes or glucose > 200 mg/dL (+1)'); }
  const sich = HAT_SICH[clamp(total, 0, 5)];
  return {
    valid: true, total, sich,
    abnormal: total >= 3,
    band: `HAT ${total}/5: symptomatic ICH risk after thrombolysis ~${sich}.`,
    counted: counted.length ? counted.join(', ') : 'no HAT points (all baseline)',
    note: HAT_NOTE,
  };
}

// --- 2.5 sedan-score ----------------------------------------------------------
const SEDAN_NOTE = 'SEDAN score (Strbian D, Engelter S, Michel P, et al, Ann Neurol 2012): predicts symptomatic intracranial hemorrhage after IV thrombolysis from blood Sugar / baseline glucose (<= 8.0 mmol/L / <= 144 mg/dL = 0, 8.1-12.0 / 145-216 = +1, > 12.0 / > 216 = +2), Early infarct signs on admission CT (+1), (hyper)Dense cerebral artery sign (+1), Age > 75 (+1), and baseline NIHSS >= 10 (+1), for a total of 0-6. The derivation reports the symptomatic-ICH rate as 1.4% at 0, 2.9% at 1, 8.5% at 2, 12.2% at 3, 21.7% at 4, and 33.3% at 5 (the top stratum). It frames hemorrhage risk; the thrombolysis decision stays with the stroke team and local protocol.';
const SEDAN_GLU = { low: 0, mid: 1, high: 2 };
const SEDAN_SICH = ['1.4%', '2.9%', '8.5%', '12.2%', '21.7%', '33.3%'];

export function sedanScore(input = {}) {
  const age = fin(input.age);
  const nihss = fin(input.nihss);
  if (age == null || nihss == null) {
    return { valid: false, band: 'Enter the patient age and the baseline NIHSS, then choose the glucose band and mark the early-infarct and dense-artery items, to compute the SEDAN score.', note: SEDAN_NOTE };
  }
  if (age < 0 || nihss < 0) {
    return { valid: false, band: 'Age and NIHSS must be non-negative.', note: SEDAN_NOTE };
  }
  const counted = [];
  let total = 0;
  const gluKey = SEDAN_GLU[input.glucose] != null ? input.glucose : 'low';
  total += SEDAN_GLU[gluKey];
  if (SEDAN_GLU[gluKey] !== 0) counted.push(`glucose ${gluKey === 'high' ? '> 12.0 mmol/L' : '8.1-12.0 mmol/L'} (+${SEDAN_GLU[gluKey]})`);
  if (onFlag(input.early)) { total += 1; counted.push('early infarct signs (+1)'); }
  if (onFlag(input.dense)) { total += 1; counted.push('dense cerebral artery sign (+1)'); }
  if (age > 75) { total += 1; counted.push('age > 75 (+1)'); }
  if (nihss >= 10) { total += 1; counted.push('NIHSS >= 10 (+1)'); }
  const sich = SEDAN_SICH[clamp(total, 0, 5)];
  return {
    valid: true, total, sich,
    abnormal: total >= 3,
    band: `SEDAN ${total}/6: symptomatic ICH risk after thrombolysis ~${sich}.`,
    counted: counted.length ? counted.join(', ') : 'no SEDAN points (all baseline)',
    note: SEDAN_NOTE,
  };
}

// --- 2.6 thrive-stroke --------------------------------------------------------
const THRIVE_NOTE = 'THRIVE score (Flint AC, Cullen SP, Faigeles BS, Rao VA, AJNR 2010): the Totaled Health Risks In Vascular Events score predicts long-term outcome after ischemic stroke from baseline NIHSS (<= 10 = 0, 11-20 = +2, >= 21 = +4), Age (<= 59 = 0, 60-79 = +1, >= 80 = +2), and a chronic-disease count of hypertension, diabetes, and atrial fibrillation (+1 each), for a total of 0-9. The derivation reports good outcome (mRS 0-2) of about 64.7% with 5.9% mortality in the low band (0-2) and about 10.6% with 56.4% mortality in the high band (6-9); the middle band (3-5) is intermediate. It frames prognosis; the treatment decision stays with the stroke team and local protocol.';

export function thriveStroke(input = {}) {
  const age = fin(input.age);
  const nihss = fin(input.nihss);
  if (age == null || nihss == null) {
    return { valid: false, band: 'Enter the patient age and the baseline NIHSS, then mark the hypertension, diabetes, and atrial-fibrillation items, to compute the THRIVE score.', note: THRIVE_NOTE };
  }
  if (age < 0 || nihss < 0) {
    return { valid: false, band: 'Age and NIHSS must be non-negative.', note: THRIVE_NOTE };
  }
  const counted = [];
  let total = 0;
  const nPts = nihss >= 21 ? 4 : nihss >= 11 ? 2 : 0;
  total += nPts;
  if (nPts !== 0) counted.push(`NIHSS ${nihss >= 21 ? '>= 21' : '11-20'} (+${nPts})`);
  const agePts = age >= 80 ? 2 : age >= 60 ? 1 : 0;
  total += agePts;
  if (agePts !== 0) counted.push(`age ${age >= 80 ? '>= 80' : '60-79'} (+${agePts})`);
  if (onFlag(input.htn)) { total += 1; counted.push('hypertension (+1)'); }
  if (onFlag(input.diabetes)) { total += 1; counted.push('diabetes (+1)'); }
  if (onFlag(input.afib)) { total += 1; counted.push('atrial fibrillation (+1)'); }
  const tier = total <= 2
    ? { name: 'low risk (THRIVE I)', text: 'low risk (THRIVE I) -- good outcome (mRS 0-2) ~64.7%, 90-day mortality ~5.9%' }
    : total <= 5
      ? { name: 'intermediate risk (THRIVE II)', text: 'intermediate risk (THRIVE II) -- prognosis between the favorable (0-2) and poor (6-9) strata' }
      : { name: 'high risk (THRIVE III)', text: 'high risk (THRIVE III) -- good outcome (mRS 0-2) ~10.6%, 90-day mortality ~56.4%' };
  return {
    valid: true, total, tier: tier.name,
    abnormal: total >= 6,
    band: `THRIVE ${total}/9: ${tier.text}.`,
    counted: counted.length ? counted.join(', ') : 'no THRIVE points (all baseline)',
    note: THRIVE_NOTE,
  };
}
