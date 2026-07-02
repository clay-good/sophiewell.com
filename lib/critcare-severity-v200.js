// spec-v200: four deterministic critical-care severity, organ-dysfunction, and
// acid-base instruments (Deep Subspecialty Quantitation program, spec-v199
// §1.1). Every id was verified absent by a direct scan of app.js first
// (spec-v85 §6.2). None duplicates a live tile; v200 runs no AI and makes no
// runtime network call. These quantify and stratify severity — they are not
// vasopressor titration, ventilator, fluid, or disposition orders (spec-v11
// §5.3).
//
// The proposed fifth instrument (vasoactive-inotropic-score / VIS) was DROPPED
// at implementation: the spec-v85 §6.2 collision re-check found VIS is already
// computed by the live `vis` tile (lib/clinical-v4.js, spec-v13 §3.6) with the
// identical Gaies 2010 formula and the same dopamine/dobutamine ×1,
// epinephrine/norepinephrine ×100, milrinone ×10, vasopressin ×10,000
// multipliers, so a standalone tile would duplicate it. v200 therefore ships
// +4, not +5.
//
//   oasis     - Oxford Acute Severity of Illness Score (Johnson 2013)
//   lods      - Logistic Organ Dysfunction System (Le Gall 1996)
//   deltaGap  - delta-gap / delta-ratio (delta-delta) acid-base disambiguator
//   appsArds  - APPS score (Age, PaO2/FiO2, Plateau pressure) in ARDS
//
// COEFFICIENTS / POINT WEIGHTS / RISK BANDS RE-FETCHED, NEVER RECALLED
// (spec-v97), each cross-verified across >= 2 independent open sources at
// implementation:
//   - OASIS point grid (Johnson AEW, Kramer AA, Clifford GD, Crit Care Med
//     2013;41(7):1711-1718): the 10-variable grid transcribed band-for-band
//     from the original author's reference implementation (alistairewj/oasis
//     oasis.m) and cross-checked against an independent implementation
//     (tompollard OASIS gist) — the two agree on every threshold. Total 0-75.
//     In-hospital-mortality logistic (author reference code, single open
//     source, literature-corroborated): logit = -6.1746 + 0.1275*OASIS.
//   - LODS point grid (Le Gall JR, Klar J, Lemeshow S, et al, JAMA
//     1996;276(10):802-810): per-system worst value mapped to 0/1/3/5, the
//     system score is the LARGEST point value among that system's variables,
//     total = sum of the six systems. Grid cross-verified across two open
//     reproductions (statpages.info LODS; MDM-Portal item 28033) that agree on
//     every threshold; per-system maxima neuro/cardio/renal 5, pulmonary 3,
//     hematologic 3, hepatic 1 (total 0-22). Hospital-mortality logistic
//     (statpages reproduction of Le Gall 1996, single open source,
//     sanity-checked against PMC7011874): logit = -3.4043 + 0.4173*LODS.
//   - delta-gap / delta-ratio (Wrenn K, Ann Emerg Med 1990;19(11):1310-1313;
//     Rastegar A, J Am Soc Nephrol 2007;18(9):2429-2431): AG = Na - Cl - HCO3;
//     delta gap = (AG - normal AG) - (normal HCO3 - HCO3); delta ratio = (AG -
//     normal AG) / (normal HCO3 - HCO3). Bands (LITFL, StatPearls NBK448090):
//     <0.4 concurrent non-anion-gap metabolic acidosis, 0.4 to <0.8 mixed,
//     0.8 to <1 borderline concurrent NAGMA, 1-2 pure high-anion-gap metabolic
//     acidosis, >2 coexisting metabolic alkalosis or chronic respiratory
//     acidosis.
//   - APPS score (Villar J, Ambros A, Soler JA, et al, Crit Care Med
//     2016;44(7):1361-1369): three drafting slips in the spec-v200 draft were
//     CORRECTED here under spec-v97 against Villar 2016 Table 1, reproduced
//     identically by PMC5107525, PMC11645718, and the SAGE validation. Age <47
//     +1 / 47-66 +2 / >66 +3; PaO2/FiO2 >158 +1 / 105-158 +2 / <105 +3 (the
//     draft's 84-158 / <84 was wrong); plateau pressure <=27 +1 / >27-30 +2 /
//     >30 +3 (the draft's 28-29 middle band was wrong). Total 3-9; tiers low
//     3-4, intermediate 5-7 (the draft's 5-6 was wrong), high 8-9 (the draft's
//     7-9 was wrong).

import { num, r1, r2 } from './num.js';

