// spec-v185: eight deterministic, free-to-reproduce calculators that fill
// *confirmed* gaps in the cardiac/echo hemodynamics, anticoagulation, metabolic,
// and dosing-weight surfaces. Every id was verified absent by a direct scan of
// app.js before this module was written (spec-v85 §6.2 collision check). None
// duplicates a live tile; v185 runs no AI and makes no runtime network call.
//
//   fickCardiacOutput - cardiac output / index by the Fick principle
//   gorlin            - Gorlin valve-area equation (aortic / mitral)
//   qpQs              - pulmonary-to-systemic flow ratio (shunt)
//   lvotStrokeVolume  - Doppler stroke volume & cardiac output (LVOT-VTI)
//   vteBleed          - VTE-BLEED bleeding-risk score on stable anticoagulation
//   matsudaIndex      - Matsuda whole-body insulin-sensitivity index (OGTT)
//   rosendaalTtr      - time-in-therapeutic-range (Rosendaal interpolation)
//   leanBodyWeight    - lean body weight (Janmahasatian)
//
// Per the spec-v100 §2 doctrine each is a closed-form arithmetic compute or a
// validated point score with published interpretation bands. Citations live
// inline in lib/meta.js; the renderers in views/group-v185.js render the
// spec-v50 §3 posture note and defer the management decision to the clinician
// (spec-v11 §5.3) — no order in Sophie's voice.
//
// FORMULAS / CONSTANTS / SEVERITY PARTITIONS RE-FETCHED, NEVER RECALLED
// (spec-v97), each cross-verified across >= 2 independent sources at
// implementation:
//   - fickCardiacOutput (Fick 1870; est. VO2 LaFarge CG, Miettinen OS, Cardiovasc
//     Res 1970;4(1):23-30): CO(L/min) = VO2(mL/min) / [1.36 · Hb(g/dL) ·
//     (SaO2 − SvO2) · 10]; O2 capacity 1.36 mL O2/g Hb. LaFarge indexed VO2
//     (mL/min/m2): male 138.1 − 11.49·ln(age) + 0.378·HR; female 138.1 −
//     17.04·ln(age) + 0.378·HR; total VO2 = indexed · BSA. Cardiac index normal
//     2.5-4.0 L/min/m2.
//   - gorlin (Gorlin R, Gorlin SG, Am Heart J 1951;41(1):1-29): valve area(cm2) =
//     flow / (K · √mean gradient), flow(mL/s) = CO(mL/min) / (period(s) · HR);
//     K = 44.3 with the systolic ejection period (aortic), 37.7 with the
//     diastolic filling period (mitral). Stenosis bands (cm2): severe < 1.0,
//     moderate 1.0-1.5, mild > 1.5.
//   - qpQs (Wilkinson JL, Heart 2001;85(1):113-120): Qp/Qs = (SaO2 − MvO2) /
//     (PvO2 − PaO2). ≈ 1 no net shunt; > 1 net left-to-right (small 1.1-1.5,
//     moderate 1.5-2.0, large > 2.0 often prompting closure); < 1 net
//     right-to-left.
//   - lvotStrokeVolume (Lang RM, et al [ASE/EACVI], J Am Soc Echocardiogr
//     2015;28(1):1-39): LVOT area = π·(D/2)2; SV = area · VTI; CO = SV · HR /
//     1000; SVI = SV / BSA (normal 35-47 mL/m2); CI = CO / BSA.
//   - vteBleed (Klok FA, et al, Eur Respir J 2016;48(5):1369-1376): active
//     cancer 2, male with uncontrolled hypertension 1, anemia 1.5, history of
//     bleeding 1.5, age ≥ 60 1.5, renal dysfunction (CrCl 30-60) 1.5; ≥ 2 =
//     elevated bleeding risk on stable anticoagulation.
//   - matsudaIndex (Matsuda M, DeFronzo RA, Diabetes Care 1999;22(9):1462-1470):
//     ISI = 10000 / √(G0 · I0 · Gmean · Imean), glucose mg/dL, insulin µU/mL;
//     lower = more insulin resistant (a value below ~2.5 is commonly read as
//     insulin resistance, population-dependent).
//   - rosendaalTtr (Rosendaal FR, et al, Thromb Haemost 1993;69(3):236-239):
//     linear interpolation assigns an INR to each day between measurements; TTR =
//     days-in-range / total-days. Good control commonly ≥ 65%.
//   - leanBodyWeight (Janmahasatian S, et al, Clin Pharmacokinet
//     2005;44(10):1051-1065): LBW = 9270·TBW / (6680 + 216·BMI) for men,
//     9270·TBW / (8780 + 244·BMI) for women; BMI = TBW(kg) / height(m)2.

