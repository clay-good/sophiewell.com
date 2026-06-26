// spec-v151 (the first implementation spec of the spec-v150 Post-Parity
// Coverage program): four deterministic dermatology severity instruments that
// fill a confirmed gap — dermatology had no scored-severity tile in the live
// catalog. None duplicates a live tile; v151 parses no image, runs no AI, and
// makes no runtime network call.
//
//   pasi   - Psoriasis Area and Severity Index (Fredriksson 1978)
//   easi   - Eczema Area and Severity Index (Hanifin 2001), age-branched weights
//   scorad - SCORing Atopic Dermatitis (European Task Force 1993)
//   dlqi   - Dermatology Life Quality Index (Finlay 1994)
//
// Per the spec-v100 §2 classification clarification each tile CONSUMES the
// clinician's / patient's bounded read of the exam (per-region erythema /
// induration / desquamation, area, extent, the VAS, the ten DLQI answers) and
// COMPUTES a region/item-weighted score plus the source's interpretive band —
// none is a no-input reference table. Pure functions only (spec-v29 §3 one-line
// test). Citations live inline in lib/meta.js; renderers in views/group-v151.js
// render the spec-v50 §3 clinical-posture note. The treat / escalate decision
// (e.g. biologic eligibility) stays with the clinician and local protocol
// (spec-v11 §5.3).
//
// DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent authoritative sources (the original papers, DermNet,
// the Leshem 2015 EASI interpretability study, the European Task Force ETFAD
// consensus report, and the Cardiff/Finlay DLQI scoring manual). SOURCE-
// GOVERNANCE:
//   - pasi (Fredriksson & Pettersson 1978, Dermatologica 157(4):238): four body
//     regions; each carries erythema, induration (thickness), and desquamation
//     (scaling) each 0-4 (a FIVE-point 0-4 scale — do NOT cap at 3 like EASI), and
//     an area grade 0-6 mapped from the % involvement (0% -> 0, 1-9% -> 1, 10-29%
//     -> 2, 30-49% -> 3, 50-69% -> 4, 70-89% -> 5, 90-100% -> 6). Region weights
//     head/neck 0.1, upper limbs 0.2, trunk 0.3, lower limbs 0.4 (sum 1.0). PASI =
//     Sum over regions of (E+I+D) x areaGrade x weight, range 0-72. Common bands:
//     mild < 10, moderate 10-20, severe > 20. Class A.
//   - easi (Hanifin 2001, Exp Dermatol 10(1):11): four regions; each carries
//     erythema, edema/papulation, excoriation, and lichenification each 0-3 (a
//     FOUR-point 0-3 scale), and the same area grade 0-6. AGE-BRANCHED weights are
//     the chief correctness risk: adult / >= 8 yr uses head 0.1, upper 0.2, trunk
//     0.3, lower 0.4; child / < 8 yr uses head 0.2, upper 0.2, trunk 0.3, lower
//     0.3 (head and lower-limb weights swap; upper and trunk are unchanged; both
//     sum to 1.0). EASI = Sum (E+Ed+Ex+L) x areaGrade x weight, range 0-72. The
//     published Leshem 2015 (Br J Dermatol 172(5):1353) SIX-band strata are used:
//     clear 0, almost clear 0.1-1.0, mild 1.1-7.0, moderate 7.1-21.0, severe
//     21.1-50.0, very severe 50.1-72.0 (the spec-v151 draft's 4-band 6/23 cut-set
//     is unverified; the published Leshem strata, cross-verified against DermNet +
//     the Hanifin 2022 practical guide, are used instead). Class A.
//   - scorad (European Task Force on Atopic Dermatitis 1993, Dermatology
//     186(1):23): A = extent (% BSA, 0-100, rule of nines); B = six intensity
//     items (erythema, edema/papulation, oozing/crusting, excoriation,
//     lichenification, dryness) each 0-3 -> 0-18, with DRYNESS scored on
//     UNINVOLVED skin (the classic trap) and the others on a representative
//     lesion; C = two subjective VAS (pruritus, sleeplessness) each 0-10 -> 0-20.
//     SCORAD = A/5 + 7B/2 + C, range 0-103; oSCORAD = A/5 + 7B/2 (objective,
//     C dropped), range 0-83. Bands mild < 25, moderate 25-50, severe > 50.
//     Class A.
//   - dlqi (Finlay & Khan 1994, Clin Exp Dermatol 19(3):210): ten questions each
//     0-3 (Very much 3, A lot 2, A little 1, Not at all / Not relevant 0), total
//     0-30. Q7 first asks whether the skin PREVENTED work/study (Yes = 3); only on
//     No is the follow-up "how much a problem" scored (A lot 2 / A little 1 / Not
//     at all 0) — Q7 contributes a single value, never both branches. Bands: 0-1
//     no effect, 2-5 small, 6-10 moderate, 11-20 very large, 21-30 extremely large
//     effect on quality of life. A partially-completed form surfaces a complete-
//     the-fields fallback rather than scoring an undercounted total. Class A.

