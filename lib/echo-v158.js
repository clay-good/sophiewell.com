// spec-v158 (the first feature spec of the spec-v157 Subspecialty Depth
// program): five deterministic echocardiography quantification computes that
// fill the program headline gap — echocardiography had only `aortic-valve-area`
// in the live catalog despite being one of the most-performed studies in
// medicine. None duplicates a live tile; v158 runs no AI and makes no runtime
// network call.
//
//   lvMassIndex   - LV mass (Devereux), LV mass index, relative wall thickness,
//                   and the four-pattern geometry classification
//   laVolumeIndex - left-atrial volume (biplane area-length) and LA volume index
//   teichholzLvef - Teichholz LV volumes, LVEF, and fractional shortening
//   rvspPasp      - RV systolic pressure / PASP from the TR jet (4·v² + RAP)
//   mitralEePrime - E/e′ (LV filling-pressure estimate)
//
// Per the spec-v100 §2 doctrine each is a closed-form arithmetic compute over
// the operator's standard 2D / Doppler measurements with published severity
// partitions. Citations live inline in lib/meta.js; the renderers in
// views/group-v158.js render the spec-v50 §3 posture note (a computed value from
// the operator's measurements; image quality and load-dependence apply) and
// defer the management decision to the clinician (spec-v11 §5.3).
//
// FORMULAS / CONSTANTS / SEVERITY PARTITIONS RE-FETCHED, NEVER RECALLED
// (spec-v97), each cross-verified across >= 2 independent sources at
// implementation against the ASE/EACVI chamber-quantification guideline (Lang
// RM, et al, J Am Soc Echocardiogr 2015;28(1):1-39) plus the cited primary
// papers and an independent reference.
// SOURCE-GOVERNANCE:
//   - lvMassIndex (Devereux RB, et al, Am J Cardiol 1986;57(6):450-458; ASE 2015
//     partitions): LV mass (g) = 0.8·{1.04·[(LVIDd + PWTd + IVSd)³ − LVIDd³]} +
//     0.6, all dimensions in cm. LVMI = mass / BSA. RWT = 2·PWTd / LVIDd. The
//     four-pattern geometry classification combines the RWT 0.42 cutoff with the
//     sex-specific LVMI upper-normal limits (men > 115, women > 95 g/m²):
//     normal (LVMI normal, RWT ≤ 0.42), concentric remodeling (normal LVMI, RWT
//     > 0.42), eccentric hypertrophy (elevated LVMI, RWT ≤ 0.42), concentric
//     hypertrophy (elevated LVMI, RWT > 0.42).
//   - laVolumeIndex (Lang 2015): LA volume = 0.85·(A1·A2)/L (biplane area-length;
//     A1 = A4C LA area, A2 = A2C LA area, L = the shorter of the two LA lengths).
//     LAVI = volume / BSA. ASE bands (mL/m²): normal ≤ 34, mild 35-41, moderate
//     42-48, severe > 48.
//   - teichholzLvef (Teichholz LE, et al, Am J Cardiol 1976;37(1):7-11; ASE 2015
//     bands): V = 7·D³/(2.4 + D), D in cm; EDV uses LVIDd, ESV uses LVIDs.
//     LVEF = (EDV − ESV)/EDV·100. FS = (LVIDd − LVIDs)/LVIDd·100. Sex-specific
//     LVEF bands: men normal ≥ 52, mild 41-51, moderate 30-40, severe < 30;
//     women normal ≥ 54, mild 41-53, moderate 30-40, severe < 30. Teichholz is
//     dimension-derived; Simpson biplane is preferred when wall motion is
//     regional (rendered caveat).
//   - rvspPasp (Yock PG, Popp RL, Circulation 1984;70(4):657-662): RVSP = 4·(TR
//     Vmax)² + RAP, TR Vmax in m/s; = PASP absent pulmonic stenosis / RVOT
//     obstruction. RAP from IVC (ASE 2015): small / collapsing 3, intermediate 8,
//     dilated / non-collapsing 15 mmHg.
//   - mitralEePrime (Nagueh SF, et al, J Am Soc Echocardiogr 2016;29(4):277-314):
//     E/e′ = mitral E (cm/s) / e′ (cm/s). Average E/e′: < 9 normal, 9-14
//     indeterminate, > 14 elevated LV filling pressure. Single-site cutoffs:
//     septal > 15, lateral > 13 elevated.

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

