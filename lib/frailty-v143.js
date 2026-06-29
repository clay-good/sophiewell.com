// spec-v143 (Wave 8 of the spec-v100 MDCalc Parity Completion program): five
// frailty and geriatric-oncology screening instruments that deepen the
// charlson / cfs frailty-comorbidity panel and the ecog-karnofsky oncology
// cluster. None duplicates a live tile; v143 parses no report and runs no AI.
//
//   mfi5          - Modified 5-Item Frailty Index (deficit count 0-5)
//   mfi11         - Modified 11-Item Frailty Index (deficit fraction count/11)
//   frailScale    - Morley FRAIL Scale (0-5 -> robust / pre-frail / frail)
//   ves13         - Vulnerable Elders Survey-13 (0-10 -> >= 3 vulnerable)
//   cargToxicity  - CARG chemotherapy-toxicity tool (weighted -> low/int/high)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v143.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the score / risk band and the source's framing;
// the treat/withhold-chemotherapy decision stays with the clinician and local
// protocol (spec-v11 §5.3).
//
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - mfi5 (Subramaniam S, Aalberg JJ, Soriano RP, Divino CM, J Am Coll Surg
//     2018;226(2):173-181): five accumulated deficits, each 0/1 -- diabetes
//     mellitus, hypertension requiring medication, COPD/pneumonia history,
//     congestive heart failure, and partially/totally dependent functional
//     status. The count (0-5) is reported; a count >= 2 is the commonly-cited
//     frailty threshold for elevated postoperative morbidity/mortality. Class A.
//   - mfi11 (Velanovich V, Antoine H, Swartz A, et al, J Surg Res
//     2013;183(1):104-110): the original eleven deficits, each 0/1 -- diabetes,
//     dependent functional status, COPD/pneumonia, CHF, MI history, prior cardiac
//     intervention/angina, hypertension, peripheral vascular disease/rest pain,
//     impaired sensorium, TIA/CVA, and CVA with neurological deficit. Reported as
//     the deficit fraction (count / 11); the divisor is the fixed constant 11, so
//     no division-by-zero path exists. Class A.
//   - frailScale (Morley JE, Malmstrom TK, Miller DK, J Nutr Health Aging
//     2012;16(7):601-608): five items, each 0/1 -- Fatigue, Resistance (climbing
//     one flight), Ambulation (walking one block), Illnesses (>= 5 of 11 listed),
//     and Loss of weight (> 5%) -- summing 0-5. Bands: 0 robust, 1-2 pre-frail,
//     >= 3 frail. Class A.
//   - ves13 (Saliba D, Elliott M, Rubenstein LZ, et al, J Am Geriatr Soc
//     2001;49(12):1691-1699): total 0-10 = age (75-84 -> 1, >= 85 -> 3; else 0)
//     + self-rated health (fair/poor -> 1) + physical function (1 point for each
//     of 6 tasks rated "a lot of difficulty" or "unable", CAPPED at 2) + a single
//     ALL-OR-NOTHING functional-disability block (any of 5 ADL/IADL disabilities
//     -> 4 points, never additive). A score >= 3 = vulnerable (~4.2-fold 2-year
//     risk of functional decline or death). The 4-point disability rule (not 1)
//     is what makes the max 3+1+2+4 = 10; two online instrument reproductions
//     mis-print it as 1 point -- the original Saliba 4-point rule is used. Class A.
//   - cargToxicity (Hurria A, Togawa K, Mohile SG, et al, J Clin Oncol
//     2011;29(25):3457-3465, Table 4 verbatim): eleven weighted predictors --
//     age >= 72 (2), GI/GU cancer (2), standard-dose chemo (2), polychemotherapy
//     (2), haemoglobin low by sex (3), creatinine clearance < 34 mL/min (3),
//     hearing fair or worse (2), >= 1 fall in 6 months (3), needs help with
//     medications (1), limited in walking one block (2), decreased social activity
//     (1). The arithmetic maximum is 23 (the derivation cohort observed 0-19).
//     Bands: low 0-5 (~30% grade 3-5 toxicity), intermediate 6-9 (~52%), high
//     >= 10 (~83%). The creatinine-clearance input is a banded select (< 34 vs
//     >= 34 mL/min) rather than a recomputed CrCl, so the tile stays deterministic
//     and does not shadow cockcroft-gault. Class A (fixed 2011 weights).

import { r1 } from './num.js';

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

// --- 2.1 mFI-5 ---------------------------------------------------------------
const MFI5 = [
  ['diabetes', 'diabetes mellitus'],
  ['hypertension', 'hypertension requiring medication'],
  ['copd', 'COPD or pneumonia history'],
  ['chf', 'congestive heart failure'],
  ['dependent', 'partially or totally dependent functional status'],
];
const MFI5_NOTE = 'Modified 5-Item Frailty Index (Subramaniam S, Aalberg JJ, Soriano RP, Divino CM, J Am Coll Surg 2018) — an accumulated-deficit frailty count derived from the ACS-NSQIP database that performs comparably to the original 11-item index. Five deficits (diabetes, hypertension requiring medication, COPD/pneumonia, congestive heart failure, and dependent functional status) are each counted, giving a 0–5 total; a count of 2 or more is the commonly-cited frailty threshold for elevated postoperative morbidity and mortality. It reports the deficit count and that framing; the perioperative decision stays with the surgical and geriatric team.';

export function mfi5(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let count = 0;
  const counted = [];
  for (const [key, label] of MFI5) {
    if (onFlag(o[key])) { count += 1; counted.push(label); }
  }
  return {
    valid: true,
    score: count,
    abnormal: count >= 2,
    counted,
    band: `mFI-5 deficit count ${count}/5${count >= 2 ? ' — at or above the frailty threshold (≥ 2)' : count === 1 ? ' — below the frailty threshold (≥ 2)' : ' — no deficits counted'}.`,
    note: MFI5_NOTE,
  };
}

// --- 2.2 mFI-11 --------------------------------------------------------------
const MFI11 = [
  ['diabetes', 'diabetes mellitus'],
  ['dependent', 'dependent functional status'],
  ['copd', 'COPD or pneumonia history'],
  ['chf', 'congestive heart failure'],
  ['mi', 'myocardial infarction history'],
  ['cardiac', 'prior cardiac intervention, cardiac surgery, or angina'],
  ['hypertension', 'hypertension requiring medication'],
  ['pvd', 'peripheral vascular disease or rest pain'],
  ['sensorium', 'impaired sensorium'],
  ['tia', 'transient ischemic attack or stroke'],
  ['cvaDeficit', 'stroke with neurological deficit'],
];
const MFI11_NOTE = 'Modified 11-Item Frailty Index (Velanovich V, Antoine H, Swartz A, et al, J Surg Res 2013) — the original accumulated-deficit frailty index, mapping eleven ACS-NSQIP comorbidity/functional variables onto the Canadian Study of Health and Aging frailty index. The number of deficits is reported as a fraction of 11; a higher fraction tracks rising postoperative morbidity and mortality. The validated 5-item index (mFI-5) performs comparably and is cross-linked. It reports the deficit fraction; the clinical decision stays with the care team.';

export function mfi11(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let count = 0;
  const counted = [];
  for (const [key, label] of MFI11) {
    if (onFlag(o[key])) { count += 1; counted.push(label); }
  }
  const fraction = r1((count / 11) * 100); // percentage of the 11 deficits present
  return {
    valid: true,
    score: count,
    fractionPct: fraction,
    abnormal: count >= 3,
    counted,
    band: `mFI-11 deficits ${count}/11 (index ${fraction}%): a higher accumulated-deficit fraction tracks rising postoperative risk.`,
    note: MFI11_NOTE,
  };
}

// --- 2.3 FRAIL Scale ---------------------------------------------------------
const FRAIL = [
  ['fatigue', 'Fatigue'],
  ['resistance', 'Resistance (difficulty climbing one flight of stairs)'],
  ['ambulation', 'Ambulation (difficulty walking one block)'],
  ['illnesses', 'Illnesses (≥ 5 of 11 listed conditions)'],
  ['weightLoss', 'Loss of weight (> 5% in the past year)'],
];
const FRAIL_NOTE = 'FRAIL Scale (Morley JE, Malmstrom TK, Miller DK, J Nutr Health Aging 2012) — a five-item bedside frailty screen: Fatigue, Resistance (climbing one flight of stairs), Ambulation (walking one block), Illnesses (five or more of eleven listed conditions), and Loss of weight (more than 5%). One point each gives a 0–5 total: 0 = robust, 1–2 = pre-frail, 3 or more = frail. It reports the total and band; the management plan stays with the clinical team.';

export function frailScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let count = 0;
  const positive = [];
  for (const [key, label] of FRAIL) {
    if (onFlag(o[key])) { count += 1; positive.push(label); }
  }
  const category = count >= 3 ? 'frail' : count >= 1 ? 'pre-frail' : 'robust';
  return {
    valid: true,
    score: count,
    category,
    abnormal: count >= 3,
    positive,
    band: `FRAIL Scale ${count}/5: ${category} (0 = robust, 1–2 = pre-frail, ≥ 3 = frail).`,
    note: FRAIL_NOTE,
  };
}

