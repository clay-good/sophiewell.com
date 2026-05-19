// spec-v4 §5: Group E clinical-math extensions (utilities 117-128).
// Pure formulas; the renderers in views/group-e.js wire these to the form.

// --- 117: delta-delta ratio over the existing anion-gap formula ----------
export function deltaDelta({ anionGap, hco3, normalAg = 12, normalHco3 = 24 }) {
  const dAg = anionGap - normalAg;
  const dHco3 = normalHco3 - hco3;
  if (dHco3 === 0) return { deltaAg: dAg, deltaHco3: dHco3, ratio: null, interpretation: 'No change in HCO3.' };
  const ratio = dAg / dHco3;
  let interp;
  if (ratio < 0.4)       interp = 'Pure non-AG metabolic acidosis (low ratio).';
  else if (ratio < 1)    interp = 'Mixed AG and non-AG metabolic acidosis.';
  else if (ratio <= 2)   interp = 'Pure AG metabolic acidosis.';
  else                   interp = 'AG acidosis with concurrent metabolic alkalosis or chronic respiratory acidosis.';
  return { deltaAg: dAg, deltaHco3: dHco3, ratio, interpretation: interp };
}

// --- 119: osmolal gap ----------------------------------------------------
// Calculated osmolality (US units): 2*Na + glucose/18 + BUN/2.8 (+ EtOH/4.6)
export function osmolalGap({ measuredOsm, sodium, glucoseMgDl, bunMgDl, etohMgDl = 0 }) {
  const calculated = 2 * sodium + glucoseMgDl / 18 + bunMgDl / 2.8 + etohMgDl / 4.6;
  return { measuredOsm, calculatedOsm: calculated, gap: measuredOsm - calculated };
}

// --- 121: Winter's formula -----------------------------------------------
// Expected PaCO2 in metabolic acidosis: 1.5*HCO3 + 8 +/- 2.
export function wintersFormula({ hco3, measuredPaco2 }) {
  const expectedLow = 1.5 * hco3 + 8 - 2;
  const expectedHigh = 1.5 * hco3 + 8 + 2;
  let secondaryDisorder = null;
  if (Number.isFinite(measuredPaco2)) {
    if (measuredPaco2 > expectedHigh) secondaryDisorder = 'Concurrent respiratory acidosis (PaCO2 higher than expected).';
    else if (measuredPaco2 < expectedLow) secondaryDisorder = 'Concurrent respiratory alkalosis (PaCO2 lower than expected).';
    else secondaryDisorder = 'Appropriate respiratory compensation.';
  }
  return { expectedPaco2Low: expectedLow, expectedPaco2High: expectedHigh, secondaryDisorder };
}

// --- 122: pulse pressure & shock index -----------------------------------
export function pulsePressure({ sbp, dbp }) { return sbp - dbp; }
export function shockIndex({ hr, sbp }) { return sbp > 0 ? hr / sbp : null; }
export function modifiedShockIndex({ hr, sbp, dbp }) {
  const map = (sbp + 2 * dbp) / 3;
  return map > 0 ? hr / map : null;
}

// --- 123: body weight & BSA ---------------------------------------------
// Devine ideal body weight, kg.
export function ibwDevine({ heightInches, sex }) {
  const overFive = Math.max(0, heightInches - 60);
  if (sex === 'M') return 50 + 2.3 * overFive;
  if (sex === 'F') return 45.5 + 2.3 * overFive;
  throw new RangeError('sex must be "M" or "F"');
}
// Adjusted body weight (40% rule).
export function adjBW({ ibw, actualKg }) { return ibw + 0.4 * (actualKg - ibw); }

// --- 124: eGFR suite (MDRD; CKD-EPI 2021 and Cockcroft-Gault live in
//          lib/clinical.js already) -------------------------------------
// MDRD 4-variable, race-free (since 2021 race-removed practice). The classic
// MDRD has a race coefficient; we omit it to match contemporary lab practice.
export function egfrMdrd({ scr, age, sex }) {
  const sexFactor = sex === 'F' ? 0.742 : 1.0;
  return 175 * Math.pow(scr, -1.154) * Math.pow(age, -0.203) * sexFactor;
}

// --- 125: FENa / FEUrea --------------------------------------------------
export function feNa({ urineNa, plasmaNa, urineCr, plasmaCr }) {
  if (!(urineNa > 0 && plasmaNa > 0 && urineCr > 0 && plasmaCr > 0)) return null;
  return ((urineNa * plasmaCr) / (plasmaNa * urineCr)) * 100;
}
export function feUrea({ urineUrea, plasmaUrea, urineCr, plasmaCr }) {
  if (!(urineUrea > 0 && plasmaUrea > 0 && urineCr > 0 && plasmaCr > 0)) return null;
  return ((urineUrea * plasmaCr) / (plasmaUrea * urineCr)) * 100;
}

