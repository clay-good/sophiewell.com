// spec-v148 (Wave 8 of the spec-v100 MDCalc Parity Completion program, the
// CLOSING spec): seven deterministic rheumatology, palliative, and pharmacy
// instruments that fill confirmed gaps. None duplicates a live tile; v148 parses
// no image, runs no AI, and makes no runtime network call.
//
//   asdas                     - Ankylosing Spondylitis Disease Activity Score
//                               (ASDAS-CRP preferred, ASDAS-ESR alternative)
//   ffs2011                   - Five-Factor Score, 2011 revision (vasculitis)
//   gcaAcrEular2022           - 2022 ACR/EULAR giant-cell-arteritis classification
//   palliativePrognosticIndex - PPI survival band
//   palliativePrognosticScore - PaP 30-day-survival risk group (A/B/C)
//   opioidConversion          - equianalgesic / rotation converter
//   naranjo                   - ADR probability scale (-4 to +13)
//
// The eighth proposed tile, valproate-correction, is DEFERRED — see the note at
// the foot of this file and docs/spec-v148.md §7.1.
//
// Per the spec-v100 §2 classification clarification each tile CONSUMES the
// clinician's bounded inputs (the joint/symptom exam, labs, performance status,
// the source opioid regimen, the ADR-causality answers) and COMPUTES a score /
// classification / converted dose + the source's interpretation -- none is a
// no-input reference table. Pure functions only (spec-v29 §3 one-line test).
// Citations live inline in lib/meta.js; renderers in views/group-v148.js render
// the spec-v50 §3 clinical-posture note. The treat / escalate / prescribe
// decision stays with the clinician and local protocol (spec-v11 §5.3); the
// high-stakes opioid conversion additionally surfaces the second-check caveat.
//
// DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent authoritative sources (the original papers, the ASAS
// calculator, RheumNow/RheumCalc, the CDC MME factor file, the University of Iowa
// equianalgesic chart, the Palliative Care Network of Wisconsin, MDApp, and the
// NCBI LiverTox Naranjo worksheet). SOURCE-GOVERNANCE:
//   - asdas (Lukas 2009, Ann Rheum Dis 68(1):18): ASDAS-CRP = 0.12*backPain +
//     0.06*morningStiffness + 0.11*patientGlobal + 0.07*peripheralPain +
//     0.58*ln(CRP+1); ASDAS-ESR = 0.08*backPain + 0.07*morningStiffness +
//     0.11*patientGlobal + 0.09*peripheralPain + 0.29*sqrt(ESR). The CRP and ESR
//     variants DO NOT share the back-pain/morning-stiffness/peripheral weights.
//     CRP in mg/L; a CRP < 2 mg/L is floored to 2 (Machado operational rule). The
//     four NRS items are 0-10. Cutoffs: inactive < 1.3, low 1.3-<2.1, high
//     2.1-3.5, very high > 3.5. Class A.
//   - ffs2011 (Guillevin 2011, Medicine (Baltimore) 90(1):19): four poor-prognosis
//     factors each +1 -- age > 65, cardiac insufficiency, GI involvement, renal
//     insufficiency (stabilized peak creatinine >= 150 umol/L ~ 1.7 mg/dL) -- plus
//     the favorable factor absence-of-ENT-manifestations +1 (applies to GPA/EGPA).
//     Total 0-5. 5-year mortality: 0 ~ 9%, 1 ~ 21%, >= 2 ~ 40%. Class A.
//   - gcaAcrEular2022 (Ponte 2022, Ann Rheum Dis 81(12):1647): absolute entry
//     age >= 50 at diagnosis. Weighted items: positive temporal-artery biopsy OR
//     halo sign on US +5; max ESR >= 50 or CRP >= 10 mg/L +3; sudden visual loss
//     +3; then +2 each for morning stiffness (shoulders/neck), jaw/tongue
//     claudication, new temporal headache, scalp tenderness, abnormal temporal
//     artery on exam, bilateral axillary involvement on imaging, FDG-PET activity
//     throughout the aorta. Max 25; >= 6 = classify as GCA (sens 87.0%, spec
//     94.8%). Class B (ACR/EULAR society criteria).
//   - palliativePrognosticIndex (Morita 1999, Support Care Cancer 7(3):128): PPS
//     band (>=60 -> 0, 30-50 -> 2.5, 10-20 -> 4) + oral intake (normal 0,
//     moderately reduced 1, mouthfuls-or-less 2.5) + edema 1 + dyspnea at rest 3.5
//     + delirium 4 (single-medication-induced delirium excluded). Max 15. PPI > 6
//     -> survival < 3 weeks; > 4 -> < 6 weeks; <= 4 -> > 6 weeks. Class A.
//   - palliativePrognosticScore (Pirovano/Maltoni 1999, J Pain Symptom Manage
//     17(4):231/240): dyspnea 0/1 + anorexia 0/1.5 + Karnofsky (>=30 0, 10-20 2.5)
//     + clinical prediction of survival in weeks (>12 0, 11-12 2.0, 7-10 2.5, 5-6
//     4.5, 3-4 6.0, 1-2 8.5) + total WBC (normal <=8500 0, high 8501-11000 0.5,
//     very high >11000 1.5) + lymphocyte % (20-40 0, 12-19.9 1.0, 0-11.9 2.5).
//     Total 0-17.5. 30-day-survival groups A 0-5.5 (>70%), B 5.6-11.0 (30-70%),
//     C 11.1-17.5 (<30%). The original table splits the 7-10-week band into 9-10
//     and 7-8, both 2.5; they are merged here (identical weight). Class A.
//   - opioidConversion (standard equianalgesic table; McPherson, Demystifying
//     Opioid Conversion Calculations, 2nd ed, ASHP 2018; CDC MME factors; Iowa
//     equianalgesic chart): convert source daily dose -> oral morphine
//     equivalents (OME) -> target equianalgesic dose, then apply an incomplete-
//     cross-tolerance reduction (25-50%). OME factors anchored to oral morphine 1:
//     oxycodone 1.5, hydromorphone PO 4 (CDC; the equianalgesic table's 5 is the
//     parenteral ratio), hydrocodone 1, codeine 0.15, tramadol 0.1, tapentadol
//     0.4, oxymorphone PO 3; parenteral morphine 3 (oral:IV 3:1 chronic),
//     hydromorphone IV 20, oxymorphone IV 30, fentanyl IV 0.3 OME/mcg; transdermal
//     fentanyl 2.4 OME per mcg/h (25 mcg/h ~ 60 mg OME/day). Methadone and
//     buprenorphine are EXCLUDED (non-linear / ceiling pharmacology, spec-v100
//     §8). Class A (fixed constants), but the renderer carries the mandatory
//     independent-second-check caveat (spec-v11 §5.3).
//   - naranjo (Naranjo 1981, Clin Pharmacol Ther 30(2):239): ten weighted yes/no/
//     don't-know questions, total -4 to +13. Q2/Q4 No = -1, Q5/Q6 Yes = -1; all
//     other negatives confirmed verbatim against the LiverTox worksheet. Bands:
//     <= 0 doubtful, 1-4 possible, 5-8 probable, >= 9 definite. Class A.