import { num, r1, r2 } from './num.js';

// Read one positive measurement: '' / null / undefined / non-finite or <= 0
// (or > max when given) -> null, so the caller surfaces a complete-the-fields
// fallback rather than NaN / Infinity.
function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}

// A percentage 0 < p <= 100 (saturations); null otherwise.
function pct(v) { return pos(v, 100); }

const SEX = { male: 'male', female: 'female' };
function sexOf(v) { return typeof v === 'string' && SEX[v] ? v : ''; }

// --- 2.1 Fick cardiac output ------------------------------------------------
const O2_CAP = 1.36; // mL O2 per g Hb (Hüfner clinical value)
const FICK_NOTE = 'Cardiac output by the Fick principle (Fick 1870; estimated VO2: LaFarge & Miettinen, Cardiovasc Res 1970;4(1):23-30). CO (L/min) = VO2 (mL/min) / [1.36 · Hb (g/dL) · (SaO2 − SvO2) · 10]; cardiac index = CO / BSA (normal 2.5–4.0 L/min/m²). The LaFarge assumed VO2 (mL/min/m²) is male 138.1 − 11.49·ln(age) + 0.378·HR, female 138.1 − 17.04·ln(age) + 0.378·HR, times BSA — an estimate that can err materially, so a measured VO2 is preferred when available.';
const FICK_METHOD = { measured: 'measured', estimated: 'estimated' };

export function fickCardiacOutput(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const method = typeof o.method === 'string' && FICK_METHOD[o.method] ? o.method : 'measured';
  const hb = pos(o.hb, 25);
  const sao2 = pct(o.sao2);
  const svo2 = pct(o.svo2);
  const bsa = pos(o.bsa, 4);
  const missing = [];
  if (hb === null) missing.push('hemoglobin (g/dL)');
  if (sao2 === null) missing.push('arterial O₂ saturation SaO₂ (%)');
  if (svo2 === null) missing.push('mixed-venous O₂ saturation SvO₂ (%)');
  if (bsa === null) missing.push('BSA (m²)');
  let vo2;
  let vo2Source;
  if (method === 'estimated') {
    const age = pos(o.age, 120);
    const hr = pos(o.hr, 300);
    const sex = sexOf(o.sex);
    if (age === null) missing.push('age (years)');
    if (hr === null) missing.push('heart rate (bpm)');
    if (!sex) missing.push('sex');
    if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
    const slope = sex === 'male' ? 11.49 : 17.04;
    const vo2i = 138.1 - slope * Math.log(age) + 0.378 * hr;
    vo2 = vo2i * bsa;
    if (!(vo2 > 0)) return { valid: false, message: 'The estimated VO₂ is non-physiologic for these inputs; enter a measured VO₂ instead.' };
    vo2Source = `LaFarge estimate ${r1(vo2)} mL/min (${r1(vo2i)} mL/min/m² × BSA)`;
  } else {
    vo2 = pos(o.vo2, 2000);
    if (vo2 === null) missing.push('oxygen consumption VO₂ (mL/min)');
    if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
    vo2Source = `measured VO₂ ${r1(vo2)} mL/min`;
  }
  if (sao2 <= svo2) {
    return { valid: false, message: 'SaO₂ must exceed SvO₂ (arterial blood carries more oxygen than mixed-venous).' };
  }
  const avDiff = O2_CAP * hb * ((sao2 - svo2) / 100); // mL O2 per dL
  const co = num('cardiac output', vo2 / (avDiff * 10), { min: 0, max: 30 });
  const ci = num('cardiac index', co / bsa, { min: 0, max: 20 });
  const coR = r2(co);
  const ciR = r2(ci);
  let band; let abnormal;
  if (ci < 2.5) { band = 'low cardiac index'; abnormal = true; }
  else if (ci <= 4.0) { band = 'normal cardiac index'; abnormal = false; }
  else { band = 'high cardiac index'; abnormal = true; }
  return {
    valid: true,
    co: coR,
    ci: ciR,
    avDiff: r2(avDiff),
    abnormal,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    band: `Cardiac output ${coR} L/min; cardiac index ${ciR} L/min/m² — ${band}.`,
    detail: `Arteriovenous O₂ difference ${r2(avDiff)} mL/dL from ${vo2Source}. Cardiac index normal 2.5–4.0 L/min/m².`,
    note: FICK_NOTE,
  };
}

