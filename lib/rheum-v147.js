// spec-v147 (Wave 8 of the spec-v100 MDCalc Parity Completion program): seven
// rheumatology disease-activity and classification instruments that fill
// confirmed gaps beside the existing das28 anchor. None duplicates a live tile;
// v147 parses no image, runs no AI, and makes no runtime network call.
//
//   cdaiRa              - Clinical Disease Activity Index, RA            (0-76)
//   sdaiRa              - Simplified Disease Activity Index, RA          (0-86)
//   acrEular2010Ra      - 2010 ACR/EULAR RA classification              (0-10, >=6 RA)
//   sledai2k            - SLEDAI-2K SLE disease-activity index           (0-105)
//   goutAcrEular2015    - 2015 ACR/EULAR gout classification            (>=8 gout)
//   caspar              - CASPAR psoriatic-arthritis classification     (>=3 + entry)
//   fibromyalgiaAcr2016 - 2016 revised ACR fibromyalgia criteria        (met / not met)
//
// Per the spec-v100 §2 classification clarification, each tile CONSUMES the
// clinician's read of the joint exam, serology, synovial fluid, and imaging as
// bounded inputs and COMPUTES a score / classification + the source's
// interpretation -- none is a no-input reference table. Pure functions only
// (spec-v29 §3 one-line test). Citations live inline in lib/meta.js; renderers
// in views/group-v147.js render the spec-v50 §3 clinical-posture note. The
// treat / escalate / DMARD decision stays with the rheumatologist (spec-v11
// §5.3).
//
// DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent authoritative sources (the original papers, MDCalc,
// the official ACR/EULAR gout-classification web calculator at
// goutclassificationcalculator.auckland.ac.nz, StatPearls, the Bateman Horne
// Center fibromyalgia form, and published SLEDAI-2K / CDAI / SDAI forms).
// NO-FABRICATION / SOURCE-GOVERNANCE:
//   - cdaiRa (Aletaha 2005, Arthritis Res Ther 7(4):R796): a plain linear sum
//     SJC28 + TJC28 + patient-global + physician-global, each global on a raw
//     0-10 cm VAS, no acute-phase reactant. Total 0-76. Bands remission <= 2.8,
//     low <= 10, moderate <= 22, high > 22 (lower band edges are >). Class A.
//   - sdaiRa (Smolen 2003, Rheumatology 42(2):244): the CDAI inputs PLUS CRP in
//     mg/dL (raw, not transformed). Total 0-86. Bands remission <= 3.3, low <=
//     11, moderate <= 26, high > 26. CRP must be mg/dL not mg/L (the common
//     transcription trap); the addend is guarded finite/non-negative. Class A.
//   - acrEular2010Ra (Aletaha 2010, Arthritis Rheum 62(9):2569): applied only
//     after the entry condition (>= 1 joint with definite clinical synovitis not
//     better explained otherwise). Four domains, the single highest level per
//     domain: joints (1 large 0 / 2-10 large 1 / 1-3 small 2 / 4-10 small 3 /
//     >10 with >=1 small 5), serology (neg RF & ACPA 0 / low-positive 2 /
//     high-positive 3), acute-phase (normal CRP & ESR 0 / abnormal either 1),
//     duration (<6 wk 0 / >=6 wk 1). Total 0-10; >= 6 = definite RA. Class B.
//   - sledai2k (Gladman 2002, J Rheumatol 29(2):288): 24 weighted descriptors,
//     weights 8/4/2/1, present-or-absent, summed. Max 105. SLEDAI-2K (vs the
//     original SLEDAI) scores ONGOING activity for rash, alopecia, mucosal
//     ulcers, and proteinuria, not only new/recurrent. >= 6 denotes clinically
//     important active disease; the 0 / 1-5 / 6-10 / 11-19 / >=20 severity
//     grouping is a widely reproduced convention, not from the 2002 paper, so it
//     is presented as such. Class A.
//   - goutAcrEular2015 (Neogi 2015, Arthritis Rheumatol 67(10):2557): entry
//     criterion (>= 1 episode of peripheral joint/bursa swelling/pain/
//     tenderness) gates the rule; the sufficient criterion (MSU crystals in a
//     symptomatic joint/bursa or tophus) classifies directly without scoring.
//     Otherwise weighted domains -- pattern (0/1/2), episode characteristics
//     (0/1/2/3), time-course (0/1/2), tophus (0/4), serum urate (<4 mg/dL = -4,
//     4-<6 = 0, 6-<8 = 2, 8-<10 = 3, >=10 = 4), synovial fluid (not done 0, MSU-
//     negative -2), imaging urate deposition (0/4), imaging gout-damage erosion
//     (0/4). The two NEGATIVE items (-4 serum urate, -2 synovial) are confirmed
//     with sign; "not done" scores 0, not the negative. Max 23; >= 8 = gout.
//     Class B.
//   - caspar (Taylor 2006, Arthritis Rheum 54(8):2665): applied after the entry
//     condition (established inflammatory articular disease -- joint, spine, or
//     entheseal). Items: psoriasis (current 2 / personal history 1 / family
//     history 1 -- mutually exclusive, the single highest applies / none 0),
//     psoriatic nail dystrophy 1, negative RF 1, dactylitis (current or
//     rheumatologist-recorded history) 1, juxta-articular new bone formation on
//     radiograph 1. Max 6; entry AND >= 3 points = CASPAR-positive. Current
//     psoriasis (2) is the only 2-point item. Class B.
//   - fibromyalgiaAcr2016 (Wolfe 2016, Semin Arthritis Rheum 46(3):319): the
//     Widespread Pain Index (WPI, 0-19 regions) and Symptom Severity Scale (SSS,
//     0-12 = fatigue 0-3 + waking-unrefreshed 0-3 + cognitive 0-3 + somatic
//     symptom count 0-3, where the 2016 somatic item is the COUNT of headaches /
//     lower-abdominal pain / depression over 6 months, each 0 or 1, NOT a
//     severity scale). Criteria met when (WPI >= 7 and SSS >= 5) OR (WPI 4-6 and
//     SSS >= 9), AND generalized pain (>= 4 of 5 regions), AND symptoms >= 3
//     months. The diagnosis is valid irrespective of other diagnoses. Class A.