import { num, r1, r2 } from './num.js';

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

// --- shared helpers ----------------------------------------------------------
function needMessage(missing, count) {
  return `Choose all ${count} inputs — ${missing.length} still needed: ${missing.join(', ')}.`;
}
function reqNum(o, key, label, opts, missing) {
  const v = o[key];
  if (v === null || v === undefined || v === '' || typeof v !== 'number' || !Number.isFinite(v)) {
    missing.push(label);
    return null;
  }
  return num(label, v, opts);
}
// Sum a list of { key, label, map } selects (option -> { pts, label }); a blank
// selection is collected into `missing` rather than scored as zero.
function sumSelects(o, components) {
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

// --- 2.1 ASDAS ---------------------------------------------------------------
const ASDAS_NOTE = 'Ankylosing Spondylitis Disease Activity Score (Lukas C, Landewé R, Sieper J, et al, Ann Rheum Dis 2009;68(1):18-24) — an ASAS-endorsed composite of four 0–10 patient items (spinal/back pain, duration of morning stiffness, patient global, peripheral pain/swelling) and an acute-phase reactant. ASDAS-CRP = 0.12·back pain + 0.06·morning stiffness + 0.11·patient global + 0.07·peripheral pain + 0.58·ln(CRP+1), with CRP in mg/L floored to 2; ASDAS-ESR uses different item weights (0.08/0.07/0.11/0.09) + 0.29·√ESR. ASDAS-CRP is preferred. Cutoffs: inactive disease < 1.3, low 1.3–<2.1, high 2.1–3.5, very high > 3.5; a change ≥ 1.1 is clinically important and ≥ 2.0 a major improvement. It reports the value, the variant, and the activity band.';

function asdasValue(bp, ms, pg, pp, kind, apr) {
  if (kind === 'crp') {
    const c = apr < 2 ? 2 : apr;
    return 0.12 * bp + 0.06 * ms + 0.11 * pg + 0.07 * pp + 0.58 * Math.log(c + 1);
  }
  return 0.08 * bp + 0.07 * ms + 0.11 * pg + 0.09 * pp + 0.29 * Math.sqrt(apr);
}
function asdasBand(v) {
  if (v < 1.3) return { band: 'Inactive disease', activity: 'inactive disease (< 1.3)', abnormal: false };
  if (v < 2.1) return { band: 'Low disease activity', activity: 'low disease activity (1.3–<2.1)', abnormal: false };
  if (v <= 3.5) return { band: 'High disease activity', activity: 'high disease activity (2.1–3.5)', abnormal: true };
  return { band: 'Very high disease activity', activity: 'very high disease activity (> 3.5)', abnormal: true };
}

export function asdas(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const bp = reqNum(o, 'backPain', 'back pain (0–10)', { min: 0, max: 10 }, missing);
  const ms = reqNum(o, 'morningStiffness', 'morning stiffness (0–10)', { min: 0, max: 10 }, missing);
  const pg = reqNum(o, 'patientGlobal', 'patient global (0–10)', { min: 0, max: 10 }, missing);
  const pp = reqNum(o, 'peripheralPain', 'peripheral pain/swelling (0–10)', { min: 0, max: 10 }, missing);
  if (missing.length) return { valid: false, message: needMessage(missing, 5) + ' Plus CRP (mg/L) or ESR (mm/h).' };
  const hasCrp = o.crp !== null && o.crp !== undefined && o.crp !== '' && typeof o.crp === 'number' && Number.isFinite(o.crp);
  const hasEsr = o.esr !== null && o.esr !== undefined && o.esr !== '' && typeof o.esr === 'number' && Number.isFinite(o.esr);
  if (!hasCrp && !hasEsr) {
    return { valid: false, message: 'Enter CRP (mg/L, preferred) or ESR (mm/h) to complete the ASDAS.' };
  }
  let primaryKind; let primaryVal; let crpVal = null; let esrVal = null;
  if (hasCrp) {
    crpVal = r2(asdasValue(bp, ms, pg, pp, 'crp', num('CRP', o.crp, { min: 0, max: 500 })));
    primaryKind = 'CRP'; primaryVal = crpVal;
  }
  if (hasEsr) {
    esrVal = r2(asdasValue(bp, ms, pg, pp, 'esr', num('ESR', o.esr, { min: 0, max: 200 })));
    if (!hasCrp) { primaryKind = 'ESR'; primaryVal = esrVal; }
  }
  const b = asdasBand(primaryVal);
  const both = crpVal != null && esrVal != null ? ` (ASDAS-ESR ${esrVal})` : '';
  return {
    valid: true,
    score: primaryVal,
    variant: primaryKind,
    crp: crpVal,
    esr: esrVal,
    bandLabel: b.band,
    abnormal: b.abnormal,
    band: `ASDAS-${primaryKind} ${primaryVal} — ${b.activity}.${both}`,
    detail: `back pain ${r1(bp)}, morning stiffness ${r1(ms)}, patient global ${r1(pg)}, peripheral pain ${r1(pp)}${hasCrp ? `, CRP ${r1(o.crp)} mg/L${o.crp < 2 ? ' (floored to 2)' : ''}` : ''}${hasEsr ? `, ESR ${r1(o.esr)} mm/h` : ''}.`,
    note: ASDAS_NOTE,
  };
}

// --- 2.2 FFS-2011 ------------------------------------------------------------
const FFS_NOTE = 'Five-Factor Score, 2011 revision (Guillevin L, Pagnoux C, Seror R, et al, Medicine (Baltimore) 2011;90(1):19-27) — a prognostic score for the systemic necrotizing vasculitides (polyarteritis nodosa, microscopic polyangiitis, GPA, EGPA) from the French Vasculitis Study Group cohort. Four poor-prognosis factors each score +1: age > 65 years, cardiac insufficiency, gastrointestinal involvement, and renal insufficiency (stabilized peak creatinine ≥ 150 µmol/L ≈ 1.7 mg/dL). The 2011 revision adds a favorable factor — the ABSENCE of ENT manifestations scores +1 (relevant to GPA and EGPA, where ENT involvement signals a better prognosis). The published 5-year mortality is about 9% at FFS 0, 21% at FFS 1, and 40% at FFS ≥ 2. It reports the total and the mortality band.';
const FFS_FACTORS = [
  { key: 'age', label: 'age > 65 years' },
  { key: 'cardiac', label: 'cardiac insufficiency' },
  { key: 'gi', label: 'gastrointestinal involvement' },
  { key: 'renal', label: 'renal insufficiency (creatinine ≥ 150 µmol/L)' },
  { key: 'noEnt', label: 'absence of ENT manifestations' },
];

export function ffs2011(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const present = [];
  for (const f of FFS_FACTORS) {
    if (onFlag(o[f.key])) { total += 1; present.push(f.label); }
  }
  const t = num('FFS-2011 total', total, { min: 0, max: 5 });
  let mort; let abnormal;
  if (t === 0) { mort = 'about 9% 5-year mortality'; abnormal = false; }
  else if (t === 1) { mort = 'about 21% 5-year mortality'; abnormal = true; }
  else { mort = 'about 40% 5-year mortality'; abnormal = true; }
  return {
    valid: true,
    score: t,
    bandLabel: `FFS ${t}`,
    abnormal,
    band: `FFS-2011 ${t}/5 — ${mort}.`,
    detail: present.length ? present.join('; ') + '.' : 'no prognostic factors present.',
    note: FFS_NOTE,
  };
}

// --- 2.3 2022 ACR/EULAR GCA Classification -----------------------------------
const GCA_NOTE = '2022 ACR/EULAR Giant Cell Arteritis Classification Criteria (Ponte C, Grayson PC, Robson JC, et al, Ann Rheum Dis 2022;81(12):1647-1653) — applied only once a diagnosis of medium- or large-vessel vasculitis has been made and mimics excluded, with the absolute requirement of age ≥ 50 at diagnosis. The weighted items are: positive temporal-artery biopsy or halo sign on temporal-artery ultrasound (+5); maximum ESR ≥ 50 mm/h or CRP ≥ 10 mg/L (+3); sudden visual loss (+3); and +2 each for morning stiffness of the shoulders/neck, jaw or tongue claudication, new temporal headache, scalp tenderness, abnormal temporal artery on examination, bilateral axillary involvement on imaging, and FDG-PET activity throughout the aorta — maximum 25. A cumulative score ≥ 6 classifies as GCA (sensitivity 87.0%, specificity 94.8%). It is a classification rule, not a diagnosis or a treatment order.';
const GCA_ITEMS = [
  { key: 'biopsyHalo', label: 'positive temporal-artery biopsy or halo on ultrasound', pts: 5 },
  { key: 'aprHigh', label: 'max ESR ≥ 50 or CRP ≥ 10 mg/L', pts: 3 },
  { key: 'visualLoss', label: 'sudden visual loss', pts: 3 },
  { key: 'morningStiffness', label: 'morning stiffness (shoulders/neck)', pts: 2 },
  { key: 'jawClaudication', label: 'jaw or tongue claudication', pts: 2 },
  { key: 'temporalHeadache', label: 'new temporal headache', pts: 2 },
  { key: 'scalpTenderness', label: 'scalp tenderness', pts: 2 },
  { key: 'taAbnormal', label: 'abnormal temporal artery on exam', pts: 2 },
  { key: 'bilateralAxillary', label: 'bilateral axillary involvement on imaging', pts: 2 },
  { key: 'petAorta', label: 'FDG-PET activity throughout the aorta', pts: 2 },
];

export function gcaAcrEular2022(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!onFlag(o.entry)) {
    return {
      valid: true,
      applicable: false,
      abnormal: false,
      bandLabel: 'Criteria not applicable',
      band: 'Entry requirement not met — the 2022 criteria apply only when age is ≥ 50 at diagnosis (after a diagnosis of medium/large-vessel vasculitis with mimics excluded).',
      detail: 'Confirm the age ≥ 50 entry requirement before scoring.',
      note: GCA_NOTE,
    };
  }
  let total = 0;
  const parts = [];
  for (const it of GCA_ITEMS) {
    if (onFlag(o[it.key])) { total += it.pts; parts.push(`${it.label} (+${it.pts})`); }
  }
  const t = num('2022 GCA total', total, { min: 0, max: 25 });
  const isGca = t >= 6;
  return {
    valid: true,
    applicable: true,
    score: t,
    bandLabel: isGca ? 'Classified as GCA' : 'Not classified',
    abnormal: isGca,
    band: isGca
      ? `2022 ACR/EULAR ${t}/25 — ≥ 6: classify as giant cell arteritis.`
      : `2022 ACR/EULAR ${t}/25 — < 6: does not meet the classification threshold.`,
    detail: (parts.length ? parts.join('; ') : 'no weighted items present') + '.',
    note: GCA_NOTE,
  };
}

