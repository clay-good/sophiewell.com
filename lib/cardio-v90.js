// spec-v90 (first feature spec of Wave 2 of the spec-v85 Advanced Clinical
// Calculators program): six deterministic cardiology / ECG computations that
// fill confirmed gaps in the catalog's cardiology surface.
//
//   ecgAxis             - mean frontal-plane QRS axis (hexaxial atan2 geometry)
//   lvhCriteria         - ECG LVH voltage criteria (Sokolow-Lyon + Cornell)
//   timiStemi           - TIMI risk score for STEMI (Morrow 2000, 0-14)
//   dukeTreadmill       - Duke treadmill score (Mark 1987) + 5-year survival
//   cardiacPowerOutput  - CPO = (MAP x CO) / 451 watts; < 0.6 W shock threshold
//   aorticValveArea     - continuity-equation AVA + dimensionless index + band
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v16.js wire these to the home grid.
// Every function takes a single destructured object so the spec-v59 fuzz
// harness can drive each field through its adversarial matrix. The two
// ill-defined inputs are domain-guarded so no non-finite value reaches a
// returned string (spec-v59): ecgAxis surfaces the all-isoelectric (0,0) case
// as an "indeterminate axis" rather than a spurious 0 deg, and aorticValveArea
// guards division by AV_VTI = 0. r1/r2 come from lib/num.js (spec-v53 §4.1).
// None authors a management order in Sophie's voice (spec-v11 §5.3) - each
// surfaces the computation and the cited source's own band / criterion.

import { r1, r2 } from './num.js';

// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined/null) is
// treated as "not provided" rather than throwing, so optional fields are safe.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
// Strictly-positive finite or null (a value we can divide by).
const pos = (v) => { const f = fin(v); return f != null && f > 0 ? f : null; };
// Clamp a finite value into [lo, hi]; null stays null.
const clamp = (v, lo, hi) => (v == null ? null : Math.min(hi, Math.max(lo, v)));
// Non-negative magnitude (a measured ECG amplitude is a magnitude): null stays null.
const mag = (v) => { const f = fin(v); return f == null ? null : Math.max(0, f); };
// A yes/no/boolean toggle from a select or checkbox normalizes to a boolean.
const yes = (v) => v === true || v === 'yes' || v === 'on' || v === 1;