import { num, r1 } from './num.js';

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

// --- shared helpers ----------------------------------------------------------

// Generic bounded weighted sum over a list of { key, label, map } select
// components (option -> { pts, label }). A blank/unknown selection makes the
// whole tile valid:false with a complete-the-fields message so a partial total
// is never scored as if a missing component were zero.
function sumComponents(o, components) {
  let total = 0;
  const parts = [];
  const missing = [];
  for (const c of components) {
    const opt = c.map[o[c.key]];
    if (!opt) { missing.push(c.label); continue; }
    total += opt.pts;
    if (opt.pts !== 0) parts.push(`${c.label} ${opt.label} (${opt.pts > 0 ? '+' : ''}${opt.pts})`);
  }
  return { total, parts, missing };
}
function needMessage(missing, count) {
  return `Choose all ${count} inputs — ${missing.length} still needed: ${missing.join(', ')}.`;
}
// Read a required finite numeric field; collect a label into `missing` when the
// value is absent/non-numeric rather than scoring a blank as zero.
function reqNum(o, key, label, opts, missing) {
  const v = o[key];
  if (v === null || v === undefined || v === '' || typeof v !== 'number' || !Number.isFinite(v)) {
    missing.push(label);
    return null;
  }
  return num(label, v, opts);
}

// --- 2.1 CDAI — Clinical Disease Activity Index ------------------------------
const CDAI_NOTE = 'Clinical Disease Activity Index (Aletaha D, Nell VPK, Stamm T, et al, Arthritis Res Ther 2005;7(4):R796-R806) — a lab-free composite for rheumatoid arthritis activity. It is the plain linear sum of the 28-joint swollen-joint count (0–28), the 28-joint tender-joint count (0–28), the patient global assessment (0–10 cm VAS), and the physician/evaluator global assessment (0–10 cm VAS), total 0–76. The published activity bands are remission ≤ 2.8, low ≤ 10, moderate ≤ 22, and high > 22. Unlike SDAI it adds no acute-phase reactant, so it can be scored at the bedside. It reports the total, the components, and the band; the treatment decision stays with the rheumatologist.';