// --- 2.4 PPI — Palliative Prognostic Index -----------------------------------
const PPI_NOTE = 'Palliative Prognostic Index (Morita T, Tsunoda J, Inoue S, Chihara S, Support Care Cancer 1999;7(3):128-133) — a survival estimate for terminally ill cancer patients. It sums the Palliative Performance Scale band (≥ 60 → 0, 30–50 → 2.5, 10–20 → 4), oral intake (normal 0, moderately reduced 1, mouthfuls or less 2.5), edema (1), dyspnea at rest (3.5), and delirium (4, excluding delirium caused by a single medication), maximum 15. A PPI > 6 predicts survival under 3 weeks (sensitivity 80%, specificity 85%); a PPI > 4 predicts survival under 6 weeks; PPI ≤ 4 suggests survival beyond 6 weeks. It reports the total and the survival band; the clinical conversation stays with the team.';
const PPS_MAP = { high: { pts: 0, label: 'PPS ≥ 60' }, mid: { pts: 2.5, label: 'PPS 30–50' }, low: { pts: 4, label: 'PPS 10–20' } };
const INTAKE_MAP = { normal: { pts: 0, label: 'normal intake' }, reduced: { pts: 1, label: 'moderately reduced intake' }, mouthfuls: { pts: 2.5, label: 'mouthfuls or less' } };
const PPI_SELECTS = [
  { key: 'pps', label: 'Palliative Performance Scale', map: PPS_MAP },
  { key: 'intake', label: 'oral intake', map: INTAKE_MAP },
];