// --- 2.1 ecgAxis - mean frontal-plane QRS axis -------------------------------
// The frontal-plane axis is fixed atan2 geometry on the hexaxial reference:
// lead I lies along 0 deg, lead aVF along +90 deg (an orthogonal pair), so the
// mean axis is atan2(net aVF, net I). Lead II (optional) is concordant at
// +60 deg and is accepted for completeness but does not change the result - the
// two orthogonal leads fully determine the frontal axis. The all-isoelectric
// (0, 0) input is the only ill-defined case and returns "indeterminate axis"
// rather than a spurious 0 deg or a NaN (spec-v85 §2 atan2 guard). Quadrants
// per the standard hexaxial convention.
export function ecgAxis({ leadI, avf, leadII } = {}) {
  const i = fin(leadI);
  const f = fin(avf);
  if (i == null || f == null) {
    return {
      valid: false,
      band: 'Enter the net QRS deflection (mm, signed) in lead I and lead aVF.',
      note: 'The mean frontal-plane axis is computed from the net QRS deflection in lead I (0 deg) and lead aVF (+90 deg). Lead II is optional and does not change the result.',
    };
  }
  // The only ill-defined input: both limb-lead nets isoelectric.
  if (i === 0 && f === 0) {
    return {
      valid: true,
      indeterminate: true,
      axis: null,
      quadrant: 'indeterminate',
      quadrantLabel: 'indeterminate axis',
      band: 'Indeterminate axis: both lead I and aVF net deflections are isoelectric (0), so the frontal-plane axis is undefined.',
      note: 'When both lead I and aVF are isoelectric the mean vector has no direction (an all-isoelectric or perpendicular-plane complex). Re-measure the net QRS areas; the axis cannot be assigned from these two leads alone.',
    };
  }
  const axisDeg = Math.atan2(f, i) * 180 / Math.PI;
  // Round first, then classify on the displayed degree, so the named quadrant
  // always agrees with the number shown (an atan2 result of -30.0000001 must
  // not display "-30 deg" while reading LAD). Standard hexaxial quadrants:
  // normal is inclusive -30..+90; LAD is the open interval (-90, -30);
  // extreme/northwest is <= -90; RAD is > +90. -30 reads normal, +90 reads
  // normal, +180 reads RAD, -90 reads extreme.
  const deg = r1(axisDeg);
  let quadrant; let quadrantLabel;
  if (deg >= -30 && deg <= 90) { quadrant = 'normal'; quadrantLabel = 'normal axis (-30 deg to +90 deg)'; }
  else if (deg > -90 && deg < -30) { quadrant = 'lad'; quadrantLabel = 'left-axis deviation (-30 deg to -90 deg)'; }
  else if (deg <= -90) { quadrant = 'extreme'; quadrantLabel = 'extreme / northwest axis (-90 deg to -180 deg)'; }
  else { quadrant = 'rad'; quadrantLabel = 'right-axis deviation (+90 deg to +180 deg)'; }

  return {
    valid: true,
    indeterminate: false,
    axis: deg,
    quadrant,
    quadrantLabel,
    band: `Mean QRS axis ${deg} deg: ${quadrantLabel}.`,
    note: 'Mean frontal-plane axis = atan2(net aVF, net lead I) on the hexaxial reference (lead I = 0 deg, aVF = +90 deg). Normal -30 deg to +90 deg; left-axis deviation -30 deg to -90 deg; right-axis deviation +90 deg to +180 deg; extreme/northwest -90 deg to -180 deg. This is the mean axis from the entered net deflections, not a full 12-lead read.',
  };
}

// --- 2.2 lvhCriteria - ECG LVH voltage criteria ------------------------------
// The two standard voltage criteria, applied exactly. Sokolow-Lyon (1949):
// SV1 + max(RV5, RV6) >= 35 mm. Cornell voltage (1985): SV3 + RaVL with a
// sex-specific threshold (> 28 mm men, > 20 mm women). Voltages clamp to a
// non-negative magnitude; the output shows each sum against its threshold and
// which (if either) is positive. No division - cannot overflow non-finite.
export function lvhCriteria({
  sV1, rV5, rV6, sV3, rAVL, sex,
} = {}) {
  // spec-v1116: `sex = 'male'` was a default parameter, and the comment below
  // called it "the labeled male default" -- noticing it and reasoning past it.
  // The Cornell threshold is 28 mm for men and 20 for women, so the default
  // applies the HIGHER cut-off to a sex nobody stated and under-calls LVH in
  // women by up to 8 mm of voltage.
  //
  // Unlike the three tiles beside it, this one does not refuse: Sokolow-Lyon has
  // no sex term and is reported as it always was. It is the Cornell half that
  // waits, which is the "answer with the halves you have" shape of spec-v1045.
  const sexStated = sex === 'male' || sex === 'm' || sex === 'female' || sex === 'f';
  const sv1 = mag(sV1);
  const rv5 = mag(rV5);
  const rv6 = mag(rV6);
  const sv3 = mag(sV3);
  const ravl = mag(rAVL);

  // Sokolow-Lyon needs SV1 and at least one of RV5/RV6 to form the sum.
  const sokolowComplete = sv1 != null && (rv5 != null || rv6 != null);
  const sokolowSum = sokolowComplete ? sv1 + Math.max(rv5 || 0, rv6 || 0) : null;
  const sokolowMet = sokolowSum == null ? null : sokolowSum >= 35;

  // Cornell branches on sex; the threshold is the sex-specific cutoff, and it is
  // not applied at all until the sex is stated.
  const female = sex === 'female' || sex === 'f';
  const cornellThreshold = sexStated ? (female ? 20 : 28) : null;
  const cornellComplete = sv3 != null && ravl != null && sexStated;
  const cornellSum = (sv3 != null && ravl != null) ? sv3 + ravl : null;
  const cornellMet = cornellComplete ? cornellSum > cornellThreshold : null;

  if (!sokolowComplete && !cornellComplete) {
    return {
      valid: false,
      band: 'Enter the precordial and limb-lead amplitudes (S in V1, R in V5/V6, S in V3, R in aVL) and the sex.',
      note: 'Sokolow-Lyon uses SV1 + max(RV5, RV6) >= 35 mm; Cornell voltage uses SV3 + RaVL > 28 mm (men) or > 20 mm (women).',
    };
  }

  const anyMet = sokolowMet === true || cornellMet === true;
  const metNames = [];
  if (sokolowMet === true) metNames.push('Sokolow-Lyon');
  if (cornellMet === true) metNames.push('Cornell voltage');

  let band;
  if (anyMet) {
    band = `Voltage criteria for LVH positive: ${metNames.join(' and ')}.`;
  } else if (sokolowComplete || cornellComplete) {
    band = 'No LVH voltage criterion met by the entered amplitudes.';
  }
  // The Cornell sum is arithmetic and stands on its own; only the comparison
  // needs the sex, so say which is outstanding rather than hiding both.
  if (band && cornellSum != null && !sexStated) {
    band += ` The Cornell sum is ${r1(cornellSum)} mm, but its threshold is `
      + 'sex-specific (> 28 mm in men, > 20 mm in women), so the sex is needed before it can be read.';
  }

  return {
    valid: true,
    sokolowSum: sokolowSum == null ? null : r1(sokolowSum),
    sokolowMet,
    cornellSum: cornellSum == null ? null : r1(cornellSum),
    cornellMet,
    cornellThreshold,
    sex: female ? 'female' : 'male',
    anyMet,
    band,
    note: `Sokolow-Lyon: SV1 + max(RV5, RV6) >= 35 mm. Cornell voltage: SV3 + RaVL > ${cornellThreshold} mm (${female ? 'women' : 'men'}). Voltage criteria are specific but not sensitive for LVH; a negative ECG does not exclude it, and the echocardiogram remains the reference standard.`,
  };
}