export function cdaiRa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const sjc = reqNum(o, 'sjc', 'swollen-joint count', { min: 0, max: 28 }, missing);
  const tjc = reqNum(o, 'tjc', 'tender-joint count', { min: 0, max: 28 }, missing);
  const pga = reqNum(o, 'pga', 'patient global', { min: 0, max: 10 }, missing);
  const ega = reqNum(o, 'ega', 'physician global', { min: 0, max: 10 }, missing);
  if (missing.length) return { valid: false, message: needMessage(missing, 4) };
  const t = r1(num('CDAI total', sjc + tjc + pga + ega, { min: 0, max: 76 }));
  let band; let activity; let abnormal;
  if (t <= 2.8) { band = 'Remission'; activity = 'remission (≤ 2.8).'; abnormal = false; }
  else if (t <= 10) { band = 'Low activity'; activity = 'low disease activity (> 2.8–10).'; abnormal = false; }
  else if (t <= 22) { band = 'Moderate activity'; activity = 'moderate disease activity (> 10–22).'; abnormal = true; }
  else { band = 'High activity'; activity = 'high disease activity (> 22).'; abnormal = true; }
  return {
    valid: true,
    score: t,
    bandLabel: band,
    abnormal,
    band: `CDAI ${t}/76 — ${activity}`,
    detail: `SJC28 ${sjc} + TJC28 ${tjc} + patient global ${r1(pga)} + physician global ${r1(ega)}.`,
    note: CDAI_NOTE,
  };
}

// --- 2.2 SDAI — Simplified Disease Activity Index ----------------------------
const SDAI_NOTE = 'Simplified Disease Activity Index (Smolen JS, Breedveld FC, Schiff MH, et al, Rheumatology (Oxford) 2003;42(2):244-257) — the CDAI plus C-reactive protein. It is the linear sum of the 28-joint swollen-joint count (0–28), the 28-joint tender-joint count (0–28), the patient global assessment (0–10 cm VAS), the physician global assessment (0–10 cm VAS), and CRP in mg/dL, total 0–86. The published activity bands are remission ≤ 3.3, low ≤ 11, moderate ≤ 26, and high > 26. CRP must be entered in mg/dL — a lab value reported in mg/L is 10× larger, so divide by 10 first. It reports the total, the components, and the band; the treatment decision stays with the rheumatologist.';

export function sdaiRa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const sjc = reqNum(o, 'sjc', 'swollen-joint count', { min: 0, max: 28 }, missing);
  const tjc = reqNum(o, 'tjc', 'tender-joint count', { min: 0, max: 28 }, missing);
  const pga = reqNum(o, 'pga', 'patient global', { min: 0, max: 10 }, missing);
  const ega = reqNum(o, 'ega', 'physician global', { min: 0, max: 10 }, missing);
  const crp = reqNum(o, 'crp', 'CRP (mg/dL)', { min: 0, max: 50 }, missing);
  if (missing.length) return { valid: false, message: needMessage(missing, 5) };
  const t = r1(num('SDAI total', sjc + tjc + pga + ega + crp, { min: 0, max: 86 }));
  let band; let activity; let abnormal;
  if (t <= 3.3) { band = 'Remission'; activity = 'remission (≤ 3.3).'; abnormal = false; }
  else if (t <= 11) { band = 'Low activity'; activity = 'low disease activity (> 3.3–11).'; abnormal = false; }
  else if (t <= 26) { band = 'Moderate activity'; activity = 'moderate disease activity (> 11–26).'; abnormal = true; }
  else { band = 'High activity'; activity = 'high disease activity (> 26).'; abnormal = true; }
  return {
    valid: true,
    score: t,
    bandLabel: band,
    abnormal,
    band: `SDAI ${t}/86 — ${activity}`,
    detail: `SJC28 ${sjc} + TJC28 ${tjc} + patient global ${r1(pga)} + physician global ${r1(ega)} + CRP ${r1(crp)} mg/dL.`,
    note: SDAI_NOTE,
  };
}