export function palliativePrognosticIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const { total, parts, missing } = sumSelects(o, PPI_SELECTS);
  if (missing.length) return { valid: false, message: needMessage(missing, 2) + ' (plus the edema/dyspnea/delirium checkboxes).' };
  let t = total;
  if (onFlag(o.edema)) { t += 1; parts.push('edema (+1)'); }
  if (onFlag(o.dyspnea)) { t += 3.5; parts.push('dyspnea at rest (+3.5)'); }
  if (onFlag(o.delirium)) { t += 4; parts.push('delirium (+4)'); }
  t = r1(num('PPI total', t, { min: 0, max: 15 }));
  let outlook; let abnormal;
  if (t > 6) { outlook = 'predicts survival under 3 weeks'; abnormal = true; }
  else if (t > 4) { outlook = 'predicts survival under 6 weeks'; abnormal = true; }
  else { outlook = 'suggests survival beyond 6 weeks'; abnormal = false; }
  return {
    valid: true,
    score: t,
    bandLabel: t > 6 ? '< 3 weeks' : t > 4 ? '< 6 weeks' : '> 6 weeks',
    abnormal,
    band: `PPI ${t}/15 — ${outlook}.`,
    detail: (parts.length ? parts.join('; ') : 'all components scored 0') + '.',
    note: PPI_NOTE,
  };
}

