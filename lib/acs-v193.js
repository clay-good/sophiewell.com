// spec-v193: five deterministic acute-coronary / primary-PCI / cardiogenic-shock
// risk instruments (Advanced Specialist Quantitation program, spec-v193 §1.1).
// Every id was verified absent by a direct scan of app.js first (spec-v85 §6.2).
// None duplicates a live tile; v193 runs no AI and makes no runtime network
// call. These stratify risk — they are not revascularization, transfusion,
// mechanical-support, or disposition orders (spec-v11 §5.3).
//
//   crusade               - CRUSADE major-bleeding risk (NSTEMI)
//   scaiShock             - SCAI SHOCK cardiogenic-shock stage
//   zwollePci             - Zwolle primary-PCI risk score
//   timiRiskIndex         - TIMI Risk Index
//   cadillacRisk          - CADILLAC post-PCI mortality risk
//
// POINT WEIGHTS / THRESHOLDS / BANDS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation:
//   - crusade (Subherwal S, et al, Circulation 2009;119(14):1873-1882): 8-variable
//     additive table with the U-shaped systolic-BP term; total ~1-100 mapped to
//     very low (<=20, 3.1%), low (21-30, 5.5%), moderate (31-40, 8.5%), high
//     (41-50, 11.9%), very high (>50, 19.5%).
//   - scaiShock (Naidu SS, et al, JSCAI 2022;1(1):100008; operationalized Kadosh
//     BS / Kapur NK, et al, JACC 2022;80(3):185-198): CSWG discrete thresholds ->
//     stage A-E; Jentzer 2019 Mayo CICU in-hospital mortality 3.0/7.1/12.4/40.4/
//     67.0%.
//   - zwollePci (De Luca G, et al, Circulation 2004;109(22):2737-2743): Killip
//     (I 0 / II 4 / III-IV 9), post-PCI TIMI flow (3->0, 2->1, 0-1->2), age>=60
//     (2), 3-vessel (1), anterior MI (1), ischemic time>4h (1); total 0-16; <=3
//     low, 4-6 intermediate, >=7 high.
//   - timiRiskIndex (Wiviott SD, et al, JACC 2006;47(8):1553-1558; derivation
//     Morrow DA, et al, Lancet 2001;358(9293):1571-1575): TRI = HR x (age/10)^2 /
//     SBP; higher -> higher mortality.
//   - cadillacRisk (Halkin A, et al, JACC 2005;45(9):1397-1405): LVEF<40% (4),
//     CrCl<60 (3), Killip 2-3 (3), post-PCI TIMI 0-2 (2), age>65 (2), anemia (2),
//     3-vessel (2); total 0-18; low 0-2, intermediate 3-5, high >=6.