// --- 2.2 Gorlin valve area --------------------------------------------------
const GORLIN_NOTE = 'Gorlin valve-area equation (Gorlin R, Gorlin SG, Am Heart J 1951;41(1):1-29). Valve area (cm²) = flow / (K · √mean gradient), where flow (mL/s) = cardiac output (mL/min) / (filling/ejection period (s) · heart rate). K = 44.3 with the systolic ejection period for the aortic valve, 37.7 with the diastolic filling period for the mitral valve. Stenosis severity (cm²): severe < 1.0, moderate 1.0–1.5, mild > 1.5.';
const GORLIN_VALVE = { aortic: { k: 44.3, period: 'systolic ejection period' }, mitral: { k: 37.7, period: 'diastolic filling period' } };

export function gorlin(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const valve = typeof o.valve === 'string' && GORLIN_VALVE[o.valve] ? o.valve : '';
  const co = pos(o.co, 20); // L/min
  const hr = pos(o.hr, 300);
  const period = pos(o.period, 1); // seconds per beat
  const grad = pos(o.grad, 200); // mmHg
  const missing = [];
  if (!valve) missing.push('valve (aortic / mitral)');
  if (co === null) missing.push('cardiac output (L/min)');
  if (hr === null) missing.push('heart rate (bpm)');
  if (period === null) missing.push('ejection/filling period (s per beat)');
  if (grad === null) missing.push('mean pressure gradient (mmHg)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const { k, period: periodName } = GORLIN_VALVE[valve];
  const flow = num('flow', (co * 1000) / (period * hr), { min: 0, max: 5000 }); // mL/s
  const area = num('valve area', flow / (k * Math.sqrt(grad)), { min: 0, max: 20 });
  const areaR = r2(area);
  const flowR = r1(flow);
  let band; let abnormal;
  if (area < 1.0) { band = `severe ${valve} stenosis`; abnormal = true; }
  else if (area <= 1.5) { band = `moderate ${valve} stenosis`; abnormal = true; }
  else { band = `mild / non-critical ${valve} stenosis`; abnormal = false; }
  return {
    valid: true,
    area: areaR,
    flow: flowR,
    k,
    abnormal,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    band: `Valve area ${areaR} cm² — ${band} (flow ${flowR} mL/s).`,
    detail: `${valve === 'aortic' ? 'Aortic' : 'Mitral'} constant K = ${k} over the ${periodName}. Severity (cm²): severe < 1.0, moderate 1.0–1.5, mild > 1.5.`,
    note: GORLIN_NOTE,
  };
}

// --- 2.3 Qp/Qs shunt ratio --------------------------------------------------
const QPQS_NOTE = 'Pulmonary-to-systemic flow ratio (Wilkinson JL, Heart 2001;85(1):113-120). Qp/Qs = (SaO₂ − MvO₂) / (PvO₂ − PaO₂): systemic-arterial minus mixed-venous saturation over pulmonary-vein minus pulmonary-artery saturation. ≈ 1 no net shunt; > 1 net left-to-right (small 1.1–1.5, moderate 1.5–2.0, large > 2.0, at which closure is often considered); < 1 net right-to-left.';

export function qpQs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sao2 = pct(o.sao2);
  const mvo2 = pct(o.mvo2);
  const pvo2 = o.pvo2 === '' || o.pvo2 === null || o.pvo2 === undefined ? 98 : pct(o.pvo2);
  const pao2 = pct(o.pao2);
  const missing = [];
  if (sao2 === null) missing.push('systemic-arterial (aortic) SaO₂ (%)');
  if (mvo2 === null) missing.push('mixed-venous MvO₂ (%)');
  if (pvo2 === null) missing.push('pulmonary-vein PvO₂ (%)');
  if (pao2 === null) missing.push('pulmonary-artery PaO₂ (%)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const denom = pvo2 - pao2;
  if (denom === 0) {
    return { valid: false, message: 'The pulmonary-vein and pulmonary-artery saturations are equal; the transpulmonary difference is zero, so Qp/Qs is undefined.' };
  }
  const ratio = num('Qp/Qs', (sao2 - mvo2) / denom, { min: -50, max: 50 });
  const ratioR = r2(ratio);
  let band; let abnormal;
  if (ratio < 0) { band = 'net right-to-left shunt (reversed transpulmonary gradient)'; abnormal = true; }
  else if (ratio < 0.9) { band = 'net right-to-left shunt'; abnormal = true; }
  else if (ratio <= 1.1) { band = 'no significant net shunt'; abnormal = false; }
  else if (ratio <= 1.5) { band = 'small left-to-right shunt'; abnormal = true; }
  else if (ratio <= 2.0) { band = 'moderate left-to-right shunt'; abnormal = true; }
  else { band = 'large left-to-right shunt'; abnormal = true; }
  return {
    valid: true,
    ratio: ratioR,
    abnormal,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    band: `Qp/Qs ${ratioR} — ${band}.`,
    detail: '≈ 1 no net shunt; small 1.1–1.5, moderate 1.5–2.0, large > 2.0 (closure often considered); < 1 net right-to-left.',
    note: QPQS_NOTE,
  };
}

// --- 2.4 LVOT stroke volume & cardiac output --------------------------------
const LVOT_NOTE = 'Doppler stroke volume & cardiac output (Lang RM, et al [ASE/EACVI], J Am Soc Echocardiogr 2015;28(1):1-39). LVOT cross-sectional area = π·(diameter/2)²; stroke volume SV = area · LVOT VTI; cardiac output CO = SV · heart rate / 1000; stroke-volume index SVI = SV / BSA (normal 35–47 mL/m²); cardiac index CI = CO / BSA (normal 2.5–4.0 L/min/m²).';

export function lvotStrokeVolume(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const d = pos(o.d, 5); // cm
  const vti = pos(o.vti, 60); // cm
  const hr = pos(o.hr, 300);
  const bsa = pos(o.bsa, 4);
  const missing = [];
  if (d === null) missing.push('LVOT diameter (cm)');
  if (vti === null) missing.push('LVOT VTI (cm)');
  if (hr === null) missing.push('heart rate (bpm)');
  if (bsa === null) missing.push('BSA (m²)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const area = Math.PI * (d / 2) ** 2;
  const sv = num('stroke volume', area * vti, { min: 0, max: 500 });
  const co = num('cardiac output', (sv * hr) / 1000, { min: 0, max: 30 });
  const svi = num('SVI', sv / bsa, { min: 0, max: 300 });
  const ci = num('CI', co / bsa, { min: 0, max: 20 });
  const svR = r1(sv);
  const coR = r2(co);
  const sviR = r1(svi);
  const ciR = r2(ci);
  let band; let abnormal;
  if (svi < 35) { band = 'low stroke-volume index'; abnormal = true; }
  else if (svi <= 47) { band = 'normal stroke-volume index'; abnormal = false; }
  else { band = 'high stroke-volume index'; abnormal = true; }
  return {
    valid: true,
    area: r2(area),
    sv: svR,
    co: coR,
    svi: sviR,
    ci: ciR,
    abnormal,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    band: `Stroke volume ${svR} mL; cardiac output ${coR} L/min; CI ${ciR} L/min/m² — ${band}.`,
    detail: `LVOT area ${r2(area)} cm²; SVI ${sviR} mL/m² (normal 35–47); CI normal 2.5–4.0 L/min/m².`,
    note: LVOT_NOTE,
  };
}

// --- 2.5 VTE-BLEED ----------------------------------------------------------
const VTE_BLEED_NOTE = 'VTE-BLEED score (Klok FA, et al, Eur Respir J 2016;48(5):1369-1376) — bleeding risk on stable anticoagulation for venous thromboembolism. Points: active cancer 2, male with uncontrolled arterial hypertension 1, anemia 1.5, history of bleeding 1.5, age ≥ 60 years 1.5, renal dysfunction (CrCl 30–60 mL/min) 1.5. A total ≥ 2 marks elevated bleeding risk; it is weighed against recurrence risk and does not by itself stop anticoagulation.';
const VTE_BLEED_ITEMS = [
  { key: 'cancer', points: 2, label: 'Active cancer' },
  { key: 'maleHtn', points: 1, label: 'Male with uncontrolled hypertension' },
  { key: 'anemia', points: 1.5, label: 'Anemia' },
  { key: 'bleeding', points: 1.5, label: 'History of bleeding' },
  { key: 'age60', points: 1.5, label: 'Age ≥ 60 years' },
  { key: 'renal', points: 1.5, label: 'Renal dysfunction (CrCl 30–60)' },
];
function truthy(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on' || v === 'yes'; }

export function vteBleed(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let score = 0;
  const present = [];
  for (const it of VTE_BLEED_ITEMS) {
    if (truthy(o[it.key])) { score += it.points; present.push(it.label); }
  }
  score = r1(num('VTE-BLEED', score, { min: 0, max: 9 }));
  const elevated = score >= 2;
  return {
    valid: true,
    score,
    abnormal: elevated,
    bandLabel: elevated ? 'Elevated bleeding risk' : 'Not elevated',
    band: `VTE-BLEED ${score} — ${elevated ? 'elevated bleeding risk (≥ 2)' : 'not elevated (< 2)'}.`,
    detail: present.length ? `Contributing: ${present.join(', ')}.` : 'No risk factors selected.',
    note: VTE_BLEED_NOTE,
  };
}

// --- 2.6 Matsuda insulin-sensitivity index ----------------------------------
const MATSUDA_NOTE = 'Matsuda whole-body insulin-sensitivity index from the OGTT (Matsuda M, DeFronzo RA, Diabetes Care 1999;22(9):1462-1470). ISI = 10000 / √(fasting glucose · fasting insulin · mean OGTT glucose · mean OGTT insulin), glucose in mg/dL and insulin in µU/mL. Higher = more insulin sensitive; lower = more resistant. A value below roughly 2.5 is commonly read as insulin resistance, though the cut-off is population-dependent. Complements the fasting-only HOMA-IR / QUICKI.';

export function matsudaIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const g0 = pos(o.g0, 1000); // mg/dL
  const i0 = pos(o.i0, 1000); // µU/mL
  const gMean = pos(o.gMean, 1000);
  const iMean = pos(o.iMean, 1000);
  const missing = [];
  if (g0 === null) missing.push('fasting glucose (mg/dL)');
  if (i0 === null) missing.push('fasting insulin (µU/mL)');
  if (gMean === null) missing.push('mean OGTT glucose (mg/dL)');
  if (iMean === null) missing.push('mean OGTT insulin (µU/mL)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const product = g0 * i0 * gMean * iMean; // guarded > 0 by pos()
  const idx = num('Matsuda index', 10000 / Math.sqrt(product), { min: 0, max: 1000 });
  const idxR = r2(idx);
  const resistant = idx < 2.5;
  return {
    valid: true,
    index: idxR,
    abnormal: resistant,
    bandLabel: resistant ? 'Suggests insulin resistance' : 'Within commonly-referenced sensitive range',
    band: `Matsuda index ${idxR} — ${resistant ? 'suggests insulin resistance' : 'within the commonly-referenced insulin-sensitive range'}.`,
    detail: 'Lower = more insulin resistant; a value below ~2.5 is commonly read as resistance (population-dependent). Complements fasting HOMA-IR / QUICKI.',
    note: MATSUDA_NOTE,
  };
}

// --- 2.7 Rosendaal time in therapeutic range --------------------------------
const TTR_NOTE = 'Time in therapeutic range by the Rosendaal linear-interpolation method (Rosendaal FR, et al, Thromb Haemost 1993;69(3):236-239). An INR is assigned to each day between consecutive measurements by linear interpolation; TTR = days-in-range / total-days. Good anticoagulation control is commonly defined as TTR ≥ 65%. Enter one dated INR per line as "YYYY-MM-DD INR"; at least two in-order measurements are required.';
const DAY_MS = 86400000;

// Parse "YYYY-MM-DD <inr>" (or comma/whitespace separated) lines into
// {day, inr}. Non-finite / malformed lines are skipped.
function parseSeries(text) {
  if (typeof text !== 'string') return [];
  const rows = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(\d{4})-(\d{2})-(\d{2})[\s,]+([0-9]*\.?[0-9]+)$/);
    if (!m) continue;
    const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const inr = Number(m[4]);
    if (!Number.isFinite(t) || !Number.isFinite(inr) || inr <= 0) continue;
    rows.push({ day: t / DAY_MS, inr });
  }
  return rows;
}

export function rosendaalTtr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const low = pos(o.low, 10) ?? 2.0;
  const high = pos(o.high, 15) ?? 3.0;
  if (!(high > low)) {
    return { valid: false, message: 'The target range is invalid; the upper INR must exceed the lower.' };
  }
  const rows = parseSeries(o.series).sort((a, b) => a.day - b.day);
  if (rows.length < 2) {
    return { valid: false, message: 'Enter at least two dated INR values, one per line as "YYYY-MM-DD INR".' };
  }
  let inRange = 0; let below = 0; let above = 0; let total = 0;
  for (let i = 0; i < rows.length - 1; i += 1) {
    const a = rows[i];
    const b = rows[i + 1];
    const span = Math.round(b.day - a.day);
    if (span <= 0) continue; // same-day or out-of-order duplicate
    for (let j = 1; j <= span; j += 1) {
      const inr = a.inr + (b.inr - a.inr) * (j / span);
      if (inr < low) below += 1;
      else if (inr > high) above += 1;
      else inRange += 1;
      total += 1;
    }
  }
  if (total <= 0) {
    return { valid: false, message: 'The measurements span zero days; enter values on at least two different dates.' };
  }
  const ttr = r1(num('TTR', (inRange / total) * 100, { min: 0, max: 100 }));
  const lowR = r1(low);
  const highR = r1(high);
  const good = ttr >= 65;
  return {
    valid: true,
    ttr,
    inRange,
    below,
    above,
    total,
    abnormal: !good,
    bandLabel: good ? 'Good control (≥ 65%)' : 'Below good-control threshold',
    band: `TTR ${ttr}% — ${inRange} of ${total} days in range ${lowR}–${highR}${good ? '' : ' (below the ≥ 65% good-control mark)'}.`,
    detail: `${below} day(s) below range, ${above} day(s) above. Good anticoagulation control is commonly ≥ 65%.`,
    note: TTR_NOTE,
  };
}

