// spec-v130 (Wave 5 of the spec-v100 MDCalc Parity Completion program): six
// deterministic urology tiles covering prostate volumetry, PSA kinetics, and
// prostate-cancer risk stratification. None duplicates a live tile; each takes
// clinician-entered measurements or lab values as input.
//
//   prostateVolume       - ellipsoid prostate volume from three dimensions
//   psaDensity           - serum PSA per unit prostate volume
//   psaVelocity          - rate of PSA rise (ng/mL/yr) between two readings
//   psaDoublingTime      - PSA doubling time in months (log-linear, two-point)
//   damicoProstateRisk   - D'Amico low/intermediate/high recurrence risk
//   gleasonGradeGroup    - ISUP/Epstein Grade Group 1-5 from Gleason patterns
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v130.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the quantity or class and the source's
// framing; the management decision stays with the clinician (spec-v11 §5.3).
// All six are Class A (fixed geometric/arithmetic formulas and fixed published
// classification tables) -- no docs/citation-staleness.md row.
//
// FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - prostateVolume (Terris & Stamey 1991): prolate-ellipsoid V = AP x TR x CC
//     x 0.52, dimensions in cm, volume in cc (= mL). 0.52 is pi/6 (0.5236)
//     rounded to the dominant clinical/MDCalc convention; the choice is stated
//     to the user. A volume above ~30 cc is the conventional enlarged/BPH range.
//   - psaDensity (Benson 1992): PSAD = serum PSA (ng/mL) / prostate volume (cc);
//     a density above 0.15 ng/mL/cc raises suspicion for clinically significant
//     cancer. The 0.15 benchmark is a widely cited convention, not an absolute
//     rule; it frames the reading, the decision stays with the clinician.
//   - psaVelocity (Carter 1992): the validated method averages consecutive
//     yearly rates over >= 3 measurements spanning >= 18 months; this tile
//     computes the two-point rate (PSA2 - PSA1) / years as the bedside
//     approximation and says so. A velocity above 0.75 ng/mL/yr raises
//     suspicion (lower thresholds ~0.35-0.4 apply when baseline PSA < 4).
//   - psaDoublingTime (Pound 1999): PSADT = ln(2) x T / (ln(PSA2) - ln(PSA1)),
//     T in months, the two-point reduction of the log-linear regression. It
//     requires a rising PSA (PSA2 > PSA1); a stable or falling PSA has no
//     doubling time and is reported as such, not as a number. A PSADT under
//     ~12 months signals more aggressive disease (under ~3 months, very
//     aggressive).
//   - damicoProstateRisk (D'Amico 1998): the worst single feature governs.
//     Low = clinical stage <= T2a AND PSA <= 10 AND Gleason <= 6; Intermediate =
//     stage T2b OR PSA > 10 and <= 20 OR Gleason 7; High = stage >= T2c OR
//     PSA > 20 OR Gleason >= 8. The PSA boundary is strict (a PSA of exactly 10
//     is Low); the high-stage cut is T2c per the original.
//   - gleasonGradeGroup (Epstein 2016 / ISUP 2014): Grade Group from the
//     primary + secondary Gleason patterns -- GG1 = sum <= 6; GG2 = 3+4=7;
//     GG3 = 4+3=7; GG4 = sum 8; GG5 = sum 9-10. The primary pattern governs the
//     3+4 (GG2) vs 4+3 (GG3) split.

import { r1, r2, r3 } from './num.js';

const pos = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const intIn = (v, lo, hi) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && Number.isInteger(n) && n >= lo && n <= hi ? n : null;
};
const obj = (input) => (input && typeof input === 'object' ? input : {});

// --- 2.1 prostate-volume ------------------------------------------------------
const PV_NOTE = 'Prostate volume by the prolate-ellipsoid formula (Terris MK, Stamey TA, J Urol 1991): volume = anteroposterior x transverse x craniocaudal x 0.52, with all three dimensions in centimeters and volume in cubic centimeters (cc = mL). The coefficient 0.52 is pi/6 rounded to the dominant clinical convention. A volume above about 30 cc is the conventional enlarged (benign prostatic hyperplasia) range and is the denominator for PSA density. It frames the gland size; the management decision stays with the clinician.';