// --- 2.5 PaP — Palliative Prognostic Score -----------------------------------
const PAP_NOTE = 'Palliative Prognostic Score (Pirovano M, Maltoni M, Nanni O, et al, J Pain Symptom Manage 1999;17(4):231-239; validated Maltoni 1999) — a 30-day-survival score for advanced cancer. It sums dyspnea (1), anorexia (1.5), Karnofsky Performance Status (≥ 30 → 0, 10–20 → 2.5), the clinician’s clinical prediction of survival in weeks (> 12 → 0, 11–12 → 2, 7–10 → 2.5, 5–6 → 4.5, 3–4 → 6, 1–2 → 8.5), total WBC (normal ≤ 8500 → 0, high 8501–11000 → 0.5, very high > 11000 → 1.5), and lymphocyte percentage (20–40% → 0, 12–19.9% → 1, 0–11.9% → 2.5), total 0–17.5. The risk groups are A (0–5.5, 30-day survival > 70%), B (5.6–11.0, 30–70%), and C (11.1–17.5, < 30%). It reports the total and the risk group; the clinical prediction of survival is itself a required clinician input.';
const KPS_MAP = { ge30: { pts: 0, label: 'KPS ≥ 30' }, lo: { pts: 2.5, label: 'KPS 10–20' } };
const CPS_MAP = {
  w12: { pts: 0, label: '> 12 weeks' }, w11: { pts: 2, label: '11–12 weeks' },
  w7: { pts: 2.5, label: '7–10 weeks' }, w5: { pts: 4.5, label: '5–6 weeks' },
  w3: { pts: 6, label: '3–4 weeks' }, w1: { pts: 8.5, label: '1–2 weeks' },
};
const WBC_MAP = { normal: { pts: 0, label: 'WBC ≤ 8500' }, high: { pts: 0.5, label: 'WBC 8501–11000' }, vhigh: { pts: 1.5, label: 'WBC > 11000' } };
const LYMPH_MAP = { normal: { pts: 0, label: 'lymphocytes 20–40%' }, low: { pts: 1, label: 'lymphocytes 12–19.9%' }, vlow: { pts: 2.5, label: 'lymphocytes 0–11.9%' } };
const PAP_SELECTS = [
  { key: 'kps', label: 'Karnofsky Performance Status', map: KPS_MAP },
  { key: 'cps', label: 'clinical prediction of survival', map: CPS_MAP },
  { key: 'wbc', label: 'total WBC', map: WBC_MAP },
  { key: 'lymph', label: 'lymphocyte percentage', map: LYMPH_MAP },
];