// --- 2.3 2010 ACR/EULAR RA Classification ------------------------------------
const ACR2010_NOTE = '2010 ACR/EULAR Rheumatoid Arthritis Classification Criteria (Aletaha D, Neogi T, Silman AJ, et al, Arthritis Rheum 2010;62(9):2569-2581) — applied only to patients with at least one joint of definite clinical synovitis not better explained by another disease. Four domains contribute the single highest applicable level each: joint involvement (1 large joint 0, 2–10 large 1, 1–3 small 2, 4–10 small 3, >10 joints with ≥1 small 5), serology (negative RF and ACPA 0, low-positive 2, high-positive 3), acute-phase reactants (normal CRP and ESR 0, abnormal either 1), and symptom duration (<6 weeks 0, ≥6 weeks 1), total 0–10. A score of ≥ 6/10 classifies as definite RA. It reports the total, the domain scores, and the threshold; it is a classification rule, not a diagnosis or a treatment order.';
const ACR_JOINTS = { large1: { pts: 0, label: '1 large joint' }, large2to10: { pts: 1, label: '2–10 large joints' }, small1to3: { pts: 2, label: '1–3 small joints' }, small4to10: { pts: 3, label: '4–10 small joints' }, over10: { pts: 5, label: '>10 joints (≥1 small)' } };
const ACR_SEROLOGY = { negative: { pts: 0, label: 'RF and ACPA negative' }, low: { pts: 2, label: 'low-positive RF or ACPA' }, high: { pts: 3, label: 'high-positive RF or ACPA' } };
const ACR_ACUTE = { normal: { pts: 0, label: 'normal CRP and ESR' }, abnormal: { pts: 1, label: 'abnormal CRP or ESR' } };
const ACR_DURATION = { under6: { pts: 0, label: 'symptoms <6 weeks' }, over6: { pts: 1, label: 'symptoms ≥6 weeks' } };
const ACR2010 = [
  { key: 'joints', label: 'joint involvement', map: ACR_JOINTS },
  { key: 'serology', label: 'serology', map: ACR_SEROLOGY },
  { key: 'acutePhase', label: 'acute-phase reactants', map: ACR_ACUTE },
  { key: 'duration', label: 'symptom duration', map: ACR_DURATION },
];

export function acrEular2010Ra(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!onFlag(o.entry)) {
    return {
      valid: true,
      applicable: false,
      abnormal: false,
      bandLabel: 'Criteria not applicable',
      band: 'Entry condition not met — the 2010 criteria apply only to a patient with ≥1 joint of definite clinical synovitis not better explained by another disease.',
      detail: 'Confirm the entry condition before scoring.',
      note: ACR2010_NOTE,
    };
  }
  const { total, parts, missing } = sumComponents(o, ACR2010);
  if (missing.length) return { valid: false, message: needMessage(missing, 4) };
  const t = num('ACR/EULAR 2010 total', total, { min: 0, max: 10 });
  const isRa = t >= 6;
  return {
    valid: true,
    applicable: true,
    score: t,
    bandLabel: isRa ? 'Definite RA' : 'Not classified',
    abnormal: isRa,
    band: isRa
      ? `2010 ACR/EULAR ${t}/10 — ≥ 6: classify as definite rheumatoid arthritis.`
      : `2010 ACR/EULAR ${t}/10 — < 6: does not classify as definite RA (re-evaluate over time).`,
    detail: (parts.length ? parts.join('; ') : 'all domains scored 0') + '.',
    note: ACR2010_NOTE,
  };
}

