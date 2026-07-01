// spec-v186: six deterministic, free-to-reproduce specialty computations filling
// genuine gaps in radiation oncology, quantitative valve regurgitation, LV
// mechanics, diffusing capacity, exercise physiology, and evidence-based-medicine
// statistics. Every id was verified absent by a direct scan of app.js first
// (spec-v85 §6.2). None duplicates a live tile; v186 runs no AI and makes no
// runtime network call.
//
//   bedEqd2         - radiotherapy biologically effective dose & EQD2 (LQ model)
//   pisaEroa        - PISA effective regurgitant orifice & regurgitant volume
//   lvWallStress    - LV meridional wall stress (Laplace)
//   dlcoCorrection  - hemoglobin-corrected DLCO (Cotes) & KCO
//   vo2maxExercise  - estimated VO2max & METs (Bruce treadmill / Cooper field)
//   proportionCi    - Wilson-score confidence interval for a proportion
//
// FORMULAS / CONSTANTS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent sources at implementation:
//   - bedEqd2 (Fowler JF, Br J Radiol 1989;62(740):679-694): BED = n·d·(1 +
//     d/(α/β)); EQD2 = BED / (1 + 2/(α/β)). Default α/β 10 (tumor / early), 3
//     (late-responding normal tissue).
//   - pisaEroa (Zoghbi WA, et al [ASE], J Am Soc Echocardiogr 2017;30(4):303-371):
//     flow rate = 2π·r²·Va; EROA = flow / peak Vreg; regurgitant volume = EROA ·
//     VTIreg. Mitral-regurgitation severity: EROA severe ≥ 0.40 cm², moderate
//     0.20-0.39, mild < 0.20; regurgitant volume severe ≥ 60 mL.
//   - lvWallStress (Grossman W, et al, J Clin Invest 1975;56(1):56-64; Laplace):
//     meridional wall stress σ = P·r / (2·h); with 1 mmHg = 1.36 g/cm², σ (g/cm²)
//     = 1.36·P·r/(2·h) and σ (10³ dyn/cm²) = 1.33322·P·r/(2·h). P mmHg, r and h cm.
//   - dlcoCorrection (Cotes; ATS/ERS: Macintyre N, et al, Eur Respir J
//     2005;26(4):720-735): Hb-adjusted DLCO = observed·(10.22 + Hb)/(1.7·Hb) for
//     males ≥ 15 y, observed·(9.38 + Hb)/(1.7·Hb) for females / children < 15 y;
//     KCO = DLCO / VA.
//   - vo2maxExercise (Bruce RA, et al, Am Heart J 1973;85(4):546-562; Cooper KH,
//     JAMA 1968;203(3):201-204): Bruce men VO2max = 14.76 − 1.379·T + 0.451·T² −
//     0.012·T³ (T min); Bruce women VO2max = 4.38·T − 3.9; Cooper VO2max =
//     (distance_m − 504.9) / 44.73; METs = VO2max / 3.5.
//   - proportionCi (Wilson EB, J Am Stat Assoc 1927;22(158):209-212): p̂ = x/n;
//     Wilson center = (p̂ + z²/2n)/(1 + z²/n); half-width = (z/(1 + z²/n))·
//     √(p̂(1−p̂)/n + z²/4n²); clamped to [0, 1]. z: 90% 1.6449, 95% 1.9600,
//     99% 2.5758.

import { num, r1, r2 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
// A non-negative integer (>= 0); null otherwise.
function nonNegInt(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max || !Number.isInteger(n)) return null;
  return n;
}
const SEX = { male: 'male', female: 'female' };
function sexOf(v) { return typeof v === 'string' && SEX[v] ? v : ''; }

// --- 2.1 BED / EQD2 ---------------------------------------------------------
const BED_NOTE = 'Radiotherapy biologically effective dose & EQD2 (Fowler JF, Br J Radiol 1989;62(740):679-694; linear-quadratic model). BED = n·d·(1 + d/(α/β)); EQD2 = BED / (1 + 2/(α/β)) — the equivalent dose in 2 Gy fractions. Typical α/β: 10 Gy for tumor / early-responding tissue, 3 Gy for late-responding normal tissue. Compare fractionation schedules on an equal-effect basis; the plan stays with the radiation oncologist and physicist.';