export function prostateVolume(input = {}) {
  const o = obj(input);
  const ap = pos(o.ap);
  const tr = pos(o.tr);
  const cc = pos(o.cc);
  if (ap === null || tr === null || cc === null) {
    return { valid: false, message: 'Enter the anteroposterior, transverse, and craniocaudal dimensions in centimeters.' };
  }
  const vol = ap * tr * cc * 0.52;
  const volR = r1(vol);
  const enlarged = volR > 30;
  return {
    valid: true, volume: volR,
    abnormal: enlarged,
    band: `Prostate volume ${volR} cc (AP x TR x CC x 0.52): ${enlarged ? 'above ~30 cc, the conventional enlarged (BPH) range' : 'within the conventional non-enlarged range'}.`,
    note: PV_NOTE,
  };
}

// --- 2.2 psa-density ----------------------------------------------------------
const PSAD_NOTE = 'PSA density (Benson MC, et al, J Urol 1992): serum PSA (ng/mL) divided by prostate volume (cc, typically from transrectal ultrasound or MRI ellipsoid volume). A density above 0.15 ng/mL/cc raises suspicion for clinically significant prostate cancer and is used to refine biopsy decisions when PSA is in the gray zone. The 0.15 benchmark is a widely cited convention, not an absolute rule. It frames the reading; the management decision stays with the clinician.';

export function psaDensity(input = {}) {
  const o = obj(input);
  const psa = pos(o.psa);
  const vol = pos(o.volume);
  if (psa === null || vol === null) {
    return { valid: false, message: 'Enter the serum PSA (ng/mL) and the prostate volume (cc).' };
  }
  const density = psa / vol;
  const densityR = r3(density);
  const elevated = densityR > 0.15;
  return {
    valid: true, density: densityR,
    abnormal: elevated,
    band: `PSA density ${densityR} ng/mL/cc (PSA ${r2(psa)} / volume ${r1(vol)} cc): ${elevated ? 'above 0.15, raising suspicion for clinically significant cancer' : 'at or below 0.15, the conventional lower-suspicion range'}.`,
    note: PSAD_NOTE,
  };
}

// --- 2.3 psa-velocity ---------------------------------------------------------
const PSAV_NOTE = 'PSA velocity (Carter HB, et al, JAMA 1992): the rate of PSA rise. The validated method averages consecutive yearly rates over at least three measurements spanning at least 18 months; this tile computes the two-point rate (later PSA - earlier PSA) divided by the interval in years as a bedside approximation. A velocity above 0.75 ng/mL/yr raises suspicion for cancer (a lower threshold of about 0.35-0.4 ng/mL/yr applies when the baseline PSA is below 4). It frames the kinetics; the management decision stays with the clinician.';

export function psaVelocity(input = {}) {
  const o = obj(input);
  const psa1 = pos(o.psa1);
  const psa2 = pos(o.psa2);
  const months = pos(o.months);
  if (psa1 === null || psa2 === null || months === null) {
    return { valid: false, message: 'Enter the earlier PSA, the later PSA (both ng/mL), and the interval between them in months.' };
  }
  const years = months / 12;
  const velocity = (psa2 - psa1) / years;
  const velR = r2(velocity);
  const elevated = velR > 0.75;
  return {
    valid: true, velocity: velR,
    abnormal: elevated,
    band: `PSA velocity ${velR > 0 ? '+' : ''}${velR} ng/mL/yr (over ${r1(months)} months): ${velR > 0.75 ? 'above 0.75 ng/mL/yr, raising suspicion for cancer' : velR < 0 ? 'PSA is falling over this interval' : 'at or below 0.75 ng/mL/yr, the conventional lower-suspicion range'}.`,
    note: PSAV_NOTE,
  };
}

// --- 2.4 psa-doubling-time ----------------------------------------------------
const PSADT_NOTE = 'PSA doubling time (Pound CR, et al, JAMA 1999): PSADT = ln(2) x T / (ln(later PSA) - ln(earlier PSA)), with T the interval in months -- the two-point reduction of the log-linear regression. It requires a rising PSA: a stable or falling PSA has no doubling time. A doubling time under about 12 months signals more aggressive disease, and under about 3 months very aggressive disease. It frames the kinetics; the management decision stays with the clinician.';

export function psaDoublingTime(input = {}) {
  const o = obj(input);
  const psa1 = pos(o.psa1);
  const psa2 = pos(o.psa2);
  const months = pos(o.months);
  if (psa1 === null || psa2 === null || months === null) {
    return { valid: false, message: 'Enter the earlier PSA, the later PSA (both ng/mL), and the interval between them in months.' };
  }
  if (psa2 <= psa1) {
    return {
      valid: true, rising: false, dt: null,
      abnormal: false,
      band: 'PSA is not rising over this interval (later PSA not greater than earlier PSA); a doubling time is undefined.',
      note: PSADT_NOTE,
    };
  }
  const dt = (months * Math.LN2) / (Math.log(psa2) - Math.log(psa1));
  const dtR = r1(dt);
  const aggressive = dtR < 12;
  return {
    valid: true, rising: true, dt: dtR,
    abnormal: aggressive,
    band: `PSA doubling time ${dtR} months: ${dtR < 3 ? 'under ~3 months, very aggressive kinetics' : dtR < 12 ? 'under ~12 months, more aggressive kinetics' : 'at or above ~12 months, the conventional less-aggressive range'}.`,
    note: PSADT_NOTE,
  };
}