// --- 2.4 SLEDAI-2K -----------------------------------------------------------
const SLEDAI_NOTE = 'SLEDAI-2K (Gladman DD, Ibañez D, Urowitz MB, J Rheumatol 2002;29(2):288-291) — the Systemic Lupus Erythematosus Disease Activity Index 2000, a weighted sum of 24 descriptors present in the prior 10 days, weighted 8 (CNS and vascular: seizure, psychosis, organic brain syndrome, visual disturbance, cranial-nerve disorder, lupus headache, CVA, vasculitis), 4 (renal and musculoskeletal: arthritis, myositis, urinary casts, hematuria, proteinuria, pyuria), 2 (mucocutaneous, serosal, immunologic: rash, alopecia, mucosal ulcers, pleurisy, pericarditis, low complement, increased anti-dsDNA binding), and 1 (constitutional/hematologic: fever, thrombocytopenia, leukopenia), total 0–105. SLEDAI-2K credits ongoing (not only new) rash, alopecia, mucosal ulcers, and proteinuria. A score ≥ 6 denotes clinically important active disease and a fall of ≥ 4 a meaningful improvement; the 0 / 1–5 / 6–10 / 11–19 / ≥20 severity grouping is a widely used convention rather than part of the 2002 paper. It reports the total, the descriptors counted, and that framing.';
const SLEDAI_DESCRIPTORS = [
  { key: 'seizure', label: 'seizure', w: 8 },
  { key: 'psychosis', label: 'psychosis', w: 8 },
  { key: 'organicBrain', label: 'organic brain syndrome', w: 8 },
  { key: 'visual', label: 'visual disturbance', w: 8 },
  { key: 'cranialNerve', label: 'cranial-nerve disorder', w: 8 },
  { key: 'lupusHeadache', label: 'lupus headache', w: 8 },
  { key: 'cva', label: 'CVA', w: 8 },
  { key: 'vasculitis', label: 'vasculitis', w: 8 },
  { key: 'arthritis', label: 'arthritis', w: 4 },
  { key: 'myositis', label: 'myositis', w: 4 },
  { key: 'urinaryCasts', label: 'urinary casts', w: 4 },
  { key: 'hematuria', label: 'hematuria', w: 4 },
  { key: 'proteinuria', label: 'proteinuria', w: 4 },
  { key: 'pyuria', label: 'pyuria', w: 4 },
  { key: 'rash', label: 'rash', w: 2 },
  { key: 'alopecia', label: 'alopecia', w: 2 },
  { key: 'mucosalUlcers', label: 'mucosal ulcers', w: 2 },
  { key: 'pleurisy', label: 'pleurisy', w: 2 },
  { key: 'pericarditis', label: 'pericarditis', w: 2 },
  { key: 'lowComplement', label: 'low complement', w: 2 },
  { key: 'dnaBinding', label: 'increased DNA binding', w: 2 },
  { key: 'fever', label: 'fever', w: 1 },
  { key: 'thrombocytopenia', label: 'thrombocytopenia', w: 1 },
  { key: 'leukopenia', label: 'leukopenia', w: 1 },
];

export function sledai2k(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const present = [];
  for (const d of SLEDAI_DESCRIPTORS) {
    if (onFlag(o[d.key])) { total += d.w; present.push(`${d.label} (${d.w})`); }
  }
  const t = num('SLEDAI-2K total', total, { min: 0, max: 105 });
  let band; let abnormal;
  if (t === 0) { band = 'No activity'; abnormal = false; }
  else if (t <= 5) { band = 'Mild activity'; abnormal = false; }
  else if (t <= 10) { band = 'Moderate activity'; abnormal = true; }
  else if (t <= 19) { band = 'High activity'; abnormal = true; }
  else { band = 'Very high activity'; abnormal = true; }
  const active = t >= 6 ? ' — ≥ 6 denotes clinically important active disease.' : '';
  return {
    valid: true,
    score: t,
    bandLabel: band,
    abnormal,
    band: `SLEDAI-2K ${t}/105 — ${band.toLowerCase()} (${t === 0 ? '0' : t <= 5 ? '1–5' : t <= 10 ? '6–10' : t <= 19 ? '11–19' : '≥20'})${active}`,
    detail: present.length ? present.join('; ') + '.' : 'no active descriptors selected.',
    note: SLEDAI_NOTE,
  };
}