const SEX = { male: 'male', female: 'female' };
function sexOf(v) {
  return typeof v === 'string' && SEX[v] ? v : '';
}

// --- 2.1 LV mass index & geometry -------------------------------------------
const LV_MASS_NOTE = 'LV mass (Devereux RB, et al, Am J Cardiol 1986;57(6):450-458) with the ASE/EACVI (Lang 2015) geometry partitions. LV mass (g) = 0.8·{1.04·[(LVIDd + PWTd + IVSd)³ − LVIDd³]} + 0.6 (linear dimensions in cm); LVMI = mass / BSA; relative wall thickness RWT = 2·PWTd / LVIDd. Geometry combines the RWT 0.42 cutoff with the sex-specific LVMI upper-normal limit (men > 115, women > 95 g/m²): normal, concentric remodeling (normal mass, high RWT), eccentric hypertrophy (high mass, normal RWT), concentric hypertrophy (high mass, high RWT).';

export function lvMassIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lvidd = pos(o.lvidd, 12);
  const pwtd = pos(o.pwtd, 5);
  const ivsd = pos(o.ivsd, 5);
  const bsa = pos(o.bsa, 4);
  const sex = sexOf(o.sex);
  const missing = [];
  if (lvidd === null) missing.push('LVIDd (cm)');
  if (pwtd === null) missing.push('posterior-wall thickness PWTd (cm)');
  if (ivsd === null) missing.push('septal-wall thickness IVSd (cm)');
  if (bsa === null) missing.push('BSA (m²)');
  if (!sex) missing.push('sex');
  if (missing.length) {
    return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  }
  const sum = lvidd + pwtd + ivsd;
  const massRaw = 0.8 * (1.04 * (sum ** 3 - lvidd ** 3)) + 0.6;
  const mass = r1(num('LV mass', massRaw, { min: 0, max: 2000 }));
  const lvmi = r1(num('LVMI', massRaw / bsa, { min: 0, max: 2000 }));
  const rwt = r2(num('RWT', (2 * pwtd) / lvidd, { min: 0, max: 5 }));
  const upper = sex === 'male' ? 115 : 95;
  const elevated = lvmi > upper;
  const thick = rwt > 0.42;
  let pattern;
  if (!elevated && !thick) pattern = 'Normal geometry';
  else if (!elevated && thick) pattern = 'Concentric remodeling';
  else if (elevated && !thick) pattern = 'Eccentric hypertrophy';
  else pattern = 'Concentric hypertrophy';
  const abnormal = elevated || thick;
  return {
    valid: true,
    mass,
    lvmi,
    rwt,
    pattern,
    abnormal,
    bandLabel: pattern,
    band: `LV mass ${mass} g; LVMI ${lvmi} g/m²; RWT ${rwt} — ${pattern.toLowerCase()}.`,
    detail: `LVMI upper-normal for ${sex === 'male' ? 'men' : 'women'} is ${upper} g/m² (${elevated ? 'exceeded' : 'not exceeded'}); RWT cutoff 0.42 (${thick ? 'above' : 'at or below'}).`,
    note: LV_MASS_NOTE,
  };
}

// --- 2.2 LA volume index ----------------------------------------------------
const LAVI_NOTE = 'Left-atrial volume index (Lang RM, et al, J Am Soc Echocardiogr 2015;28(1):1-39). Biplane area-length: LA volume = 0.85·(A1·A2)/L, where A1 = apical 4-chamber LA area, A2 = apical 2-chamber LA area, and L = the shorter of the two LA long-axis lengths. LAVI = LA volume / BSA. ASE severity bands (mL/m²): normal ≤ 34, mild 35-41, moderate 42-48, severe > 48.';