export function palliativePrognosticScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const { total, parts, missing } = sumSelects(o, PAP_SELECTS);
  if (missing.length) return { valid: false, message: needMessage(missing, 4) + ' (plus the dyspnea/anorexia checkboxes).' };
  let t = total;
  if (onFlag(o.dyspnea)) { t += 1; parts.push('dyspnea (+1)'); }
  if (onFlag(o.anorexia)) { t += 1.5; parts.push('anorexia (+1.5)'); }
  t = r1(num('PaP total', t, { min: 0, max: 17.5 }));
  let group; let survival; let abnormal;
  if (t <= 5.5) { group = 'A'; survival = '30-day survival > 70%'; abnormal = false; }
  else if (t <= 11) { group = 'B'; survival = '30-day survival 30–70%'; abnormal = true; }
  else { group = 'C'; survival = '30-day survival < 30%'; abnormal = true; }
  return {
    valid: true,
    score: t,
    bandLabel: `Group ${group}`,
    abnormal,
    band: `PaP ${t}/17.5 — risk group ${group}: ${survival}.`,
    detail: (parts.length ? parts.join('; ') : 'all components scored 0') + '.',
    note: PAP_NOTE,
  };
}

// --- 2.6 Opioid equianalgesic / rotation converter ---------------------------
const OPIOID_NOTE = 'Opioid equianalgesic / rotation converter (standard equianalgesic table; McPherson ML, Demystifying Opioid Conversion Calculations, 2nd ed, ASHP 2018; CDC oral MME factors; University of Iowa equianalgesic chart). The source daily dose is converted to oral morphine milligram equivalents (OME) and back to the target opioid, then an incomplete-cross-tolerance reduction of 25–50% is applied to the recommended starting dose. OME factors (oral morphine = 1): oxycodone 1.5, hydromorphone PO 4, hydrocodone 1, codeine 0.15, tramadol 0.1, tapentadol 0.4, oxymorphone PO 3, parenteral morphine 3 (oral:IV 3:1), hydromorphone IV 20, oxymorphone IV 30, IV fentanyl 0.3 OME/mcg, transdermal fentanyl 2.4 OME per mcg/h. Methadone and buprenorphine are deliberately excluded — their ratios are non-linear / ceiling-limited and unsafe to reduce to a constant. This is a planning aid: confirm every conversion against your institutional protocol and an independent second check.';
// { drug-route key : { factor (OME per unit), unit, label } }
const OPIOID_AGENTS = {
  'morphine-po': { factor: 1, unit: 'mg/day', label: 'oral morphine' },
  'morphine-iv': { factor: 3, unit: 'mg/day', label: 'IV/SC morphine' },
  'oxycodone-po': { factor: 1.5, unit: 'mg/day', label: 'oral oxycodone' },
  'hydromorphone-po': { factor: 4, unit: 'mg/day', label: 'oral hydromorphone' },
  'hydromorphone-iv': { factor: 20, unit: 'mg/day', label: 'IV/SC hydromorphone' },
  'hydrocodone-po': { factor: 1, unit: 'mg/day', label: 'oral hydrocodone' },
  'codeine-po': { factor: 0.15, unit: 'mg/day', label: 'oral codeine' },
  'tramadol-po': { factor: 0.1, unit: 'mg/day', label: 'oral tramadol' },
  'tapentadol-po': { factor: 0.4, unit: 'mg/day', label: 'oral tapentadol' },
  'oxymorphone-po': { factor: 3, unit: 'mg/day', label: 'oral oxymorphone' },
  'oxymorphone-iv': { factor: 30, unit: 'mg/day', label: 'IV/SC oxymorphone' },
  'fentanyl-iv': { factor: 0.3, unit: 'mcg/day', label: 'IV fentanyl' },
  'fentanyl-td': { factor: 2.4, unit: 'mcg/h', label: 'transdermal fentanyl' },
};
const REDUCTION_MAP = { r0: 0, r25: 0.25, r33: 0.33, r50: 0.5 };