// --- 2.5 2015 ACR/EULAR Gout Classification ----------------------------------
const GOUT_NOTE = '2015 ACR/EULAR Gout Classification Criteria (Neogi T, Jansen TLTA, Dalbeth N, et al, Arthritis Rheumatol 2015;67(10):2557-2568) — applied after the entry criterion of at least one episode of swelling, pain, or tenderness in a peripheral joint or bursa. Demonstrating monosodium-urate crystals in a symptomatic joint/bursa or tophus is the sufficient criterion and classifies as gout directly. Otherwise the weighted domains sum: joint pattern (other 0, ankle/midfoot 1, 1st MTP 2), episode characteristics (0–3 of erythema/intolerable touch/difficulty walking), time-course (none 0, one typical 1, recurrent 2), clinical tophus (4), serum urate (<4 mg/dL −4, 4–<6 0, 6–<8 2, 8–<10 3, ≥10 4), synovial fluid (not done 0, MSU-negative −2), imaging urate deposition (US double-contour or DECT, 4), and imaging gout-related erosion (4); a total ≥ 8 of a maximum 23 classifies as gout. "Not done" scores 0, distinct from the two negative findings. It reports the classification, the contributing domains, and the threshold.';
const GOUT_PATTERN = { other: { pts: 0, label: 'other joint / polyarticular' }, anklemid: { pts: 1, label: 'ankle or midfoot (no 1st MTP)' }, mtp1: { pts: 2, label: '1st MTP involved' } };
const GOUT_CHAR = { c0: { pts: 0, label: 'no characteristics' }, c1: { pts: 1, label: 'one characteristic' }, c2: { pts: 2, label: 'two characteristics' }, c3: { pts: 3, label: 'three characteristics' } };
const GOUT_TIME = { none: { pts: 0, label: 'no typical episode' }, one: { pts: 1, label: 'one typical episode' }, recurrent: { pts: 2, label: 'recurrent typical episodes' } };
const GOUT_URATE = { lt4: { pts: -4, label: 'serum urate <4 mg/dL' }, u4to6: { pts: 0, label: 'serum urate 4–<6 mg/dL' }, u6to8: { pts: 2, label: 'serum urate 6–<8 mg/dL' }, u8to10: { pts: 3, label: 'serum urate 8–<10 mg/dL' }, ge10: { pts: 4, label: 'serum urate ≥10 mg/dL' } };
const GOUT_SYNOVIAL = { notdone: { pts: 0, label: 'synovial fluid not assessed' }, negative: { pts: -2, label: 'synovial fluid MSU-negative' } };
const GOUT_SELECTS = [
  { key: 'pattern', label: 'joint pattern', map: GOUT_PATTERN },
  { key: 'characteristics', label: 'episode characteristics', map: GOUT_CHAR },
  { key: 'timeCourse', label: 'time-course', map: GOUT_TIME },
  { key: 'serumUrate', label: 'serum urate', map: GOUT_URATE },
  { key: 'synovial', label: 'synovial fluid', map: GOUT_SYNOVIAL },
];