// --- 2.3 timiStemi - TIMI Risk Score for STEMI (Morrow 2000) -----------------
// A fixed weighted point sum (0-14) over nine bedside variables mapping to a
// published 30-day mortality band. No division; the total is bounded and the
// mortality table is keyed by the integer total (>8 collapses to the top row).
const TIMI_MORTALITY = {
  0: 0.8, 1: 1.6, 2: 2.2, 3: 4.4, 4: 7.3, 5: 12.4, 6: 16.1, 7: 23.4, 8: 26.8,
};
const TIMI_MORTALITY_HIGH = 35.9; // score > 8
export function timiStemi({
  age, diabetesHtnAngina, sbpLow, hrHigh, killip24, weightLow, anteriorSteLbbb, timeOver4h,
} = {}) {
  const a = fin(age);
  // Age band points: >=75 -> 3; 65-74 -> 2; <65 -> 0. A blank age contributes 0
  // age points (the score still computes; the note flags the omission).
  const agePts = a == null ? 0 : (a >= 75 ? 3 : (a >= 65 ? 2 : 0));
  const histPts = yes(diabetesHtnAngina) ? 1 : 0;
  const sbpPts = yes(sbpLow) ? 3 : 0;
  const hrPts = yes(hrHigh) ? 2 : 0;
  const killipPts = yes(killip24) ? 2 : 0;
  const weightPts = yes(weightLow) ? 1 : 0;
  const stePts = yes(anteriorSteLbbb) ? 1 : 0;
  const timePts = yes(timeOver4h) ? 1 : 0;

  // spec-v1117: `yes()` reads anything that is not "yes" as "no", and the seven
  // risk factors are yes/no SELECTS that opened on "No" -- so entering an age
  // and touching nothing else answered:
  //
  //   "TIMI-STEMI 0 of 14: 0.8% 30-day mortality (Morrow 2000)."
  //
  // a mortality figure for a STEMI patient whose seven risk factors nobody had
  // assessed. spec-v1007 and spec-v1021 had already reasoned about a blank AGE
  // and withheld the mortality for it; the risk factors were never considered,
  // because in the browser a select always carries a value (rule 9). They now
  // carry a "Not assessed" option, and an unanswered one is counted here.
  //
  // The score is a sum of non-negative points, so the total stays a real FLOOR
  // and is still reported. It is the MORTALITY that waits, on exactly the
  // grounds spec-v1007 gave for the age: the figure is read straight off the
  // total, and a total that is a lower bound reads off the wrong row.
  const unanswered = [
    [diabetesHtnAngina, 'history of diabetes, hypertension or angina'],
    [sbpLow, 'systolic BP < 100'],
    [hrHigh, 'heart rate > 100'],
    [killip24, 'Killip class II-IV'],
    [weightLow, 'weight < 67 kg'],
    [anteriorSteLbbb, 'anterior ST-elevation or LBBB'],
    [timeOver4h, 'time to treatment > 4 hours'],
  ].filter(([v]) => v === undefined || v === null || v === '').map(([, label]) => label);

  const total = agePts + histPts + sbpPts + hrPts + killipPts + weightPts + stePts + timePts;
  // spec-v1007: age is the only measurement here and it carries up to 3 of the 14
  // points, so a blank age leaves the total a LOWER BOUND. The 30-day mortality is
  // read straight off that total, and a blank age used to read off the bottom of
  // the table: an empty form answered "0.8% 30-day mortality". The score still
  // reports -- the seven answered risk factors are real -- but the mortality
  // figure waits for the age that would place it.
  const ageMissing = a == null;
  const mortality = (ageMissing || unanswered.length)
    ? null
    : (total > 8 ? TIMI_MORTALITY_HIGH : TIMI_MORTALITY[total]);

  // spec-v1021: with a blank age AND no risk factor answered, nothing has been
  // entered at all, and a refusal returned as a valid result reads to an agent
  // as a reading. Once any risk factor is answered the total is a real floor and
  // the result stands, with the mortality still withheld.
  const nothingEntered = ageMissing && total === 0 && unanswered.length === 7;
  return {
    valid: !nothingEntered,
    ...(nothingEntered ? { message: 'Enter the age and the risk factors to score. Age alone adds up to 3 of the 14 points, and the 30-day mortality is read off the total.' } : {}),
    total,
    agePts,
    histPts,
    sbpPts,
    hrPts,
    killipPts,
    weightPts,
    stePts,
    timePts,
    ageProvided: a != null,
    mortality,
    unanswered,
    band: (ageMissing || unanswered.length)
      ? `TIMI-STEMI at least ${total} of 14 -- ${[
        ageMissing ? 'enter the age (up to 3 points)' : null,
        unanswered.length ? `answer ${unanswered.length} of the 7 risk factors (${unanswered.join(', ')})` : null,
      ].filter(Boolean).join(' and ')}. Each can only add points, and the 30-day mortality is read straight off the total, so a total that is a lower bound reads off the wrong row.`
      : `TIMI-STEMI ${total} of 14: ${mortality}% 30-day mortality (Morrow 2000).`,
    note: `Points: age 65-74 = 2, age >= 75 = 3; diabetes/hypertension/angina history = 1; SBP < 100 = 3; HR > 100 = 2; Killip class II-IV = 2; weight < 67 kg = 1; anterior STE or LBBB = 1; time to treatment > 4 h = 1.${ageMissing ? ' Age was left blank: it contributed 0 points and the mortality band is withheld.' : ''} The 30-day mortality band is the Morrow 2000 derivation cohort's observed rate.`,
  };
}