function inRange(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function bool(v) { return v === true || v === '1' || v === 'true' || v === 'yes'; }

// Overflow-safe logistic: probability (%) from a logit, clamped like sapsII
// (lib/idcrit-v99.js) so Math.exp never returns Infinity into a string.
function logisticPct(logit) {
  const clamped = Math.max(-40, Math.min(40, logit));
  return Math.max(0, Math.min(100, (1 / (1 + Math.exp(-clamped))) * 100));
}

// --- 2.1 OASIS --------------------------------------------------------------
const OASIS_NOTE = 'OASIS (Johnson AEW, Kramer AA, Clifford GD, Crit Care Med 2013;41(7):1711-1718): a 10-variable ICU severity score needing no lab panel, a low-input alternative to APACHE II / SAPS II. Pre-ICU stay, age, GCS, heart rate, mean arterial pressure, respiratory rate, temperature, urine output, mechanical ventilation, and elective vs non-elective status are each banded per the published grid (total 0-75); the total drives predicted in-hospital mortality through the logistic logit = -6.1746 + 0.1275*OASIS. A model estimate for benchmarking, not an individual prognosis or a disposition order.';

function oasisPreIcu(v) { return v < 0.17 ? 5 : v < 4.95 ? 3 : v < 24 ? 0 : v <= 311.8 ? 2 : 1; }
function oasisAge(v) { return v < 24 ? 0 : v < 54 ? 3 : v < 77 ? 6 : v < 90 ? 9 : 7; }
function oasisGcs(v) { return v >= 15 ? 0 : v >= 14 ? 3 : v >= 8 ? 4 : 10; }
function oasisHr(v) { return v < 33 ? 4 : v < 88 ? 0 : v < 106 ? 1 : v <= 125 ? 3 : 6; }
function oasisMap(v) { return v < 20.65 ? 4 : v < 51 ? 3 : v < 61.33 ? 2 : v <= 143.44 ? 0 : 3; }
function oasisRr(v) { return v < 6 ? 10 : v < 13 ? 1 : v < 23 ? 0 : v < 30 ? 1 : v < 45 ? 6 : 9; }
function oasisTemp(v) { return v < 33.22 ? 3 : v < 35.94 ? 4 : v < 36.40 ? 2 : v < 36.89 ? 0 : v <= 39.88 ? 2 : 6; }
function oasisUrine(v) { return v < 671 ? 10 : v < 1427 ? 5 : v < 2544 ? 1 : v <= 6896 ? 0 : 8; }

export function oasis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const preIcu = inRange(o.preIcuHours, 0, 20000);
  const age = inRange(o.age, 0, 120);
  const gcs = inRange(o.gcs, 3, 15);
  const hr = inRange(o.hr, 0, 350);
  const map = inRange(o.map, 0, 300);
  const rr = inRange(o.rr, 0, 120);
  const temp = inRange(o.temp, 20, 45);
  const urine = inRange(o.urine, 0, 40000);
  if ([preIcu, age, gcs, hr, map, rr, temp, urine].some((v) => v === null)) {
    return { valid: false, message: 'Enter all ten OASIS variables (pre-ICU stay hours, age, GCS, heart rate, MAP, respiratory rate, temperature °C, urine mL/24h) and set ventilation and admission type.' };
  }
  const parts = [
    ['Pre-ICU stay', oasisPreIcu(preIcu)],
    ['Age', oasisAge(age)],
    ['GCS', oasisGcs(gcs)],
    ['Heart rate', oasisHr(hr)],
    ['MAP', oasisMap(map)],
    ['Respiratory rate', oasisRr(rr)],
    ['Temperature', oasisTemp(temp)],
    ['Urine output', oasisUrine(urine)],
    ['Mechanical ventilation', bool(o.mechVent) ? 9 : 0],
    ['Non-elective admission', bool(o.elective) ? 0 : 6],
  ];
  let score = 0;
  for (const [, pts] of parts) score += pts;
  score = num('OASIS', score, { min: 0, max: 75 });
  const mortality = r1(logisticPct(-6.1746 + 0.1275 * score));
  const abnormal = mortality >= 25;
  const top = parts.filter((p) => p[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map((p) => `${p[0]} (+${p[1]})`);
  return {
    valid: true,
    score,
    mortality,
    abnormal,
    bandLabel: `OASIS ${score}`,
    band: `OASIS ${score} — predicted in-hospital mortality ${mortality}%.`,
    detail: top.length ? `Leading contributors: ${top.join('; ')}.` : 'All variables in their reference bands — score 0.',
    note: OASIS_NOTE,
  };
}

// --- 2.2 LODS ---------------------------------------------------------------
const LODS_NOTE = 'LODS (Le Gall JR, Klar J, Lemeshow S, et al, JAMA 1996;276(10):802-810): a six-system organ-dysfunction model. The worst first-24-hour value in each system maps to 0/1/3/5 points; each system takes the largest point value among its variables (neurologic/cardiovascular/renal max 5, pulmonary 3, hematologic 3, hepatic 1; total 0-22). The total drives predicted hospital mortality through logit = -3.4043 + 0.4173*LODS. A calibrated organ-dysfunction complement to SOFA — a model estimate, not an individual prognosis or an order.';

function lodsNeuro(g) { return g >= 14 ? 0 : g >= 9 ? 1 : g >= 6 ? 3 : 5; }
function lodsHr(v) { return v < 30 ? 5 : v < 140 ? 0 : 1; }
function lodsSbp(v) { return v < 40 ? 5 : v < 70 ? 3 : v < 90 ? 1 : v < 240 ? 0 : v < 270 ? 1 : 3; }
function lodsBun(v) { return v < 17 ? 0 : v < 28 ? 1 : v < 56 ? 3 : 5; }
function lodsCreat(v) { return v < 1.2 ? 0 : v < 1.6 ? 1 : 3; }
function lodsUrine(v) { return v < 0.5 ? 5 : v < 0.75 ? 3 : v < 10 ? 0 : 3; }
function lodsWbc(v) { return v < 1 ? 3 : v < 2.5 ? 1 : v < 50 ? 0 : 1; }
function lodsPlt(v) { return v < 50 ? 1 : 0; }

export function lods(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const gcs = inRange(o.gcs, 3, 15);
  const hr = inRange(o.hr, 0, 350);
  const sbp = inRange(o.sbp, 0, 350);
  const bun = inRange(o.bun, 0, 300);
  const creat = inRange(o.creatinine, 0, 40);
  const urine = inRange(o.urineL, 0, 40);
  const wbc = inRange(o.wbc, 0, 500);
  const plt = inRange(o.platelets, 0, 3000);
  const bili = inRange(o.bilirubin, 0, 100);
  if ([gcs, hr, sbp, bun, creat, urine, wbc, plt, bili].some((v) => v === null)) {
    return { valid: false, message: 'Enter GCS, heart rate, systolic BP, BUN (mg/dL), creatinine (mg/dL), urine output (L/day), WBC, platelets, and bilirubin (mg/dL); set ventilation and prothrombin.' };
  }
  const vent = bool(o.mechVent);
  const pf = inRange(o.pf, 0, 1000);
  if (vent && pf === null) {
    return { valid: false, message: 'On mechanical ventilation / CPAP: enter the PaO₂/FiO₂ ratio.' };
  }
  const neuro = lodsNeuro(gcs);
  const cardio = Math.max(lodsHr(hr), lodsSbp(sbp));
  const renal = Math.max(lodsBun(bun), lodsCreat(creat), lodsUrine(urine));
  const pulmonary = !vent ? 0 : (pf >= 150 ? 1 : 3);
  const hema = Math.max(lodsWbc(wbc), lodsPlt(plt));
  const hepatic = Math.max(bili >= 2 ? 1 : 0, bool(o.ptLow) ? 1 : 0);
  const systems = [
    ['Neurologic', neuro], ['Cardiovascular', cardio], ['Renal', renal],
    ['Pulmonary', pulmonary], ['Hematologic', hema], ['Hepatic', hepatic],
  ];
  let total = 0;
  for (const [, pts] of systems) total += pts;
  total = num('LODS', total, { min: 0, max: 22 });
  const mortality = r1(logisticPct(-3.4043 + 0.4173 * total));
  const abnormal = mortality >= 25;
  const active = systems.filter((s) => s[1] > 0).map((s) => `${s[0]} +${s[1]}`);
  return {
    valid: true,
    score: total,
    mortality,
    abnormal,
    bandLabel: `LODS ${total}`,
    band: `LODS ${total} — predicted hospital mortality ${mortality}%.`,
    detail: active.length ? `Dysfunction: ${active.join('; ')}.` : 'No organ-system dysfunction scored — LODS 0.',
    note: LODS_NOTE,
  };
}

// --- 2.4 delta-gap / delta-ratio --------------------------------------------
const DELTA_NOTE = 'Delta gap / delta ratio (Wrenn K, Ann Emerg Med 1990; Rastegar A, J Am Soc Nephrol 2007): disambiguates a mixed metabolic disorder hiding behind a high anion gap. Anion gap = Na − Cl − HCO₃ (corrected for albumin when entered). Delta ratio = (AG − normal AG) / (normal HCO₃ − HCO₃). Interpretation: <0.4 a concurrent non-anion-gap (hyperchloremic) metabolic acidosis; 0.4 to <0.8 mixed; 0.8 to <1 borderline; 1–2 a pure high-anion-gap metabolic acidosis; >2 a coexisting metabolic alkalosis or chronic respiratory acidosis. Decision support, not an order.';

export function deltaGap(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const na = inRange(o.na, 80, 200);
  const cl = inRange(o.cl, 50, 160);
  const hco3 = inRange(o.hco3, 1, 60);
  if (na === null || cl === null || hco3 === null) {
    return { valid: false, message: 'Enter sodium, chloride, and bicarbonate (mEq/L).' };
  }
  const normalAg = inRange(o.normalAg, 3, 20) ?? 12;
  const normalHco3 = inRange(o.normalHco3, 15, 30) ?? 24;
  const albumin = inRange(o.albumin, 0.5, 7);
  const rawAg = na - cl - hco3;
  const ag = albumin === null ? rawAg : rawAg + 2.5 * (4.0 - albumin);
  const agUsed = r2(ag);
  const deltaGapVal = r2((ag - normalAg) - (normalHco3 - hco3));
  const denom = normalHco3 - hco3;
  const agLabel = albumin === null ? `Anion gap ${r2(rawAg)}` : `Albumin-corrected anion gap ${agUsed} (measured ${r2(rawAg)})`;
  if (denom <= 0) {
    return {
      valid: true,
      abnormal: false,
      score: agUsed,
      bandLabel: `AG ${agUsed}`,
      band: `${agLabel}; delta gap ${deltaGapVal}. No delta ratio — bicarbonate is not depressed (≥ normal ${normalHco3}).`,
      detail: `Delta gap = (AG − ${normalAg}) − (${normalHco3} − HCO₃) = ${deltaGapVal}. The delta ratio needs a depressed bicarbonate.`,
      note: DELTA_NOTE,
    };
  }
  const ratio = r2((ag - normalAg) / denom);
  let interp; let abnormal = true;
  if (ratio < 0.4) interp = 'a concurrent non-anion-gap (hyperchloremic) metabolic acidosis (< 0.4)';
  else if (ratio < 0.8) interp = 'a mixed high-anion-gap + non-anion-gap metabolic acidosis (0.4 to < 0.8)';
  else if (ratio < 1) interp = 'borderline — a possible concurrent non-anion-gap component (0.8 to < 1)';
  else if (ratio <= 2) { interp = 'a pure high-anion-gap metabolic acidosis (1–2)'; abnormal = false; }
  else interp = 'a coexisting metabolic alkalosis or chronic respiratory acidosis (> 2)';
  return {
    valid: true,
    abnormal,
    score: ratio,
    bandLabel: `Δ-ratio ${ratio}`,
    band: `Delta ratio ${ratio} — ${interp}.`,
    detail: `${agLabel}; delta gap ${deltaGapVal}; delta ratio = (AG − ${normalAg}) / (${normalHco3} − HCO₃) = ${ratio}.`,
    note: DELTA_NOTE,
  };
}

// --- 2.5 APPS score ---------------------------------------------------------
const APPS_NOTE = 'APPS score (Villar J, Ambros A, Soler JA, et al, Crit Care Med 2016;44(7):1361-1369): a simple ARDS outcome stratifier from three bedside variables at 24 h. Age <47 (+1) / 47–66 (+2) / >66 (+3); PaO₂/FiO₂ >158 (+1) / 105–158 (+2) / <105 (+3); plateau pressure ≤27 (+1) / >27–30 (+2) / >30 cmH₂O (+3). Total 3–9; low 3–4, intermediate 5–7, high 8–9 (rising ICU/hospital mortality). A prognostic estimate, not a ventilator or disposition order.';

function appsAge(v) { return v < 47 ? 1 : v <= 66 ? 2 : 3; }
function appsPf(v) { return v > 158 ? 1 : v >= 105 ? 2 : 3; }
function appsPlateau(v) { return v <= 27 ? 1 : v <= 30 ? 2 : 3; }

export function appsArds(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = inRange(o.age, 0, 120);
  const pf = inRange(o.pf, 0, 1000);
  const plateau = inRange(o.plateau, 0, 80);
  if (age === null || pf === null || plateau === null) {
    return { valid: false, message: 'Enter age (years), PaO₂/FiO₂ ratio, and plateau pressure (cmH₂O).' };
  }
  const aP = appsAge(age); const pP = appsPf(pf); const plP = appsPlateau(plateau);
  const score = num('APPS', aP + pP + plP, { min: 3, max: 9 });
  let tier; let abnormal = true;
  if (score <= 4) { tier = 'low-mortality tier (3–4)'; abnormal = false; }
  else if (score <= 7) tier = 'intermediate-mortality tier (5–7)';
  else tier = 'high-mortality tier (8–9)';
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `APPS ${score}`,
    band: `APPS ${score} — ${tier}.`,
    detail: `Age +${aP}; PaO₂/FiO₂ +${pP}; plateau pressure +${plP}.`,
    note: APPS_NOTE,
  };
}