// --- 2.8 Lean body weight (Janmahasatian) -----------------------------------
const LBW_NOTE = 'Lean body weight (Janmahasatian S, et al, Clin Pharmacokinet 2005;44(10):1051-1065). LBW (kg) = 9270·TBW / (6680 + 216·BMI) for men, 9270·TBW / (8780 + 244·BMI) for women, with BMI = total body weight (kg) / height (m)². Many anesthetic induction agents are dosed to lean body weight rather than total body weight; contrast with ideal and adjusted body weight.';

export function leanBodyWeight(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = sexOf(o.sex);
  const weight = pos(o.weight, 400); // kg
  const heightCm = pos(o.height, 260); // cm
  const missing = [];
  if (!sex) missing.push('sex');
  if (weight === null) missing.push('total body weight (kg)');
  if (heightCm === null) missing.push('height (cm)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const hM = heightCm / 100;
  const bmi = num('BMI', weight / (hM * hM), { min: 0, max: 200 });
  const denom = sex === 'male' ? 6680 + 216 * bmi : 8780 + 244 * bmi;
  const lbw = num('lean body weight', (9270 * weight) / denom, { min: 0, max: 400 });
  const lbwR = r1(lbw);
  const bmiR = r1(bmi);
  const pctTbw = r1(num('LBW % of TBW', (lbw / weight) * 100, { min: 0, max: 100 }));
  return {
    valid: true,
    lbw: lbwR,
    bmi: bmiR,
    pctTbw,
    abnormal: false,
    bandLabel: 'Lean body weight',
    band: `Lean body weight ${lbwR} kg (BMI ${bmiR}) — ${pctTbw}% of total body weight.`,
    detail: `${sex === 'male' ? 'Male' : 'Female'} Janmahasatian equation. Many anesthetic induction agents dose to lean body weight; contrast with ideal and adjusted body weight.`,
    note: LBW_NOTE,
  };
}