// --- 2.4 dukeTreadmill - Duke Treadmill Score (Mark 1987) --------------------
// A fixed linear combination of exercise time, ST deviation, and an angina
// index, with a cited 5-year survival per risk band.
//   DTS = exercise time(min) - (5 x ST deviation mm) - (4 x angina index)
// Bands: low >= +5, moderate -10 to +4, high <= -11.
// spec-v1132: `anginaIndex = 0` was a default parameter, and 0 is "no angina" --
// the best of the three levels, worth 8 points on a scale whose middle band is
// 15 wide. An omitted angina index therefore answered exactly as a patient who
// exercised without angina, and the answer quotes a cited 5-year survival.
//
// The index is 0, 1 or 2, so an unstated one puts the score in a KNOWN RANGE of
// 8 points. Where both ends of that range land in the same band the verdict is
// the same whatever the angina was, and the tile answers (rule 25: the unit of a
// guard is a reading, not a field). Where they do not, the angina index is what
// decides between "low risk, 99% 5-year survival" and "moderate", and it is
// asked for.
export function dukeTreadmill({ exerciseTime, stDeviation, anginaIndex } = {}) {
  const t = fin(exerciseTime);
  const st = fin(stDeviation);
  const anginaStated = !(anginaIndex === null || anginaIndex === undefined
    || String(anginaIndex).trim() === '');
  const ai = anginaStated ? fin(anginaIndex) : 0;
  if (t == null || st == null || ai == null) {
    return {
      valid: false,
      band: 'Enter the exercise time (min), the maximal ST-segment deviation (mm), and the angina index (0/1/2).',
      note: 'DTS = exercise time (Bruce, min) - (5 x ST deviation in mm) - (4 x angina index: 0 none, 1 non-limiting, 2 limiting).',
    };
  }
  // Exercise time is non-negative; ST deviation is a non-negative magnitude; the
  // angina index is clamped to its 0/1/2 domain.
  const tC = Math.max(0, t);
  const stC = Math.max(0, st);
  const aiC = clamp(Math.round(ai), 0, 2);
  const score = tC - 5 * stC - 4 * aiC;

  const bandOf = (v) => (v >= 5 ? 'low' : (v >= -10 ? 'moderate' : 'high'));
  // Unstated, the angina index costs between 0 and 8 points, so the true score
  // lies in [score - 8, score].
  const rangeLow = anginaStated ? score : score - 8;
  const sameBandEitherWay = bandOf(rangeLow) === bandOf(score);
  const risk = bandOf(score);
  const survival = { low: 99, moderate: 95, high: 79 }[risk];
  const riskLabel = {
    low: 'low risk (DTS >= +5)',
    moderate: 'moderate risk (DTS -10 to +4)',
    high: 'high risk (DTS <= -11)',
  }[risk];

  const dts = r1(score);
  const anginaDecides = anginaStated ? false : !sameBandEitherWay;
  if (anginaDecides) {
    return {
      valid: false,
      anginaStated: false,
      band: `Enter the exercise angina index (0 none, 1 non-limiting, 2 limiting): it is worth up to 8 `
        + `points, which puts this test between ${r1(rangeLow)} and ${dts} -- `
        + `${bandOf(rangeLow)} risk at one end and ${risk} at the other.`,
      note: 'DTS = exercise time (Bruce, min) - (5 x ST deviation in mm) - (4 x angina index: 0 none, 1 non-limiting, 2 limiting).',
    };
  }
  return {
    valid: true,
    anginaStated,
    score: dts,
    risk,
    survival,
    band: anginaStated
      ? `Duke treadmill score ${dts}: ${riskLabel}, ${survival}% 5-year survival (Mark 1987).`
      : `Duke treadmill score between ${r1(rangeLow)} and ${dts}: ${riskLabel} whatever the `
        + `angina index turns out to be, ${survival}% 5-year survival (Mark 1987).`,
    note: 'DTS = exercise time(min) - (5 x ST deviation mm) - (4 x angina index). Cited 5-year survival: low 99%, moderate 95%, high 79%. The angina index is 0 (none), 1 (non-limiting), or 2 (exercise-limiting). The score estimates prognosis; the test disposition stays with the clinician.',
  };
}