import { num, r1 } from './num.js';

// % involvement (0-100) -> the 0-6 PASI/EASI area grade. A blank or out-of-range
// value is clamped to 0% (grade 0) so the weighted sum is always finite.
function areaGrade(pct) {
  const p = (typeof pct === 'number' && Number.isFinite(pct)) ? Math.min(100, Math.max(0, pct)) : 0;
  if (p <= 0) return 0;
  if (p < 10) return 1;
  if (p < 30) return 2;
  if (p < 50) return 3;
  if (p < 70) return 4;
  if (p < 90) return 5;
  return 6;
}
// Parse an ordinal severity select ('0'..'max'); a blank/invalid value is 0.
function grade(v, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(max, Math.max(0, Math.round(n)));
}

// --- 2.1 PASI ----------------------------------------------------------------
const PASI_NOTE = 'Psoriasis Area and Severity Index (Fredriksson T, Pettersson U, Dermatologica 1978;157(4):238-244) — the standard psoriasis severity score and the usual gate for systemic/biologic therapy. For each of four body regions (head/neck, upper limbs, trunk, lower limbs) erythema, induration, and desquamation are each graded 0–4 and the affected area is graded 0–6 from the % involved (0% →0, <10% →1, 10–29% →2, 30–49% →3, 50–69% →4, 70–89% →5, 90–100% →6). PASI = Σ (E+I+D) × area × region weight, with weights head 0.1, upper limbs 0.2, trunk 0.3, lower limbs 0.4, range 0–72. Common bands: mild < 10, moderate 10–20, severe > 20. It reports the total and band; the therapy decision stays with the clinician.';
const PASI_REGIONS = [
  { key: 'head', label: 'head/neck', weight: 0.1 },
  { key: 'upper', label: 'upper limbs', weight: 0.2 },
  { key: 'trunk', label: 'trunk', weight: 0.3 },
  { key: 'lower', label: 'lower limbs', weight: 0.4 },
];

export function pasi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const parts = [];
  for (const r of PASI_REGIONS) {
    const e = grade(o[r.key + 'E'], 4);
    const i = grade(o[r.key + 'I'], 4);
    const d = grade(o[r.key + 'D'], 4);
    const ag = areaGrade(o[r.key + 'Area']);
    const sub = (e + i + d) * ag * r.weight;
    total += sub;
    if (sub > 0) parts.push(`${r.label} (E${e}+I${i}+D${d})×area ${ag}×${r.weight} = ${r1(sub)}`);
  }
  const t = r1(num('PASI', total, { min: 0, max: 72 }));
  let sev; let range; let abnormal;
  if (t < 10) { sev = 'Mild'; range = '< 10'; abnormal = false; }
  else if (t <= 20) { sev = 'Moderate'; range = '10–20'; abnormal = true; }
  else { sev = 'Severe'; range = '> 20'; abnormal = true; }
  return {
    valid: true,
    score: t,
    bandLabel: sev,
    abnormal,
    band: `PASI ${t}/72 — ${sev.toLowerCase()} psoriasis (${range}).`,
    detail: parts.length ? parts.join('; ') + '.' : 'no involvement entered — all regions score 0.',
    note: PASI_NOTE,
  };
}