import { num, r1, r2 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
function nonNeg(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return n;
}
function truthy(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on' || v === 'yes'; }

// --- 2.1 CRUSADE ------------------------------------------------------------
const CRUSADE_NOTE = 'CRUSADE major-bleeding risk in NSTEMI (Subherwal S, et al, Circulation 2009;119(14):1873-1882). Eight weighted variables — baseline hematocrit, creatinine clearance, heart rate, sex, signs of heart failure, prior vascular disease, diabetes, and systolic BP (a U-shaped term: both low and high add points) — sum to a score mapped to in-hospital major-bleeding risk. A bleeding-risk estimate, not a transfusion or antithrombotic order.';

function crusadeHct(h) { if (h < 31) return 9; if (h < 34) return 7; if (h < 37) return 3; if (h < 40) return 2; return 0; }
function crusadeCrcl(c) { if (c <= 15) return 39; if (c <= 30) return 35; if (c <= 60) return 28; if (c <= 90) return 17; if (c <= 120) return 7; return 0; }
function crusadeHr(h) { if (h <= 70) return 0; if (h <= 80) return 1; if (h <= 90) return 3; if (h <= 100) return 6; if (h <= 110) return 8; if (h <= 120) return 10; return 11; }
function crusadeSbp(s) { if (s <= 90) return 10; if (s <= 100) return 8; if (s <= 120) return 5; if (s <= 180) return 1; if (s <= 200) return 3; return 5; }

export function crusade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hct = pos(o.hct, 70);
  const crcl = pos(o.crcl, 300);
  const hr = pos(o.hr, 300);
  const sbp = pos(o.sbp, 320);
  const sex = o.sex === 'female' || o.sex === 'male' ? o.sex : '';
  const missing = [];
  if (hct === null) missing.push('baseline hematocrit (%)');
  if (crcl === null) missing.push('creatinine clearance (mL/min)');
  if (hr === null) missing.push('heart rate (bpm)');
  if (sbp === null) missing.push('systolic blood pressure (mmHg)');
  if (!sex) missing.push('sex');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const chf = truthy(o.chf);
  const vasc = truthy(o.vasc);
  const dm = truthy(o.dm);
  const parts = [
    ['hematocrit', crusadeHct(hct)],
    ['creatinine clearance', crusadeCrcl(crcl)],
    ['heart rate', crusadeHr(hr)],
    ['female sex', sex === 'female' ? 8 : 0],
    ['signs of heart failure', chf ? 7 : 0],
    ['prior vascular disease', vasc ? 6 : 0],
    ['diabetes', dm ? 6 : 0],
    ['systolic BP', crusadeSbp(sbp)],
  ];
  const score = parts.reduce((s, p) => s + p[1], 0);
  let band; let rate; let label;
  if (score <= 20) { label = 'very low'; rate = '3.1%'; }
  else if (score <= 30) { label = 'low'; rate = '5.5%'; }
  else if (score <= 40) { label = 'moderate'; rate = '8.5%'; }
  else if (score <= 50) { label = 'high'; rate = '11.9%'; }
  else { label = 'very high'; rate = '19.5%'; }
  band = `CRUSADE ${score} — ${label} bleeding risk (in-hospital major bleeding ~${rate}).`;
  const drivers = parts.filter((p) => p[1] > 0).map((p) => `${p[0]} +${p[1]}`);
  return {
    valid: true,
    score,
    abnormal: score > 40,
    bandLabel: `CRUSADE ${score} — ${label}`,
    band,
    detail: `Contributors: ${drivers.length ? drivers.join(', ') : 'none'}. The systolic-BP term is U-shaped — both ≤ 90 and ≥ 181 mmHg add points.`,
    note: CRUSADE_NOTE,
  };
}

// --- 2.2 SCAI SHOCK stage ---------------------------------------------------
const SCAI_NOTE = 'SCAI SHOCK cardiogenic-shock stage (Naidu SS, et al, JSCAI 2022;1(1):100008; operationalized by Kadosh BS / Kapur NK, et al, JACC 2022;80(3):185-198). Stage A (at risk) → E (extremis) from hypotension, hypoperfusion (lactate), and the level of vasoactive/mechanical support, with a cardiac-arrest modifier. In-hospital mortality rises A→E (Jentzer 2019 Mayo CICU: 3.0/7.1/12.4/40.4/67.0%). A shared severity vocabulary, not an order; the consensus is prototypical and the computed stage follows the cited operationalization.';
const SCAI_MORT = { A: '3.0%', B: '7.1%', C: '12.4%', D: '40.4%', E: '67.0%' };
const SCAI_NAME = { A: 'A (at risk)', B: 'B (beginning)', C: 'C (classic)', D: 'D (deteriorating)', E: 'E (extremis)' };
const SCAI_SUPPORT = new Set(['none', 'one', 'multiple', 'maximal']);

export function scaiShock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sbp = pos(o.sbp, 320);
  const lactate = nonNeg(o.lactate, 40);
  const support = SCAI_SUPPORT.has(o.support) ? o.support : '';
  const missing = [];
  if (sbp === null) missing.push('systolic blood pressure (mmHg)');
  if (lactate === null) missing.push('serum lactate (mmol/L)');
  if (!support) missing.push('level of vasoactive / mechanical support');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const arrest = truthy(o.arrest);
  const persist = truthy(o.persist);
  const severeBP = sbp < 60;
  const hypotension = sbp >= 60 && sbp < 90;
  const hypoperfusion = lactate >= 2 && lactate < 5;
  const severeHypoperf = lactate >= 5 && lactate <= 10;
  const extremeLactate = lactate > 10;
  let stage; let driver;
  if (arrest || severeBP || extremeLactate || support === 'maximal') {
    stage = 'E';
    driver = arrest ? 'cardiac arrest / circulatory collapse' : severeBP ? 'SBP < 60 mmHg' : extremeLactate ? 'lactate > 10 mmol/L' : 'maximal / refractory support';
  } else if ((hypotension && severeHypoperf) || support === 'multiple' || (support === 'one' && persist)) {
    stage = 'D';
    driver = support === 'multiple' ? 'escalating (≥ 2) support' : (hypotension && severeHypoperf) ? 'hypotension with lactate 5–10 mmol/L' : 'not stabilizing on initial support';
  } else if ((hypotension && hypoperfusion) || support === 'one') {
    stage = 'C';
    driver = support === 'one' ? 'one vasoactive/mechanical intervention' : 'hypotension with hypoperfusion (lactate ≥ 2)';
  } else if ((hypotension || hypoperfusion) && support === 'none') {
    stage = 'B';
    driver = hypotension ? 'hypotension without hypoperfusion' : 'hypoperfusion without hypotension';
  } else {
    stage = 'A';
    driver = 'at risk — no hypotension, hypoperfusion, or support';
  }
  return {
    valid: true,
    stage,
    abnormal: stage === 'C' || stage === 'D' || stage === 'E',
    bandLabel: `SCAI ${SCAI_NAME[stage]}`,
    band: `SCAI stage ${SCAI_NAME[stage]} — associated in-hospital mortality signal ~${SCAI_MORT[stage]} (Mayo CICU).`,
    detail: `Driven by: ${driver}. Shared severity vocabulary — the consensus is prototypical; this stage follows the cited operationalization, not an order.`,
    note: SCAI_NOTE,
  };
}