export function opioidConversion(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const src = OPIOID_AGENTS[o.source];
  const tgt = OPIOID_AGENTS[o.target];
  if (!src) return { valid: false, message: 'Choose the source opioid and route.' };
  if (!tgt) return { valid: false, message: 'Choose the target opioid and route.' };
  const dose = o.dose;
  if (dose === null || dose === undefined || dose === '' || typeof dose !== 'number' || !Number.isFinite(dose) || dose <= 0) {
    return { valid: false, message: 'Enter the total source daily dose (a positive number).' };
  }
  const d = num('source daily dose', dose, { min: 0, max: 100000 });
  const reduction = REDUCTION_MAP[o.reduction] ?? 0.5;
  const ome = r1(num('OME', d * src.factor, { min: 0, max: 1e7 }));
  // tgt.factor is a fixed positive constant; division is domain-safe.
  const equi = r1(num('equianalgesic target', ome / tgt.factor, { min: 0, max: 1e7 }));
  const starting = r1(num('starting dose', equi * (1 - reduction), { min: 0, max: 1e7 }));
  const sameDrugRoute = o.source === o.target;
  const isFentanylTd = o.target === 'fentanyl-td';
  return {
    valid: true,
    ome,
    equi,
    starting,
    reductionPct: Math.round(reduction * 100),
    targetUnit: tgt.unit,
    band: sameDrugRoute
      ? `Source and target are the same — ${ome} mg oral morphine equivalents/day; no rotation needed.`
      : `${src.label} ${r1(d)} ${src.unit} ≈ ${ome} mg oral morphine equivalents/day → ${tgt.label} equianalgesic ${equi} ${tgt.unit}; with a ${Math.round(reduction * 100)}% cross-tolerance reduction, start ${starting} ${tgt.unit}.`,
    detail: isFentanylTd
      ? `Round the ${starting} mcg/h down to an available patch size (12, 25, 37.5, 50, 75, 100 mcg/h) and provide breakthrough cover.`
      : `Equianalgesic ${equi} ${tgt.unit} before reduction; reduced ${Math.round(reduction * 100)}% for incomplete cross-tolerance to ${starting} ${tgt.unit}.`,
    abnormal: false,
    note: OPIOID_NOTE,
  };
}