// --- 2.2 EASI ----------------------------------------------------------------
const EASI_NOTE = 'Eczema Area and Severity Index (Hanifin JM, Thurston M, Omoto M, et al, Exp Dermatol 2001;10(1):11-18) — a validated atopic-dermatitis severity score. For each of four regions (head/neck, upper limbs, trunk, lower limbs) erythema, edema/papulation, excoriation, and lichenification are each graded 0–3 and area 0–6 from the % involved. EASI = Σ (E+Ed+Ex+L) × area × weight; the weights are AGE-DEPENDENT — adults (≥ 8 yr) head 0.1, upper 0.2, trunk 0.3, lower 0.4; children (< 8 yr) head 0.2, upper 0.2, trunk 0.3, lower 0.3 — range 0–72. Severity (Leshem 2015): clear 0, almost clear 0.1–1.0, mild 1.1–7.0, moderate 7.1–21.0, severe 21.1–50.0, very severe 50.1–72.0. It reports the total, the band, and which age weighting was used.';
const EASI_ADULT = { head: 0.1, upper: 0.2, trunk: 0.3, lower: 0.4 };
const EASI_CHILD = { head: 0.2, upper: 0.2, trunk: 0.3, lower: 0.3 };
const EASI_REGIONS = [
  { key: 'head', label: 'head/neck' },
  { key: 'upper', label: 'upper limbs' },
  { key: 'trunk', label: 'trunk' },
  { key: 'lower', label: 'lower limbs' },
];

export function easi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const isChild = o.age === 'child';
  const weights = isChild ? EASI_CHILD : EASI_ADULT;
  let total = 0;
  const parts = [];
  for (const r of EASI_REGIONS) {
    const e = grade(o[r.key + 'E'], 3);
    const ed = grade(o[r.key + 'Ed'], 3);
    const ex = grade(o[r.key + 'Ex'], 3);
    const l = grade(o[r.key + 'L'], 3);
    const ag = areaGrade(o[r.key + 'Area']);
    const sub = (e + ed + ex + l) * ag * weights[r.key];
    total += sub;
    if (sub > 0) parts.push(`${r.label} (${e}+${ed}+${ex}+${l})×area ${ag}×${weights[r.key]} = ${r1(sub)}`);
  }
  const t = r1(num('EASI', total, { min: 0, max: 72 }));
  let sev; let abnormal;
  if (t === 0) { sev = 'Clear'; abnormal = false; }
  else if (t <= 1.0) { sev = 'Almost clear'; abnormal = false; }
  else if (t <= 7.0) { sev = 'Mild'; abnormal = false; }
  else if (t <= 21.0) { sev = 'Moderate'; abnormal = true; }
  else if (t <= 50.0) { sev = 'Severe'; abnormal = true; }
  else { sev = 'Very severe'; abnormal = true; }
  const ageLabel = isChild ? 'child (< 8 yr) weights' : 'adult (≥ 8 yr) weights';
  return {
    valid: true,
    score: t,
    bandLabel: sev,
    ageWeighting: isChild ? 'child' : 'adult',
    abnormal,
    band: `EASI ${t}/72 — ${sev.toLowerCase()} atopic dermatitis (${ageLabel}).`,
    detail: parts.length ? parts.join('; ') + '.' : 'no involvement entered — all regions score 0.',
    note: EASI_NOTE,
  };
}

// --- 2.3 SCORAD --------------------------------------------------------------
const SCORAD_NOTE = 'SCORAD (European Task Force on Atopic Dermatitis, Dermatology 1993;186(1):23-31) — the consensus atopic-dermatitis severity index. A = extent (% body surface affected by the rule of nines, 0–100); B = six intensity items (erythema, edema/papulation, oozing/crusting, excoriation, lichenification, and dryness) each 0–3, total 0–18, with dryness assessed on UNINVOLVED skin; C = two subjective visual-analogue scores (pruritus and sleeplessness) each 0–10, total 0–20. SCORAD = A/5 + 7B/2 + C, range 0–103; the objective oSCORAD = A/5 + 7B/2 drops the subjective items. Bands: mild < 25, moderate 25–50, severe > 50. It reports SCORAD, oSCORAD, and the band.';
const SCORAD_B = [
  { key: 'erythema', label: 'erythema' },
  { key: 'edema', label: 'edema/papulation' },
  { key: 'oozing', label: 'oozing/crusting' },
  { key: 'excoriation', label: 'excoriation' },
  { key: 'lichenification', label: 'lichenification' },
  { key: 'dryness', label: 'dryness (uninvolved skin)' },
];