// --- 2.5 cardiacPowerOutput - Cardiac power output (Fincke 2004) -------------
// CPO = (MAP x CO) / 451 watts. The < 0.6 W threshold is the strongest
// hemodynamic correlate of mortality in cardiogenic shock. Divides only by the
// fixed nonzero constant 451; MAP and CO are clamped non-negative.
export function cardiacPowerOutput({ map, co } = {}) {
  const m = fin(map);
  const c = fin(co);
  if (m == null || c == null) {
    return {
      valid: false,
      band: 'Enter the mean arterial pressure (mmHg) and the cardiac output (L/min).',
      note: 'CPO = (MAP x cardiac output) / 451, in watts. A value < 0.6 W flags the cardiogenic-shock mortality threshold (Fincke 2004).',
    };
  }
  const mC = Math.max(0, m);
  const cC = Math.max(0, c);
  const cpo = (mC * cC) / 451;
  const belowThreshold = cpo < 0.6;
  const w = r2(cpo);
  return {
    valid: true,
    cpo: w,
    belowThreshold,
    band: belowThreshold
      ? `Cardiac power output ${w} W: below the 0.6 W cardiogenic-shock threshold (Fincke 2004).`
      : `Cardiac power output ${w} W: above the 0.6 W cardiogenic-shock threshold (Fincke 2004).`,
    note: 'CPO = (MAP x cardiac output) / 451, in watts (the constant 451 converts mmHg.L/min to watts). CPO < 0.6 W was the strongest independent hemodynamic predictor of in-hospital mortality in cardiogenic shock in the SHOCK registry. It complements, not replaces, the full hemodynamic assessment.',
  };
}