// --- 2.3 Zwolle primary-PCI -------------------------------------------------
const ZWOLLE_NOTE = 'Zwolle primary-PCI risk score (De Luca G, et al, Circulation 2004;109(22):2737-2743). Killip class, post-PCI TIMI flow, age ≥ 60, three-vessel disease, anterior infarction, and ischemic time > 4 h sum to 0–16; a score ≤ 3 identifies a low-risk candidate for early discharge (30-day mortality ~0.1–0.2%). A risk stratification, not a discharge order.';
const ZWOLLE_KILLIP = { 1: 0, 2: 4, '3-4': 9 };
const ZWOLLE_TIMI = { 3: 0, 2: 1, '0-1': 2 };

export function zwollePci(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const killip = Object.prototype.hasOwnProperty.call(ZWOLLE_KILLIP, String(o.killip)) ? String(o.killip) : '';
  const timi = Object.prototype.hasOwnProperty.call(ZWOLLE_TIMI, String(o.timi)) ? String(o.timi) : '';
  const age = pos(o.age, 130);
  const missing = [];
  if (!killip) missing.push('Killip class');
  if (!timi) missing.push('post-PCI TIMI flow');
  if (age === null) missing.push('age (years)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const threeVessel = truthy(o.threeVessel);
  const anterior = truthy(o.anterior);
  const longIschemia = truthy(o.longIschemia);
  const parts = [
    [`Killip ${killip === '3-4' ? 'III–IV' : killip}`, ZWOLLE_KILLIP[killip]],
    [`TIMI flow ${timi}`, ZWOLLE_TIMI[timi]],
    ['age ≥ 60', age >= 60 ? 2 : 0],
    ['three-vessel disease', threeVessel ? 1 : 0],
    ['anterior infarction', anterior ? 1 : 0],
    ['ischemic time > 4 h', longIschemia ? 1 : 0],
  ];
  const score = parts.reduce((s, p) => s + p[1], 0);
  let label;
  if (score <= 3) label = 'low';
  else if (score <= 6) label = 'intermediate';
  else label = 'high';
  const band = score <= 3
    ? `Zwolle ${score} — low risk (candidate for early discharge; 30-day mortality ~0.1–0.2%).`
    : `Zwolle ${score} — ${label} risk.`;
  const drivers = parts.filter((p) => p[1] > 0).map((p) => `${p[0]} +${p[1]}`);
  return {
    valid: true,
    score,
    abnormal: score >= 4,
    bandLabel: `Zwolle ${score} — ${label}`,
    band,
    detail: `Contributors: ${drivers.length ? drivers.join(', ') : 'none'}.`,
    note: ZWOLLE_NOTE,
  };
}

// --- 2.4 TIMI Risk Index ----------------------------------------------------
const TRI_NOTE = 'TIMI Risk Index (Wiviott SD, et al, JACC 2006;47(8):1553-1558; derivation Morrow DA, et al, Lancet 2001;358(9293):1571-1575). TRI = heart rate × (age / 10)² / systolic BP. A higher index marks higher mortality; the published quintiles span roughly 5% to 26% long-term mortality across increasing index. A risk stratification, not an order.';

export function timiRiskIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hr = pos(o.hr, 300);
  const age = pos(o.age, 130);
  const sbp = pos(o.sbp, 320);
  const missing = [];
  if (hr === null) missing.push('heart rate (bpm)');
  if (age === null) missing.push('age (years)');
  if (sbp === null) missing.push('systolic blood pressure (mmHg)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const value = r1(num('TRI', (hr * Math.pow(age / 10, 2)) / sbp, { min: 0, max: 1000000 }));
  const abnormal = value >= 30;
  let band;
  if (value >= 30) band = `TIMI Risk Index ${value} — in the highest mortality-risk group (published top quintile ~20–26%).`;
  else if (value >= 20) band = `TIMI Risk Index ${value} — a higher-risk index.`;
  else band = `TIMI Risk Index ${value} — a lower-risk index.`;
  return {
    valid: true,
    value,
    abnormal,
    bandLabel: `TRI ${value}`,
    band,
    detail: `HR ${r1(hr)} × (age ${r1(age)} / 10)² ÷ SBP ${r1(sbp)}. Higher index → higher 30-day / long-term mortality.`,
    note: TRI_NOTE,
  };
}

// --- 2.5 CADILLAC -----------------------------------------------------------
const CADILLAC_NOTE = 'CADILLAC post-PCI mortality risk score (Halkin A, et al, JACC 2005;45(9):1397-1405). Baseline LVEF < 40% (4), renal insufficiency / CrCl < 60 mL/min (3), Killip class 2–3 (3), post-PCI TIMI flow 0–2 (2), age > 65 (2), anemia (2), and three-vessel disease (2) sum to 0–18; low 0–2, intermediate 3–5, high ≥ 6, with rising 30-day / 1-year mortality. A risk stratification, not an order.';
const CAD_TIMI = new Set(['3', '0-2']);

export function cadillacRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lvef = pos(o.lvef, 90);
  const crcl = pos(o.crcl, 300);
  const age = pos(o.age, 130);
  const killip = o.killip === '1' || o.killip === '2-3' ? o.killip : '';
  const timi = CAD_TIMI.has(String(o.timi)) ? String(o.timi) : '';
  const missing = [];
  if (lvef === null) missing.push('LVEF (%)');
  if (crcl === null) missing.push('creatinine clearance (mL/min)');
  if (age === null) missing.push('age (years)');
  if (!killip) missing.push('Killip class');
  if (!timi) missing.push('post-PCI TIMI flow');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const anemia = truthy(o.anemia);
  const threeVessel = truthy(o.threeVessel);
  const parts = [
    ['LVEF < 40%', lvef < 40 ? 4 : 0],
    ['CrCl < 60', crcl < 60 ? 3 : 0],
    ['Killip 2–3', killip === '2-3' ? 3 : 0],
    ['post-PCI TIMI 0–2', timi === '0-2' ? 2 : 0],
    ['age > 65', age > 65 ? 2 : 0],
    ['anemia', anemia ? 2 : 0],
    ['three-vessel disease', threeVessel ? 2 : 0],
  ];
  const score = parts.reduce((s, p) => s + p[1], 0);
  let label; let mort;
  if (score <= 2) { label = 'low'; mort = '< 1% at 1 year'; }
  else if (score <= 5) { label = 'intermediate'; mort = '~4–4.5% at 1 year'; }
  else { label = 'high'; mort = '> 12% at 1 year'; }
  const drivers = parts.filter((p) => p[1] > 0).map((p) => `${p[0]} +${p[1]}`);
  return {
    valid: true,
    score,
    abnormal: score >= 6,
    bandLabel: `CADILLAC ${score} — ${label}`,
    band: `CADILLAC ${score} — ${label} risk (${mort}).`,
    detail: `Contributors: ${drivers.length ? drivers.join(', ') : 'none'}. LVEF ${r2(lvef)}%, CrCl ${r1(crcl)} mL/min, age ${r1(age)}.`,
    note: CADILLAC_NOTE,
  };
}