// --- 2.4 VES-13 --------------------------------------------------------------
const VES_PHYS = ['stooping', 'lifting', 'reaching', 'writing', 'walking', 'housework'];
const VES_AGE = { under75: 0, '75to84': 1, '85plus': 3 };
const VES_NOTE = 'Vulnerable Elders Survey-13 (Saliba D, Elliott M, Rubenstein LZ, et al, J Am Geriatr Soc 2001) — a 13-item community screen for vulnerable older adults, widely used as the first step of a geriatric-oncology assessment. The 0–10 total combines age (75–84 = 1, ≥ 85 = 3), fair/poor self-rated health (1), physical-function difficulty (1 point per task rated "a lot" or "unable", capped at 2), and a single 4-point block for any of five ADL/IADL disabilities. A score of 3 or more flags a roughly four-fold two-year risk of functional decline or death. It reports the total and that threshold; the next step stays with the clinician.';

export function ves13(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const domains = [];
  // Age band.
  const agePts = o.age in VES_AGE ? VES_AGE[o.age] : 0;
  if (agePts > 0) { total += agePts; domains.push(`age (${agePts} pt${agePts > 1 ? 's' : ''})`); }
  // Self-rated health: fair or poor scores 1.
  if (o.health === 'fair' || o.health === 'poor') { total += 1; domains.push('fair/poor self-rated health (1)'); }
  // Physical function: 1 point per task rated "a lot" or "unable", capped at 2.
  let physCount = 0;
  for (const k of VES_PHYS) { if (o[k] === 'alot' || o[k] === 'unable') physCount += 1; }
  const physPts = physCount > 2 ? 2 : physCount;
  if (physPts > 0) { total += physPts; domains.push(`physical-function limitation (${physPts})`); }
  // Functional disability: all-or-nothing 4 points for any of the 5 ADL/IADL items.
  const anyDisability = onFlag(o.shopping) || onFlag(o.money) || onFlag(o.walkRoom) || onFlag(o.lightHousework) || onFlag(o.bathing);
  if (anyDisability) { total += 4; domains.push('functional disability (4)'); }
  const vulnerable = total >= 3;
  return {
    valid: true,
    score: total,
    abnormal: vulnerable,
    domains,
    band: `VES-13 total ${total}/10: ${vulnerable ? 'vulnerable (≥ 3) — about a four-fold two-year risk of functional decline or death' : 'not vulnerable (below the ≥ 3 threshold)'}.`,
    note: VES_NOTE,
  };
}