// --- 126: 4-2-1 maintenance fluids (mL/hr) ------------------------------
export function maintenanceFluids({ weightKg }) {
  if (!(weightKg > 0)) throw new RangeError('weightKg must be positive');
  if (weightKg <= 10) return weightKg * 4;
  if (weightKg <= 20) return 10 * 4 + (weightKg - 10) * 2;
  return 10 * 4 + 10 * 2 + (weightKg - 20) * 1;
}

// --- 127: QTc suite ------------------------------------------------------
// QT and RR (sec). HR may be supplied instead; RR = 60/HR.
function rrFromHrOrRr({ rrSec, hrBpm }) {
  if (Number.isFinite(rrSec) && rrSec > 0) return rrSec;
  if (Number.isFinite(hrBpm) && hrBpm > 0) return 60 / hrBpm;
  throw new RangeError('rrSec or hrBpm required');
}
export function qtcBazett({ qtMs, rrSec, hrBpm }) {
  const rr = rrFromHrOrRr({ rrSec, hrBpm });
  return qtMs / Math.sqrt(rr);
}
export function qtcFridericia({ qtMs, rrSec, hrBpm }) {
  const rr = rrFromHrOrRr({ rrSec, hrBpm });
  return qtMs / Math.cbrt(rr);
}
export function qtcFramingham({ qtMs, rrSec, hrBpm }) {
  const rr = rrFromHrOrRr({ rrSec, hrBpm });
  return qtMs + 154 * (1 - rr);
}
export function qtcHodges({ qtMs, rrSec, hrBpm }) {
  const hr = Number.isFinite(hrBpm) && hrBpm > 0 ? hrBpm : 60 / rrSec;
  return qtMs + 1.75 * (hr - 60);
}
export function qtcAll({ qtMs, rrSec, hrBpm }) {
  return {
    bazett: qtcBazett({ qtMs, rrSec, hrBpm }),
    fridericia: qtcFridericia({ qtMs, rrSec, hrBpm }),
    framingham: qtcFramingham({ qtMs, rrSec, hrBpm }),
    hodges: qtcHodges({ qtMs, rrSec, hrBpm }),
  };
}

// --- 128: Pregnancy dating ----------------------------------------------
function parseISO(d) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d));
  if (!m) throw new RangeError('date must be YYYY-MM-DD');
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDays(iso, days) { const d = parseISO(iso); d.setDate(d.getDate() + days); return toISO(d); }
function diffDays(a, b) { return Math.round((parseISO(a) - parseISO(b)) / 86400000); }

// EDD by Naegele = LMP + 280 days. GA today = (today - LMP) days.
export function eddFromLmp({ lmpIso, todayIso }) {
  if (!todayIso) todayIso = toISO(new Date());
  const edd = addDays(lmpIso, 280);
  const days = diffDays(todayIso, lmpIso);
  return { edd, gaDays: days, gaWeeks: Math.floor(days / 7), gaRemainderDays: days % 7 };
}

// GA from CRL (Robinson-Fleming): GA(days) ~= 8.052 * sqrt(CRL_mm * 1.037) + 23.73.
// Returns GA at the date of the ultrasound and the implied EDD.
export function gaFromCrl({ crlMm, ultrasoundDateIso }) {
  if (!(crlMm > 0)) throw new RangeError('crlMm must be positive');
  const gaDays = Math.round(8.052 * Math.sqrt(crlMm * 1.037) + 23.73);
  const today = ultrasoundDateIso || toISO(new Date());
  // EDD = US date + (280 - GA at US date).
  const edd = addDays(today, 280 - gaDays);
  return { gaDays, gaWeeks: Math.floor(gaDays / 7), gaRemainderDays: gaDays % 7, edd };
}

// Discordance flag between LMP-derived and CRL-derived GA.
export function pregnancyDiscordance({ lmpGaDays, usGaDays }) {
  const diff = Math.abs(lmpGaDays - usGaDays);
  // Trimester 1 ~ <=84 days; trimester 2 ~ 85-189; trimester 3 ~ 190+.
  const tri = lmpGaDays <= 84 ? 1 : lmpGaDays <= 189 ? 2 : 3;
  const limit = tri === 1 ? 7 : tri === 2 ? 14 : 21;
  return { differenceDays: diff, trimester: tri, discordant: diff > limit, redateThreshold: limit };
}

// --- spec-v12 wave 12-4 §3.4.1: FIB-4 Index (Sterling 2006) -----------
// FIB-4 = (age * AST) / (platelets * sqrt(ALT)).
// Sterling RK, et al. Hepatology. 2006;43(6):1317-1325. Cutoffs:
// <1.45 rules out advanced fibrosis (NPV 90%); >3.25 rules in advanced
// fibrosis (PPV 65%); 1.45-3.25 indeterminate.
export function fib4({ ageYears, ast, alt, plateletsK }) {
  const age = Number(ageYears);
  const a = Number(ast);
  const l = Number(alt);
  const p = Number(plateletsK);
  if (!(age > 0)) throw new RangeError('ageYears must be positive');
  if (!(a > 0)) throw new RangeError('ast must be positive');
  if (!(l > 0)) throw new RangeError('alt must be positive');
  if (!(p > 0)) throw new RangeError('plateletsK must be positive');
  const score = (age * a) / (p * Math.sqrt(l));
  let band;
  if (score < 1.45) band = 'FIB-4 <1.45: rules out advanced fibrosis (NPV 90% per Sterling 2006).';
  else if (score > 3.25) band = 'FIB-4 >3.25: rules in advanced fibrosis (PPV 65% per Sterling 2006).';
  else band = 'FIB-4 1.45-3.25: indeterminate; consider further evaluation per Sterling 2006.';
  return { score, band };
}