export function bedEqd2(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const n = pos(o.n, 100);
  const d = pos(o.d, 100); // Gy per fraction
  const ab = pos(o.ab, 100); // α/β Gy
  const missing = [];
  if (n === null) missing.push('number of fractions');
  if (d === null) missing.push('dose per fraction (Gy)');
  if (ab === null) missing.push('α/β ratio (Gy)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const total = n * d;
  const bed = num('BED', n * d * (1 + d / ab), { min: 0, max: 10000 });
  const eqd2 = num('EQD2', bed / (1 + 2 / ab), { min: 0, max: 10000 });
  const bedR = r1(bed);
  const eqd2R = r1(eqd2);
  return {
    valid: true,
    bed: bedR,
    eqd2: eqd2R,
    total: r1(total),
    abnormal: false,
    bandLabel: 'Biologically effective dose',
    band: `BED ${bedR} Gy; EQD2 ${eqd2R} Gy (α/β ${r1(ab)}).`,
    detail: `Total physical dose ${r1(total)} Gy in ${r1(n)} fractions of ${r1(d)} Gy. EQD2 is the equal-effect dose delivered in 2 Gy fractions.`,
    note: BED_NOTE,
  };
}

// --- 2.2 PISA EROA & regurgitant volume -------------------------------------
const PISA_NOTE = 'PISA effective regurgitant orifice & regurgitant volume (Zoghbi WA, et al [ASE], J Am Soc Echocardiogr 2017;30(4):303-371). Flow rate = 2π·r²·Va (r = PISA radius cm, Va = aliasing velocity cm/s); EROA = flow rate / peak regurgitant velocity; regurgitant volume = EROA · regurgitant-jet VTI. Mitral-regurgitation severity: EROA severe ≥ 0.40 cm², moderate 0.20–0.39, mild < 0.20 cm²; regurgitant volume severe ≥ 60 mL.';

export function pisaEroa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const r = pos(o.r, 5); // cm
  const va = pos(o.va, 200); // cm/s aliasing velocity
  const vpeak = pos(o.vpeak, 800); // cm/s peak regurgitant velocity
  const vti = pos(o.vti, 300); // cm regurgitant-jet VTI
  const missing = [];
  if (r === null) missing.push('PISA radius (cm)');
  if (va === null) missing.push('aliasing velocity (cm/s)');
  if (vpeak === null) missing.push('peak regurgitant velocity (cm/s)');
  if (vti === null) missing.push('regurgitant-jet VTI (cm)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const flow = 2 * Math.PI * r * r * va; // cm³/s (mL/s)
  const eroa = num('EROA', flow / vpeak, { min: 0, max: 10 }); // cm²
  const rvol = num('regurgitant volume', eroa * vti, { min: 0, max: 500 }); // mL
  const eroaR = r2(eroa);
  const rvolR = r1(rvol);
  let band; let abnormal;
  if (eroa >= 0.40) { band = 'severe regurgitation'; abnormal = true; }
  else if (eroa >= 0.20) { band = 'moderate regurgitation'; abnormal = true; }
  else { band = 'mild regurgitation'; abnormal = false; }
  return {
    valid: true,
    eroa: eroaR,
    rvol: rvolR,
    flow: r1(flow),
    abnormal,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    band: `EROA ${eroaR} cm²; regurgitant volume ${rvolR} mL — ${band}.`,
    detail: `PISA flow rate ${r1(flow)} mL/s. Mitral EROA (cm²): severe ≥ 0.40, moderate 0.20–0.39, mild < 0.20; regurgitant volume severe ≥ 60 mL.`,
    note: PISA_NOTE,
  };
}

// --- 2.3 LV wall stress -----------------------------------------------------
const LVWS_NOTE = 'LV meridional wall stress (Grossman W, et al, J Clin Invest 1975;56(1):56-64; Laplace’s law). σ = P·r / (2·h), where P is LV pressure (mmHg), r the LV internal radius (cm), and h the wall thickness (cm). With 1 mmHg = 1.36 g/cm², σ (g/cm²) = 1.36·P·r/(2·h) and σ (10³ dyn/cm²) = 1.33322·P·r/(2·h). Wall stress relates pressure and cavity size to afterload and the hypertrophy pattern; use the end-systolic pressure for end-systolic wall stress.';

export function lvWallStress(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = pos(o.p, 400); // mmHg
  const r = pos(o.r, 12); // cm internal radius
  const h = pos(o.h, 5); // cm wall thickness
  const missing = [];
  if (p === null) missing.push('LV pressure (mmHg)');
  if (r === null) missing.push('LV internal radius (cm)');
  if (h === null) missing.push('wall thickness (cm)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const base = (p * r) / (2 * h); // mmHg (guarded h > 0)
  const gcm2 = num('wall stress', 1.36 * base, { min: 0, max: 100000 });
  const dyn = num('wall stress', 1.33322 * base, { min: 0, max: 100000 }); // 10³ dyn/cm²
  const gR = r1(gcm2);
  const dynR = r1(dyn);
  return {
    valid: true,
    gcm2: gR,
    dyn: dynR,
    abnormal: false,
    bandLabel: 'LV meridional wall stress',
    band: `LV meridional wall stress ${gR} g/cm² (≈ ${dynR} ×10³ dyn/cm²).`,
    detail: `σ = P·r/(2·h). Higher pressure or a larger cavity relative to wall thickness raises wall stress (afterload); concentric hypertrophy normalizes it. Use the end-systolic pressure for end-systolic wall stress.`,
    note: LVWS_NOTE,
  };
}

// --- 2.4 Hb-corrected DLCO & KCO --------------------------------------------
const DLCO_NOTE = 'Hemoglobin-corrected DLCO (Cotes; ATS/ERS: Macintyre N, et al, Eur Respir J 2005;26(4):720-735). Hb-adjusted DLCO = observed DLCO · (10.22 + Hb)/(1.7·Hb) for males ≥ 15 years, · (9.38 + Hb)/(1.7·Hb) for females and children < 15 years; KCO (transfer coefficient) = DLCO / alveolar volume VA. Anemia falsely lowers, polycythemia falsely raises the uncorrected value.';

export function dlcoCorrection(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const dlco = pos(o.dlco, 200); // mL/min/mmHg
  const hb = pos(o.hb, 25); // g/dL
  const va = pos(o.va, 12); // L
  const sex = sexOf(o.sex);
  const missing = [];
  if (dlco === null) missing.push('measured DLCO (mL/min/mmHg)');
  if (hb === null) missing.push('hemoglobin (g/dL)');
  if (va === null) missing.push('alveolar volume VA (L)');
  if (!sex) missing.push('sex');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const kConst = sex === 'male' ? 10.22 : 9.38;
  const corrected = num('corrected DLCO', dlco * ((kConst + hb) / (1.7 * hb)), { min: 0, max: 400 });
  const kco = num('KCO', dlco / va, { min: 0, max: 100 });
  const corrR = r1(corrected);
  const kcoR = r2(kco);
  const direction = corrected > dlco ? 'raised (anemia had lowered it)' : corrected < dlco ? 'lowered (polycythemia had raised it)' : 'unchanged';
  return {
    valid: true,
    corrected: corrR,
    kco: kcoR,
    abnormal: false,
    bandLabel: 'Hemoglobin-corrected DLCO',
    band: `Hb-corrected DLCO ${corrR} mL/min/mmHg; KCO ${kcoR} mL/min/mmHg/L.`,
    detail: `Correction ${direction}. KCO = DLCO/VA. ${sex === 'male' ? 'Male (target Hb 14.6)' : 'Female / child (target Hb 13.4)'} Cotes constant.`,
    note: DLCO_NOTE,
  };
}

// --- 2.5 VO2max & METs ------------------------------------------------------
const VO2_NOTE = 'Estimated VO₂max & METs (Bruce RA, et al, Am Heart J 1973;85(4):546-562; Cooper KH, JAMA 1968;203(3):201-204). Bruce treadmill: men VO₂max = 14.76 − 1.379·T + 0.451·T² − 0.012·T³ (T = minutes to exhaustion); women VO₂max = 4.38·T − 3.9. Cooper 12-minute run: VO₂max = (distance_m − 504.9)/44.73. METs = VO₂max / 3.5. An estimate of aerobic capacity, not an exercise prescription.';
const VO2_METHOD = { bruce: 'bruce', cooper: 'cooper' };

export function vo2maxExercise(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const method = typeof o.method === 'string' && VO2_METHOD[o.method] ? o.method : '';
  const missing = [];
  if (!method) missing.push('method (Bruce / Cooper)');
  let vo2; let how;
  if (method === 'bruce') {
    const t = pos(o.time, 40); // minutes
    const sex = sexOf(o.sex);
    if (t === null) missing.push('treadmill time to exhaustion (min)');
    if (!sex) missing.push('sex');
    if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
    vo2 = sex === 'male'
      ? 14.76 - 1.379 * t + 0.451 * t * t - 0.012 * t * t * t
      : 4.38 * t - 3.9;
    how = `Bruce protocol, ${sex === 'male' ? 'men' : 'women'}, ${r1(t)} min`;
  } else if (method === 'cooper') {
    const dist = pos(o.distance, 8000); // meters
    if (dist === null) missing.push('12-minute distance (m)');
    if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
    vo2 = (dist - 504.9) / 44.73;
    how = `Cooper 12-minute run, ${r1(dist)} m`;
  } else {
    return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  }
  const vo2n = num('VO₂max', vo2, { min: 0, max: 100 });
  const mets = num('METs', vo2n / 3.5, { min: 0, max: 30 });
  const vo2R = r1(vo2n);
  const metsR = r1(mets);
  return {
    valid: true,
    vo2max: vo2R,
    mets: metsR,
    abnormal: false,
    bandLabel: 'Estimated VO₂max',
    band: `VO₂max ${vo2R} mL/kg/min; ${metsR} METs.`,
    detail: `${how}. METs = VO₂max / 3.5. Compare against age- and sex-specific fitness norms as context.`,
    note: VO2_NOTE,
  };
}

// --- 2.6 Wilson-score CI for a proportion -----------------------------------
const PROP_NOTE = 'Confidence interval for a proportion (Wilson EB, J Am Stat Assoc 1927;22(158):209-212). p̂ = events/n; the Wilson-score interval stays within [0, 1] and behaves well for small samples or proportions near 0/1, unlike the naive Wald interval (reported alongside for teaching). z: 90% 1.6449, 95% 1.9600, 99% 2.5758.';
const Z = { 90: 1.6449, 95: 1.9600, 99: 2.5758 };

export function proportionCi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const n = nonNegInt(o.n, 1e9);
  const events = nonNegInt(o.events, 1e9);
  const level = o.level === '' || o.level === null || o.level === undefined ? 95 : Number(o.level);
  const z = Object.prototype.hasOwnProperty.call(Z, String(level)) ? Z[String(level)] : null;
  const missing = [];
  if (n === null || n === 0) missing.push('sample size n (> 0)');
  if (events === null) missing.push('number of events');
  if (z === null) missing.push('confidence level (90 / 95 / 99)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  if (events > n) return { valid: false, message: 'Events cannot exceed the sample size.' };
  const p = events / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z / denom) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  const lo = Math.max(0, center - half);
  const hi = Math.min(1, center + half);
  // Wald, for teaching, also clamped to [0, 1].
  const waldHalf = z * Math.sqrt((p * (1 - p)) / n);
  const waldLo = Math.max(0, p - waldHalf);
  const waldHi = Math.min(1, p + waldHalf);
  const pctP = r1(num('proportion', p * 100, { min: 0, max: 100 }));
  const pctLo = r1(num('CI low', lo * 100, { min: 0, max: 100 }));
  const pctHi = r1(num('CI high', hi * 100, { min: 0, max: 100 }));
  return {
    valid: true,
    proportion: pctP,
    ciLow: pctLo,
    ciHigh: pctHi,
    waldLow: r1(num('Wald low', waldLo * 100, { min: 0, max: 100 })),
    waldHigh: r1(num('Wald high', waldHi * 100, { min: 0, max: 100 })),
    level,
    abnormal: false,
    bandLabel: `Wilson ${level}% CI`,
    band: `Proportion ${pctP}% (${level}% CI ${pctLo}–${pctHi}%).`,
    detail: `${events} of ${n}; z = ${z}. Wald ${level}% CI for comparison: ${r1(waldLo * 100)}–${r1(waldHi * 100)}%.`,
    note: PROP_NOTE,
  };
}