// --- 2.5 CARG chemotherapy-toxicity tool -------------------------------------
const CARG = [
  ['age72', 2, 'age 72 or older'],
  ['giGu', 2, 'gastrointestinal or genitourinary cancer'],
  ['standardDose', 2, 'standard-dose chemotherapy'],
  ['polychemo', 2, 'polychemotherapy (more than one agent)'],
  ['anemia', 3, 'hemoglobin low for sex (< 11 g/dL male, < 10 g/dL female)'],
  ['lowCrCl', 3, 'creatinine clearance < 34 mL/min'],
  ['hearing', 2, 'hearing fair or worse'],
  ['falls', 3, 'one or more falls in the last 6 months'],
  ['medHelp', 1, 'needs help taking medications'],
  ['walkLimited', 2, 'limited in walking one block'],
  ['socialDecreased', 1, 'decreased social activity because of health'],
];
const CARG_BANDS = [
  { max: 5, band: 'low', rate: 'about 30% grade 3–5 toxicity' },
  { max: 9, band: 'intermediate', rate: 'about 52% grade 3–5 toxicity' },
  { max: 23, band: 'high', rate: 'about 83% grade 3–5 toxicity' },
];
const CARG_NOTE = 'CARG Chemotherapy Toxicity Tool (Hurria A, Togawa K, Mohile SG, et al, J Clin Oncol 2011) — the Cancer and Aging Research Group predictor of grade 3–5 chemotherapy toxicity in adults aged 65 and older. Eleven weighted predictors (age, GI/GU cancer, standard-dose chemotherapy, polychemotherapy, anaemia, low creatinine clearance, hearing, falls, medication assistance, walking limitation, and decreased social activity) sum to a score banded low (0–5, ~30%), intermediate (6–9, ~52%), or high (≥ 10, ~83%). The creatinine-clearance input is a banded yes/no; compute the value itself with the Cockcroft–Gault tile. It reports the score and risk band; the treatment decision stays with the oncologist and local protocol.';

export function cargToxicity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const counted = [];
  for (const [key, weight, label] of CARG) {
    if (onFlag(o[key])) { total += weight; counted.push(`${label} (${weight})`); }
  }
  const b = CARG_BANDS.find((x) => total <= x.max);
  return {
    valid: true,
    score: total,
    band: b.band,
    rate: b.rate,
    abnormal: total >= 6,
    counted,
    bandText: `CARG score ${total}: ${b.band} risk — ${b.rate}.`,
    note: CARG_NOTE,
  };
}