// --- spec-v12 wave 12-4 §3.4.2: APRI (Wai 2003) -----------------------
// APRI = ((AST / AST_ULN) * 100) / platelets (x10^9/L).
// Wai CT, et al. Hepatology. 2003;38(2):518-526. Cutoffs: >0.7 predicts
// significant fibrosis; >1.0 predicts cirrhosis. WHO 2014 HCV guideline
// endorses these for resource-limited settings.
export function apri({ ast, astUln, plateletsK }) {
  const a = Number(ast);
  const u = Number(astUln);
  const p = Number(plateletsK);
  if (!(a > 0)) throw new RangeError('ast must be positive');
  if (!(u > 0)) throw new RangeError('astUln must be positive');
  if (!(p > 0)) throw new RangeError('plateletsK must be positive');
  const score = ((a / u) * 100) / p;
  let band;
  if (score > 1.0) band = 'APRI >1.0: predicts cirrhosis per Wai 2003 (WHO 2014 HCV guideline endorsement).';
  else if (score > 0.7) band = 'APRI >0.7: predicts significant fibrosis per Wai 2003 (WHO 2014 HCV guideline endorsement).';
  else band = 'APRI <=0.7: below the Wai 2003 significant-fibrosis cutoff.';
  return { score, band };
}

// --- spec-v13 wave 13-5 §3.5.1: ROX Index (Roca 2019) ----------------
// ROX = (SpO2 / FiO2) / RR. Cutoffs at 2/6/12 hours predict HFNC
// success vs failure per Roca 2019 §Results.
export function rox({ spo2, fio2, rr, hoursAfterStart = 12 }) {
  const s = Number(spo2);
  const f = Number(fio2);
  const r = Number(rr);
  if (!(s > 0 && s <= 100)) throw new RangeError('spo2 must be between 0 and 100');
  if (!(f > 0 && f <= 1)) throw new RangeError('fio2 must be between 0 and 1');
  if (!(r > 0)) throw new RangeError('rr must be positive');
  const score = (s / f) / r;
  // Roca 2019 Figure 2 cutoffs: success cutoff >=4.88 at 2/6/12 h;
  // failure cutoffs <2.85 at 2 h, <3.47 at 6 h, <3.85 at 12 h.
  const hr = Number(hoursAfterStart);
  let failureCut;
  if (hr <= 2) failureCut = 2.85;
  else if (hr <= 6) failureCut = 3.47;
  else failureCut = 3.85;
  let band;
  if (score >= 4.88) band = `ROX ${score.toFixed(2)}: success-predicting (>=4.88 per Roca 2019).`;
  else if (score < failureCut) band = `ROX ${score.toFixed(2)}: failure-predicting at ${hr}h (<${failureCut} per Roca 2019 Figure 2); consider escalation.`;
  else band = `ROX ${score.toFixed(2)}: indeterminate at ${hr}h (between ${failureCut} and 4.88 per Roca 2019); reassess.`;
  return { score, band };
}

// --- spec-v13 wave 13-6 §3.6.1: Vasoactive-Inotropic Score (Gaies 2010) ---
// VIS = dopamine + dobutamine + 100*epi + 100*norepi + 10*milrinone +
// 10000*vasopressin. Inputs in mcg/kg/min (vaso in units/kg/min).
// Also returns the simpler IS (dopamine + dobutamine + 100*epi) per
// Wernovsky 1995.
export function vis({ dopamine = 0, dobutamine = 0, epinephrine = 0,
  norepinephrine = 0, milrinone = 0, vasopressin = 0 }) {
  const d = Number(dopamine) || 0;
  const db = Number(dobutamine) || 0;
  const e = Number(epinephrine) || 0;
  const ne = Number(norepinephrine) || 0;
  const m = Number(milrinone) || 0;
  const v = Number(vasopressin) || 0;
  const visScore = d + db + 100 * e + 100 * ne + 10 * m + 10000 * v;
  const isScore = d + db + 100 * e;
  let band;
  if (visScore >= 20) band = `VIS ${visScore.toFixed(1)}: high vasoactive load per Gaies 2010 (>=20 associated with increased morbidity / mortality in the post-CPB cohort).`;
  else if (visScore >= 10) band = `VIS ${visScore.toFixed(1)}: moderate vasoactive load per Gaies 2010 Table 2.`;
  else band = `VIS ${visScore.toFixed(1)}: low vasoactive load per Gaies 2010 Table 2.`;
  return { vis: visScore, is: isScore, band };
}