// --- 2.7 Naranjo ADR Probability Scale ---------------------------------------
const NARANJO_NOTE = 'Naranjo Adverse Drug Reaction Probability Scale (Naranjo CA, Busto U, Sellers EM, et al, Clin Pharmacol Ther 1981;30(2):239-245) — ten weighted yes/no/don’t-know questions estimating the probability that a drug caused an adverse event. The weights include negatives: the event appearing only after the drug is +2 but a No is −1; a No on rechallenge is −1; an alternative cause present is −1 (absent +2); a reaction reappearing with placebo is −1 (No +1). The total ranges from −4 to +13 and maps to doubtful (≤ 0), possible (1–4), probable (5–8), and definite (≥ 9). It reports the total, the contributing answers, and the probability band; it does not establish causality on its own.';
// Each question: yes / no / unknown point value (unknown is always 0).
const NARANJO_Q = [
  { key: 'q1', label: 'previous conclusive reports', yes: 1, no: 0 },
  { key: 'q2', label: 'event after the drug was given', yes: 2, no: -1 },
  { key: 'q3', label: 'improved on dechallenge/antagonist', yes: 1, no: 0 },
  { key: 'q4', label: 'reappeared on rechallenge', yes: 2, no: -1 },
  { key: 'q5', label: 'alternative causes present', yes: -1, no: 2 },
  { key: 'q6', label: 'reappeared with placebo', yes: -1, no: 1 },
  { key: 'q7', label: 'drug in toxic blood concentration', yes: 1, no: 0 },
  { key: 'q8', label: 'dose-response relationship', yes: 1, no: 0 },
  { key: 'q9', label: 'prior similar reaction', yes: 1, no: 0 },
  { key: 'q10', label: 'confirmed by objective evidence', yes: 1, no: 0 },
];

export function naranjo(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  let total = 0;
  const parts = [];
  for (const q of NARANJO_Q) {
    const a = o[q.key];
    if (a === 'yes') { total += q.yes; if (q.yes !== 0) parts.push(`${q.label}: yes (${q.yes > 0 ? '+' : ''}${q.yes})`); }
    else if (a === 'no') { total += q.no; if (q.no !== 0) parts.push(`${q.label}: no (${q.no > 0 ? '+' : ''}${q.no})`); }
    else if (a === 'unknown' || a === 'dk') { /* 0 */ }
    else { missing.push(q.label); }
  }
  if (missing.length) return { valid: false, message: `Answer all 10 questions — ${missing.length} still needed (yes / no / don’t know).` };
  const t = num('Naranjo total', total, { min: -4, max: 13 });
  let band; let abnormal;
  if (t <= 0) { band = 'Doubtful'; abnormal = false; }
  else if (t <= 4) { band = 'Possible'; abnormal = false; }
  else if (t <= 8) { band = 'Probable'; abnormal = true; }
  else { band = 'Definite'; abnormal = true; }
  return {
    valid: true,
    score: t,
    bandLabel: band,
    abnormal,
    band: `Naranjo ${t} — ${band.toLowerCase()} adverse drug reaction.`,
    detail: parts.length ? parts.join('; ') + '.' : 'all answers scored 0.',
    note: NARANJO_NOTE,
  };
}

// --- DEFERRED: valproate-correction ------------------------------------------
// The proposed eighth tile (Hermida-Tutor albumin normalization of total
// valproate) is NOT shipped. Source governance (spec-v97) blocks it:
//   1. The spec-v148 draft citation (Ther Drug Monit 2005;27(5):619-625) is
//      wrong; the paper is Hermida J, Tutor JC, J Pharmacol Sci 2005;97(4):
//      489-493.
//   2. The method is C_N = alpha_H * C_measured / 6.5, where alpha_H (the free
//      fraction at the patient's albumin) is read from a published lookup table
//      that could be located in only ONE reproducible source — failing the
//      >= 2-independent-source rule (the same block that deferred crib-ii/gail).
//   3. A later validation (Hanley, Neurocrit Care 2018;30(2):320-327) found the
//      equation clinically inaccurate against measured free valproate.
// Deferred with crib-ii / gail-bcrat / gwtg-hf / roks-stone-recurrence rather
// than ship an under-sourced, high-stakes drug-level correction. See
// docs/spec-v148.md §7.1.