export function scorad(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const a = (typeof o.extent === 'number' && Number.isFinite(o.extent)) ? Math.min(100, Math.max(0, o.extent)) : 0;
  let b = 0;
  for (const it of SCORAD_B) b += grade(o[it.key], 3);
  const c1 = (typeof o.pruritus === 'number' && Number.isFinite(o.pruritus)) ? Math.min(10, Math.max(0, o.pruritus)) : 0;
  const c2 = (typeof o.sleeplessness === 'number' && Number.isFinite(o.sleeplessness)) ? Math.min(10, Math.max(0, o.sleeplessness)) : 0;
  const c = c1 + c2;
  const objective = a / 5 + (7 * b) / 2;
  const os = r1(num('oSCORAD', objective, { min: 0, max: 83 }));
  const s = r1(num('SCORAD', objective + c, { min: 0, max: 103 }));
  let sev; let abnormal;
  if (s < 25) { sev = 'Mild'; abnormal = false; }
  else if (s <= 50) { sev = 'Moderate'; abnormal = true; }
  else { sev = 'Severe'; abnormal = true; }
  return {
    valid: true,
    score: s,
    oscorad: os,
    bandLabel: sev,
    abnormal,
    band: `SCORAD ${s}/103 — ${sev.toLowerCase()} atopic dermatitis (oSCORAD ${os}).`,
    detail: `extent A ${r1(a)}% (A/5 = ${r1(a / 5)}), intensity B ${b}/18 (7B/2 = ${r1((7 * b) / 2)}), subjective C ${r1(c)}/20.`,
    note: SCORAD_NOTE,
  };
}

// --- 2.4 DLQI ----------------------------------------------------------------
const DLQI_NOTE = 'Dermatology Life Quality Index (Finlay AY, Khan GK, Clin Exp Dermatol 1994;19(3):210-216) — a ten-question patient-reported measure of how much a skin disease has affected quality of life over the last week. Each question scores Very much 3, A lot 2, A little 1, and Not at all or Not relevant 0; question 7 first asks whether the skin prevented working or studying (Yes = 3) and only otherwise scores how much of a problem it was. The total runs 0–30 and maps to no effect 0–1, small effect 2–5, moderate effect 6–10, very large effect 11–20, and extremely large effect 21–30 on the patient’s life. All ten questions must be answered for a valid total.';
const DLQI_Q = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];

export function dlqi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  let total = 0;
  for (let i = 0; i < DLQI_Q.length; i++) {
    const v = o[DLQI_Q[i]];
    if (v === null || v === undefined || v === '') { missing.push(`Q${i + 1}`); continue; }
    total += grade(v, 3);
  }
  if (missing.length) {
    return { valid: false, message: `Answer all 10 questions — ${missing.length} still needed (${missing.join(', ')}).` };
  }
  const t = num('DLQI total', total, { min: 0, max: 30 });
  let effect; let abnormal;
  if (t <= 1) { effect = 'no effect'; abnormal = false; }
  else if (t <= 5) { effect = 'small effect'; abnormal = false; }
  else if (t <= 10) { effect = 'moderate effect'; abnormal = true; }
  else if (t <= 20) { effect = 'very large effect'; abnormal = true; }
  else { effect = 'extremely large effect'; abnormal = true; }
  return {
    valid: true,
    score: t,
    bandLabel: effect.replace(/^./, (m) => m.toUpperCase()),
    abnormal,
    band: `DLQI ${t}/30 — ${effect} on quality of life.`,
    detail: `sum of ten 0–3 answers = ${t}.`,
    note: DLQI_NOTE,
  };
}