export function goutAcrEular2015(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!onFlag(o.entry)) {
    return {
      valid: true,
      applicable: false,
      abnormal: false,
      bandLabel: 'Criteria not applicable',
      band: 'Entry criterion not met — the 2015 criteria apply only after ≥1 episode of swelling, pain, or tenderness in a peripheral joint or bursa.',
      detail: 'Confirm the entry criterion before scoring.',
      note: GOUT_NOTE,
    };
  }
  if (onFlag(o.msuCrystals)) {
    return {
      valid: true,
      applicable: true,
      sufficient: true,
      score: null,
      bandLabel: 'Gout (sufficient criterion)',
      abnormal: true,
      band: 'Classified as gout by the sufficient criterion — monosodium-urate crystals in a symptomatic joint/bursa or tophus (no scoring needed).',
      detail: 'MSU crystals demonstrated.',
      note: GOUT_NOTE,
    };
  }
  const { total, parts, missing } = sumComponents(o, GOUT_SELECTS);
  if (missing.length) return { valid: false, message: needMessage(missing, 5) };
  let t = total;
  if (onFlag(o.tophus)) { t += 4; parts.push('clinical tophus (+4)'); }
  if (onFlag(o.imagingUrate)) { t += 4; parts.push('imaging urate deposition (+4)'); }
  if (onFlag(o.imagingDamage)) { t += 4; parts.push('imaging gout-related erosion (+4)'); }
  t = num('2015 gout total', t, { min: -6, max: 23 });
  const isGout = t >= 8;
  return {
    valid: true,
    applicable: true,
    sufficient: false,
    score: t,
    bandLabel: isGout ? 'Gout' : 'Not classified',
    abnormal: isGout,
    band: isGout
      ? `2015 ACR/EULAR ${t}/23 — ≥ 8: classify as gout.`
      : `2015 ACR/EULAR ${t}/23 — < 8: does not classify as gout.`,
    detail: (parts.length ? parts.join('; ') : 'all scored domains contributed 0') + '.',
    note: GOUT_NOTE,
  };
}

// --- 2.6 CASPAR — Psoriatic Arthritis Classification -------------------------
const CASPAR_NOTE = 'CASPAR Criteria for Psoriatic Arthritis (Taylor W, Gladman D, Helliwell P, et al, Arthritis Rheum 2006;54(8):2665-2670) — applied to a patient with established inflammatory articular disease (joint, spine, or entheseal). The weighted items are psoriasis (current 2, or personal history 1, or family history 1 — the single highest applies), psoriatic nail dystrophy 1, a negative rheumatoid factor 1, dactylitis (current or rheumatologist-recorded history) 1, and radiographic juxta-articular new bone formation 1, for a maximum of 6. The entry condition plus ≥ 3 points classifies as psoriatic arthritis (sensitivity 0.91, specificity 0.99). Current psoriasis is the only 2-point item. It reports the classification, the items counted, and the threshold.';
const CASPAR_PSORIASIS = { current: { pts: 2, label: 'current psoriasis' }, personal: { pts: 1, label: 'personal history of psoriasis' }, family: { pts: 1, label: 'family history of psoriasis' }, none: { pts: 0, label: 'no psoriasis' } };

export function caspar(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!onFlag(o.entry)) {
    return {
      valid: true,
      applicable: false,
      abnormal: false,
      bandLabel: 'Criteria not applicable',
      band: 'Entry condition not met — CASPAR applies only to a patient with established inflammatory articular disease (joint, spine, or entheseal).',
      detail: 'Confirm the entry condition before scoring.',
      note: CASPAR_NOTE,
    };
  }
  const psor = CASPAR_PSORIASIS[o.psoriasis];
  if (!psor) return { valid: false, message: 'Choose the psoriasis status (current / personal history / family history / none).' };
  let total = psor.pts;
  const parts = [];
  if (psor.pts !== 0) parts.push(`${psor.label} (+${psor.pts})`);
  const items = [
    { key: 'nail', label: 'psoriatic nail dystrophy' },
    { key: 'rfNegative', label: 'negative rheumatoid factor' },
    { key: 'dactylitis', label: 'dactylitis (current or recorded history)' },
    { key: 'juxtaBone', label: 'juxta-articular new bone formation' },
  ];
  for (const it of items) {
    if (onFlag(o[it.key])) { total += 1; parts.push(`${it.label} (+1)`); }
  }
  const t = num('CASPAR total', total, { min: 0, max: 6 });
  const isPsa = t >= 3;
  return {
    valid: true,
    applicable: true,
    score: t,
    bandLabel: isPsa ? 'Psoriatic arthritis (CASPAR-positive)' : 'Not classified',
    abnormal: isPsa,
    band: isPsa
      ? `CASPAR ${t}/6 — inflammatory articular disease and ≥ 3 points: classify as psoriatic arthritis.`
      : `CASPAR ${t}/6 — < 3 points: does not meet CASPAR (inflammatory articular disease present but under threshold).`,
    detail: (parts.length ? parts.join('; ') : 'no weighted items scored') + '.',
    note: CASPAR_NOTE,
  };
}