export function laVolumeIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const a1 = pos(o.a1, 80);
  const a2 = pos(o.a2, 80);
  const l = pos(o.l, 12);
  const bsa = pos(o.bsa, 4);
  const missing = [];
  if (a1 === null) missing.push('A4C LA area A1 (cm²)');
  if (a2 === null) missing.push('A2C LA area A2 (cm²)');
  if (l === null) missing.push('LA length L (cm)');
  if (bsa === null) missing.push('BSA (m²)');
  if (missing.length) {
    return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  }
  const volRaw = (0.85 * (a1 * a2)) / l; // L guarded > 0 by pos()
  const vol = r1(num('LA volume', volRaw, { min: 0, max: 1000 }));
  const lavi = r1(num('LAVI', volRaw / bsa, { min: 0, max: 1000 }));
  let band; let abnormal;
  if (lavi <= 34) { band = 'normal'; abnormal = false; }
  else if (lavi <= 41) { band = 'mildly enlarged'; abnormal = true; }
  else if (lavi <= 48) { band = 'moderately enlarged'; abnormal = true; }
  else { band = 'severely enlarged'; abnormal = true; }
  return {
    valid: true,
    volume: vol,
    lavi,
    abnormal,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    band: `LA volume ${vol} mL; LAVI ${lavi} mL/m² — ${band}.`,
    detail: 'ASE bands (mL/m²): normal ≤ 34, mild 35–41, moderate 42–48, severe > 48.',
    note: LAVI_NOTE,
  };
}

// --- 2.3 Teichholz LVEF & fractional shortening -----------------------------
const TEICHHOLZ_NOTE = 'Teichholz LVEF & fractional shortening (Teichholz LE, et al, Am J Cardiol 1976;37(1):7-11; ASE 2015 bands). V = 7·D³/(2.4 + D), D in cm; EDV uses LVIDd, ESV uses LVIDs; LVEF = (EDV − ESV)/EDV; FS = (LVIDd − LVIDs)/LVIDd. Sex-specific LVEF bands: men normal ≥ 52, mild 41–51, moderate 30–40, severe < 30; women normal ≥ 54, mild 41–53, moderate 30–40, severe < 30. Teichholz is dimension-derived; biplane Simpson is preferred when wall motion is regional.';

function teichholzVolume(d) {
  return (7 * d ** 3) / (2.4 + d); // (2.4 + d) guarded > 0 by pos()
}

export function teichholzLvef(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lvidd = pos(o.lvidd, 12);
  const lvids = pos(o.lvids, 12);
  const sex = sexOf(o.sex);
  const missing = [];
  if (lvidd === null) missing.push('LVIDd (cm)');
  if (lvids === null) missing.push('LVIDs (cm)');
  if (!sex) missing.push('sex');
  if (missing.length) {
    return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  }
  if (lvids >= lvidd) {
    return { valid: false, message: 'LVIDs must be smaller than LVIDd (the ventricle contracts in systole).' };
  }
  const edv = teichholzVolume(lvidd);
  const esv = teichholzVolume(lvids);
  const ef = r1(num('LVEF', ((edv - esv) / edv) * 100, { min: 0, max: 100 }));
  const fs = r1(num('FS', ((lvidd - lvids) / lvidd) * 100, { min: 0, max: 100 }));
  const normalLow = sex === 'male' ? 52 : 54;
  let band; let abnormal;
  if (ef >= normalLow) { band = 'normal'; abnormal = false; }
  else if (ef >= 41) { band = 'mildly reduced'; abnormal = true; }
  else if (ef >= 30) { band = 'moderately reduced'; abnormal = true; }
  else { band = 'severely reduced'; abnormal = true; }
  return {
    valid: true,
    ef,
    fs,
    edv: r1(edv),
    esv: r1(esv),
    abnormal,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    band: `LVEF ${ef}%; FS ${fs}% — ${band} (${sex === 'male' ? 'male' : 'female'} normal ≥ ${normalLow}%).`,
    detail: `Teichholz EDV ${r1(edv)} mL, ESV ${r1(esv)} mL. Dimension-derived; prefer biplane Simpson when wall motion is regional.`,
    note: TEICHHOLZ_NOTE,
  };
}

// --- 2.4 RVSP / PASP --------------------------------------------------------
const RVSP_NOTE = 'RV systolic pressure / PASP from the tricuspid-regurgitation jet (Yock PG, Popp RL, Circulation 1984;70(4):657-662). RVSP = 4·(TR Vmax)² + right-atrial pressure (simplified Bernoulli), TR Vmax in m/s. RVSP equals the pulmonary-artery systolic pressure (PASP) in the absence of pulmonic stenosis or RVOT obstruction. RAP is estimated from the IVC (ASE 2015): small / collapsing IVC 3 mmHg, intermediate 8 mmHg, dilated / non-collapsing 15 mmHg.';