// --- 2.5 damico-prostate-risk -------------------------------------------------
const DAMICO_NOTE = 'D’Amico risk classification (D’Amico AV, et al, JAMA 1998): stratifies the risk of biochemical (PSA) recurrence after definitive local therapy from the clinical T stage, the serum PSA, and the Gleason score. The worst single feature governs the group. Low = stage T2a or below AND PSA 10 or below AND Gleason 6 or below; Intermediate = stage T2b OR PSA above 10 and up to 20 OR Gleason 7; High = stage T2c OR PSA above 20 OR Gleason 8 or above. It frames the recurrence risk; the management decision stays with the clinician.';

// clinical T stage -> D'Amico tier (1 low / 2 intermediate / 3 high)
const DAMICO_STAGE_TIER = {
  T1: 1, T1a: 1, T1b: 1, T1c: 1, T2a: 1,
  T2b: 2,
  T2c: 3, T3: 3, T3a: 3, T3b: 3, T4: 3,
};
const TIER_LABEL = { 1: 'Low', 2: 'Intermediate', 3: 'High' };

export function damicoProstateRisk(input = {}) {
  const o = obj(input);
  const psa = pos(o.psa);
  const gleason = intIn(o.gleason, 2, 10);
  const stage = typeof o.stage === 'string' ? o.stage.trim() : '';
  const stageTier = DAMICO_STAGE_TIER[stage] || null;
  if (psa === null || gleason === null || stageTier === null) {
    return { valid: false, message: 'Enter the serum PSA (ng/mL), the Gleason score (2-10), and the clinical T stage.' };
  }
  const psaTier = psa > 20 ? 3 : psa > 10 ? 2 : 1;
  const gleasonTier = gleason >= 8 ? 3 : gleason === 7 ? 2 : 1;
  const tier = Math.max(stageTier, psaTier, gleasonTier);
  const label = TIER_LABEL[tier];
  const drivers = [];
  if (psaTier === tier) drivers.push('PSA');
  if (gleasonTier === tier) drivers.push('Gleason');
  if (stageTier === tier) drivers.push('stage');
  return {
    valid: true, risk: label, tier,
    abnormal: tier >= 2,
    band: `${label} risk of biochemical recurrence (driven by ${drivers.join(' / ')}; the worst feature governs).`,
    note: DAMICO_NOTE,
  };
}

// --- 2.6 gleason-grade-group --------------------------------------------------
const GLEASON_NOTE = 'Gleason Grade Group (Epstein JI, et al, Am J Surg Pathol 2016; ISUP 2014): maps the primary and secondary Gleason patterns to a prognostic Grade Group 1-5. Grade Group 1 = Gleason 6 or below; Group 2 = 3+4 = 7; Group 3 = 4+3 = 7; Group 4 = Gleason 8 (4+4, 3+5, 5+3); Group 5 = Gleason 9-10. The primary pattern governs the 3+4 versus 4+3 split. It frames the histologic grade; the management decision stays with the clinician.';

export function gleasonGradeGroup(input = {}) {
  const o = obj(input);
  const primary = intIn(o.primary, 1, 5);
  const secondary = intIn(o.secondary, 1, 5);
  if (primary === null || secondary === null) {
    return { valid: false, message: 'Enter the primary and secondary Gleason patterns (each 1-5).' };
  }
  const sum = primary + secondary;
  let group;
  if (sum <= 6) group = 1;
  else if (sum === 7) group = primary === 3 ? 2 : 3;
  else if (sum === 8) group = 4;
  else group = 5; // 9-10
  const aggressive = group >= 4;
  return {
    valid: true, sum, group, primary, secondary,
    abnormal: aggressive,
    band: `Gleason ${primary}+${secondary} = ${sum}, Grade Group ${group} of 5: ${group === 1 ? 'lowest-grade disease' : group === 2 ? 'favorable intermediate grade' : group === 3 ? 'unfavorable intermediate grade' : group === 4 ? 'high grade' : 'highest grade'}.`,
    note: GLEASON_NOTE,
  };
}