// --- 2.7 2016 Revised ACR Fibromyalgia Criteria ------------------------------
const FIBRO_NOTE = '2016 Revised ACR Fibromyalgia Criteria (Wolfe F, Clauw DJ, Fitzcharles MA, et al, Semin Arthritis Rheum 2016;46(3):319-329) — a diagnosis from the Widespread Pain Index (WPI, the count of 0–19 painful body regions) and the Symptom Severity Scale (SSS, 0–12 = fatigue 0–3 + waking unrefreshed 0–3 + cognitive symptoms 0–3 + a somatic-symptom count 0–3 of headaches, lower-abdominal pain, and depression over 6 months). The criteria are met when (WPI ≥ 7 and SSS ≥ 5) OR (WPI 4–6 and SSS ≥ 9), AND generalized pain is present (≥ 4 of 5 body regions), AND symptoms have been present at a similar level for ≥ 3 months. The 2016 revision states the diagnosis is valid irrespective of other diagnoses and does not exclude other illnesses. It reports the met/not-met determination with the WPI and SSS values.';
const SSS_LEVEL = { s0: 0, s1: 1, s2: 2, s3: 3 };

export function fibromyalgiaAcr2016(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const wpi = reqNum(o, 'wpi', 'Widespread Pain Index', { min: 0, max: 19 }, missing);
  const genRegions = reqNum(o, 'genRegions', 'generalized-pain regions', { min: 0, max: 5 }, missing);
  const fatigue = SSS_LEVEL[o.fatigue];
  const waking = SSS_LEVEL[o.waking];
  const cognitive = SSS_LEVEL[o.cognitive];
  if (fatigue === undefined) missing.push('fatigue severity');
  if (waking === undefined) missing.push('waking-unrefreshed severity');
  if (cognitive === undefined) missing.push('cognitive-symptom severity');
  if (missing.length) return { valid: false, message: needMessage(missing, 5) };
  const somatic = (onFlag(o.somHeadache) ? 1 : 0) + (onFlag(o.somAbdominal) ? 1 : 0) + (onFlag(o.somDepression) ? 1 : 0);
  const sss = num('SSS', fatigue + waking + cognitive + somatic, { min: 0, max: 12 });
  const w = num('WPI', wpi, { min: 0, max: 19 });
  const painBranch = (w >= 7 && sss >= 5) || (w >= 4 && w <= 6 && sss >= 9);
  const generalized = genRegions >= 4;
  const chronic = onFlag(o.duration);
  const met = painBranch && generalized && chronic;
  const reasons = [];
  if (!painBranch) reasons.push('the WPI/SSS thresholds are not met');
  if (!generalized) reasons.push('generalized pain (≥ 4 of 5 regions) is absent');
  if (!chronic) reasons.push('symptoms have not been present ≥ 3 months');
  return {
    valid: true,
    score: w,
    sss,
    bandLabel: met ? 'Criteria met' : 'Criteria not met',
    abnormal: met,
    band: met
      ? `2016 ACR fibromyalgia criteria MET — WPI ${w}/19, SSS ${sss}/12.`
      : `2016 ACR fibromyalgia criteria NOT met (WPI ${w}/19, SSS ${sss}/12) — ${reasons.join('; ')}.`,
    detail: `WPI ${w}; SSS ${sss} (fatigue ${fatigue} + waking ${waking} + cognitive ${cognitive} + somatic ${somatic}); generalized-pain regions ${genRegions}/5; duration ≥3 months ${chronic ? 'yes' : 'no'}.`,
    note: FIBRO_NOTE,
  };
}