// --- 2.6 aorticValveArea - continuity-equation aortic valve area -------------
// AVA = (pi x (LVOT_d / 2)^2 x LVOT_VTI) / AV_VTI, in cm^2, with the
// dimensionless index (LVOT_VTI / AV_VTI) and the guideline severity band.
// Class B: severity cutoffs follow a revisable society guideline. Division by
// AV_VTI is guarded against zero (and a non-positive LVOT diameter) -> surfaced
// valid:false fallback, never a NaN.
export function aorticValveArea({ lvotDiameter, lvotVti, avVti } = {}) {
  const d = pos(lvotDiameter);
  const lv = pos(lvotVti);
  const av = pos(avVti);
  if (d == null || lv == null || av == null) {
    return {
      valid: false,
      band: 'Enter the LVOT diameter (cm), the LVOT VTI (cm), and the aortic-valve VTI (cm), all > 0.',
      note: 'AVA = (pi x (LVOT diameter / 2)^2 x LVOT VTI) / AV VTI, in cm^2. AV VTI must be > 0 (it is the divisor in the continuity equation).',
    };
  }
  const lvotArea = Math.PI * (d / 2) * (d / 2);
  const ava = (lvotArea * lv) / av;
  const di = lv / av;

  // Severity on the unrounded area: severe < 1.0, moderate 1.0-1.5, mild > 1.5.
  let severity; let severityLabel;
  if (ava < 1.0) { severity = 'severe'; severityLabel = 'severe aortic stenosis (AVA < 1.0 cm^2)'; }
  else if (ava <= 1.5) { severity = 'moderate'; severityLabel = 'moderate aortic stenosis (AVA 1.0-1.5 cm^2)'; }
  else { severity = 'mild'; severityLabel = 'mild aortic stenosis (AVA > 1.5 cm^2)'; }

  const avaR = r2(ava);
  const diR = r2(di);
  return {
    valid: true,
    ava: avaR,
    lvotArea: r2(lvotArea),
    di: diR,
    severity,
    severityLabel,
    band: `Aortic valve area ${avaR} cm^2: ${severityLabel}; dimensionless index ${diR}.`,
    note: 'AVA = (pi x (LVOT diameter/2)^2 x LVOT VTI) / AV VTI. Dimensionless index (DI) = LVOT VTI / AV VTI; DI < 0.25 corroborates severe stenosis and is less geometry-dependent than the absolute area. Severity bands per the ASE/EACVI 2017 echo-assessment recommendations and the 2020 ACC/AHA valvular guideline. Low-flow / low-gradient states need integrated assessment; the severity adjudication stays with the echocardiographer and the heart team.',
  };
}