const RAP_OPTIONS = { 3: 3, 8: 8, 15: 15 };

export function rvspPasp(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const trVmax = pos(o.trVmax, 10);
  const rapRaw = o.rap === null || o.rap === undefined || o.rap === '' ? null : Number(o.rap);
  const rap = Number.isFinite(rapRaw) && Object.prototype.hasOwnProperty.call(RAP_OPTIONS, String(rapRaw)) ? RAP_OPTIONS[String(rapRaw)] : null;
  const missing = [];
  if (trVmax === null) missing.push('TR peak velocity Vmax (m/s)');
  if (rap === null) missing.push('estimated right-atrial pressure (3 / 8 / 15 mmHg)');
  if (missing.length) {
    return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  }
  const rvsp = r1(num('RVSP', 4 * trVmax ** 2 + rap, { min: 0, max: 400 }));
  // PASP elevated when > ~35 mmHg at rest (commonly cited threshold).
  const elevated = rvsp > 35;
  return {
    valid: true,
    rvsp,
    rap,
    abnormal: elevated,
    bandLabel: elevated ? 'Elevated' : 'Not elevated',
    band: `RVSP / PASP ${rvsp} mmHg — ${elevated ? 'elevated' : 'not elevated'} (≈ 4·${trVmax}² + ${rap}).`,
    detail: 'Equals PASP absent pulmonic stenosis / RVOT obstruction; a resting PASP above ≈ 35 mmHg is commonly flagged for further pulmonary-hypertension evaluation.',
    note: RVSP_NOTE,
  };
}

// --- 2.5 E/e′ ---------------------------------------------------------------
const EE_NOTE = 'E/e′, the LV filling-pressure estimate (Nagueh SF, et al, J Am Soc Echocardiogr 2016;29(4):277-314). E/e′ = mitral-inflow early-diastolic velocity E (cm/s) divided by tissue-Doppler e′ (cm/s). Average E/e′: < 9 normal, 9–14 indeterminate, > 14 elevated LV filling pressure. Single-site cutoffs for elevated filling pressure: septal E/e′ > 15, lateral E/e′ > 13. The average (septal + lateral)/2 is preferred when both are available.';

const EE_SITE = { septal: 'septal', lateral: 'lateral', average: 'average' };

export function mitralEePrime(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const e = pos(o.e, 300);
  const ePrime = pos(o.ePrime, 30);
  const site = typeof o.site === 'string' && EE_SITE[o.site] ? o.site : '';
  const missing = [];
  if (e === null) missing.push('mitral E velocity (cm/s)');
  if (ePrime === null) missing.push('e′ velocity (cm/s)');
  if (!site) missing.push('e′ site (septal / lateral / average)');
  if (missing.length) {
    return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  }
  const ratio = r1(num('E/e′', e / ePrime, { min: 0, max: 100 })); // e′ guarded > 0 by pos()
  let band; let abnormal;
  if (site === 'average') {
    if (ratio > 14) { band = 'elevated LV filling pressure'; abnormal = true; }
    else if (ratio >= 9) { band = 'indeterminate'; abnormal = false; }
    else { band = 'normal filling pressure'; abnormal = false; }
  } else {
    const cut = site === 'septal' ? 15 : 13;
    if (ratio > cut) { band = 'elevated LV filling pressure'; abnormal = true; }
    else { band = `not elevated by the ${site} cutoff (> ${cut})`; abnormal = false; }
  }
  return {
    valid: true,
    ratio,
    site,
    abnormal,
    bandLabel: abnormal ? 'Elevated' : 'Not elevated',
    band: `E/e′ ${ratio} (${site}) — ${band}.`,
    detail: site === 'average'
      ? 'Average E/e′ < 9 normal, 9–14 indeterminate, > 14 elevated. Use the average of septal and lateral e′ when both are available.'
      : `Single-site cutoff: ${site} E/e′ > ${site === 'septal' ? 15 : 13} indicates elevated filling pressure. The average is preferred when both walls are sampled.`,
    note: EE_NOTE,
  };
}
