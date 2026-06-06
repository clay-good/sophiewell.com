// spec-v56: weight-based dosing, infusion titration, and bedside toxicology.
// Pure functions only. Citations live inline in lib/meta.js and in
// docs/clinical-citations.md; renderers in views/group-v8.js wire these to the
// home grid. r1/r2/r3, num, fmt come from lib/num.js (spec-v53 §4.1) -- no
// re-declaration. Every division denominator is guarded: a non-positive or
// conditions-invalid denominator returns null so the renderer shows a fmt()
// fallback, never NaN/Infinity/undefined (spec-v53 §3). Two tiles
// (acetaminophen-nomogram, aminoglycoside) REFUSE outside their validity window
// rather than return a misleading number (spec-v56 §3): they throw a RangeError
// the renderer's safe() wrapper surfaces as a plain message.
//
// Every tile here is dosing decision-support, not a prescription. The renderer
// carries the standing medication notice (spec-v56 §3).

import { r1, r2, r3, num } from './num.js';

// --- 2.1 heparin-nomogram: weight-based heparin infusion (Raschke 1993) ------
// Initial dosing by indication, then the Raschke weight-based nomogram step for
// the entered aPTT. Raschke RA, et al. Ann Intern Med 1993;119(9):874-881.
// VTE: 80 u/kg bolus + 18 u/kg/h. ACS (per ACC/AHA UA/NSTEMI): 60 u/kg bolus
// (max 4000 u) + 12 u/kg/h (max 1000 u/h). Bolus weight capped at 150 kg with a
// surfaced note so total-body-weight math cannot silently over-dose.
const HEPARIN_WEIGHT_CAP = 150; // kg, documented bolus/rate ceiling.
// Raschke nomogram bands keyed to aPTT seconds (assumes a control aPTT whose
// therapeutic range is ~46-70 s / 1.5-2.3x control; bands are the published
// figure). Each band: { test, rebolusUkg, rateChangeUkgH, hold, label }.
const RASCHKE_BANDS = [
  { max: 35,       rebolusUkg: 80, rateUkgH: 4,  hold: false, label: 'aPTT <35 s: rebolus 80 u/kg, increase rate 4 u/kg/h' },
  { max: 45,       rebolusUkg: 40, rateUkgH: 2,  hold: false, label: 'aPTT 35-45 s: rebolus 40 u/kg, increase rate 2 u/kg/h' },
  { max: 70,       rebolusUkg: 0,  rateUkgH: 0,  hold: false, label: 'aPTT 46-70 s: therapeutic, no change' },
  { max: 90,       rebolusUkg: 0,  rateUkgH: -2, hold: false, label: 'aPTT 71-90 s: decrease rate 2 u/kg/h' },
  { max: Infinity, rebolusUkg: 0,  rateUkgH: -3, hold: true,  label: 'aPTT >90 s: hold 1 h, then decrease rate 3 u/kg/h' },
];
export function heparinNomogram({ weightKg, indication = 'vte', aptt = null }) {
  num('weightKg', weightKg, { min: 1, max: 400 });
  const capped = weightKg > HEPARIN_WEIGHT_CAP;
  const dw = Math.min(weightKg, HEPARIN_WEIGHT_CAP);
  let bolusUkg; let rateUkgH; let bolusCap; let rateCap;
  if (indication === 'acs') { bolusUkg = 60; rateUkgH = 12; bolusCap = 4000; rateCap = 1000; }
  else { bolusUkg = 80; rateUkgH = 18; bolusCap = Infinity; rateCap = Infinity; }
  const initialBolus = Math.min(Math.round(dw * bolusUkg), bolusCap);
  const initialRate = Math.min(Math.round(dw * rateUkgH), rateCap);
  let titration = null;
  if (aptt != null) {
    num('aptt', aptt, { min: 1, max: 400 });
    const band = RASCHKE_BANDS.find((b) => aptt <= b.max);
    titration = {
      label: band.label,
      rebolusUnits: Math.round(dw * band.rebolusUkg),
      rateChangeUnitsH: Math.round(dw * band.rateUkgH),
      hold: band.hold,
      recheckHours: 6,
    };
  }
  return {
    indication,
    weightCapped: capped,
    initialBolusUnits: initialBolus,
    initialRateUnitsH: initialRate,
    initialRateUkgH: rateUkgH,
    titration,
  };
}

// --- 2.2 vanc-auc: first-order two-level AUC24/MIC ---------------------------
// Sawchuk-Zaske first-order two-level method endorsed by Rybak MJ, et al.
// (ASHP/IDSA/PIDS/SIDP) Am J Health-Syst Pharm 2020;77(11):835-864. NOT
// Bayesian. Both draw times are hours AFTER the end of the infusion.
// k = ln(peak/trough) / (t_trough - t_peak). Extrapolate Cmax (infusion end)
// and Cmin (interval end); AUC over tau = elimination-phase + infusion-phase
// trapezoid; AUC24 = AUC_tau * 24/tau. Target AUC24/MIC 400-600.
export function vancAuc({ peak, trough, tPeak, tTrough, tInf, tau, mic }) {
  num('peak', peak, { min: 0.1, max: 200 });
  num('trough', trough, { min: 0.01, max: 200 });
  num('tPeak', tPeak, { min: 0, max: 48 });
  num('tTrough', tTrough, { min: 0, max: 48 });
  num('tInf', tInf, { min: 0.1, max: 12 });
  num('tau', tau, { min: 1, max: 48 });
  num('mic', mic, { min: 0.1, max: 16 });
  if (peak <= trough) throw new RangeError('peak must exceed trough');
  if (tTrough <= tPeak) throw new RangeError('trough draw time must be after peak draw time');
  if (tTrough > tau - tInf) throw new RangeError('trough must be drawn within the dosing interval');
  const k = Math.log(peak / trough) / (tTrough - tPeak);
  const halfLife = Math.log(2) / k;
  const cMax = peak * Math.exp(k * tPeak);          // back to end of infusion
  const cMin = trough * Math.exp(-k * (tau - tInf - tTrough)); // forward to interval end
  const aucElim = (cMax - cMin) / k;
  const aucInf = tInf * (cMax + cMin) / 2;          // rising-phase trapezoid
  const aucTau = aucElim + aucInf;
  const auc24 = aucTau * (24 / tau);
  const ratio = auc24 / mic;
  let band;
  if (ratio < 400) band = 'AUC24/MIC <400: sub-therapeutic, consider increasing dose';
  else if (ratio <= 600) band = 'AUC24/MIC 400-600: within target';
  else band = 'AUC24/MIC >600: supratherapeutic, nephrotoxicity risk, reduce dose';
  return {
    k: r3(k), halfLife: r1(halfLife),
    cMax: r1(cMax), cMin: r1(cMin),
    auc24: Math.round(auc24), aucMicRatio: Math.round(ratio), band,
  };
}

// --- 2.3 aminoglycoside: extended-interval (Hartford) ------------------------
// Nicolau DP, et al. Antimicrob Agents Chemother 1995;39(3):650-655.
// Dose: gentamicin/tobramycin 7 mg/kg, amikacin 15 mg/kg on the entered dosing
// weight. The Hartford concentration-vs-time *graph* is a proprietary figure
// that cannot be reproduced as a closed form under the spec-v11 correctness
// floor; this tile therefore sets the starting interval from CrCl (the
// validated extended-interval surrogate) and tells the nurse to plot the single
// random level on the institution's printed nomogram. REFUSES (throws) for
// dialysis or CrCl <20 -- extended-interval dosing is not validated there.
const AMINOGLYCOSIDE_MGKG = { gentamicin: 7, tobramycin: 7, amikacin: 15 };
export function aminoglycoside({ drug = 'gentamicin', weightKg, crCl, dialysis = false }) {
  num('weightKg', weightKg, { min: 1, max: 400 });
  num('crCl', crCl, { min: 0, max: 250 });
  const mgkg = AMINOGLYCOSIDE_MGKG[drug];
  if (mgkg === undefined) throw new RangeError('drug must be gentamicin, tobramycin, or amikacin');
  if (dialysis) throw new RangeError('Dialysis: extended-interval dosing not validated -- consult pharmacy for individualized dosing.');
  if (crCl < 20) throw new RangeError('CrCl <20 mL/min: extended-interval dosing not validated -- consult pharmacy.');
  const doseMg = Math.round(weightKg * mgkg);
  let interval;
  if (crCl >= 60) interval = 'q24h';
  else if (crCl >= 40) interval = 'q36h';
  else interval = 'q48h';
  return { drug, doseMg, mgkg, interval };
}

// --- 2.4 acetaminophen-nomogram: Rumack-Matthew interpreter ------------------
// Rumack BH, Matthew H. Pediatrics 1975;55(6):871-876. U.S. treatment line:
// 150 ug/mL at 4 h, declining with a 4-h half-life: C_line(t) = 150 * 0.5^((t-4)/4).
// Valid ONLY for a single acute ingestion with a KNOWN time, level drawn >=4 h.
// REFUSES (throws) outside 4-24 h -- the nomogram does not apply.
export function acetaminophenNomogram({ hours, levelUgMl }) {
  num('hours', hours, { min: 4, max: 24 });
  num('levelUgMl', levelUgMl, { min: 0, max: 2000 });
  const treatmentLine = 150 * Math.pow(0.5, (hours - 4) / 4);
  const aboveLine = levelUgMl >= treatmentLine;
  return {
    treatmentLine: r1(treatmentLine),
    aboveLine,
    interpretation: aboveLine
      ? 'At or above the treatment line: NAC (acetylcysteine) indicated by the nomogram.'
      : 'Below the treatment line: NAC not indicated by the nomogram for a single acute ingestion.',
  };
}

// --- 2.5 digoxin: maintenance guidance + level interpretation ----------------
// ACC/AHA/HFSA 2022 HF guideline (Heidenreich, Circulation 2022;145(18)): HF
// digoxin level target 0.5-0.9 ng/mL. Maintenance dosing varies too widely to
// emit a fabricated mg value under the correctness floor, so the tile returns a
// renal/age-categorical recommendation and interprets the entered level.
export function digoxin({ crCl, ageYears = null, indication = 'hf', levelNgMl = null, hoursPostDose = null }) {
  num('crCl', crCl, { min: 0, max: 250 });
  const elderly = ageYears != null && ageYears >= 70;
  let doseGuidance;
  if (crCl < 30 || elderly) {
    doseGuidance = 'Reduced clearance (CrCl <30 or age >=70): typical maintenance 0.0625-0.125 mg PO daily; monitor level.';
  } else if (crCl < 50) {
    doseGuidance = 'CrCl 30-49: typical maintenance 0.125 mg PO daily.';
  } else {
    doseGuidance = 'Normal clearance: typical maintenance 0.125-0.25 mg PO daily.';
  }
  let levelInterp = null;
  let timingWarn = false;
  if (levelNgMl != null) {
    num('levelNgMl', levelNgMl, { min: 0, max: 20 });
    const target = indication === 'hf' ? '0.5-0.9 ng/mL (HF)' : '0.8-2.0 ng/mL (rate control)';
    if (levelNgMl > 2.0) levelInterp = `Level ${r2(levelNgMl)} ng/mL: >2.0, toxic range; hold and assess for toxicity. Target ${target}.`;
    else if (indication === 'hf' && levelNgMl > 0.9) levelInterp = `Level ${r2(levelNgMl)} ng/mL: above the HF target ${target}; no added benefit, higher toxicity risk.`;
    else if (levelNgMl < 0.5) levelInterp = `Level ${r2(levelNgMl)} ng/mL: below ${target}.`;
    else levelInterp = `Level ${r2(levelNgMl)} ng/mL: within ${target}.`;
    if (hoursPostDose != null) {
      num('hoursPostDose', hoursPostDose, { min: 0, max: 48 });
      if (hoursPostDose < 6) timingWarn = true;
    }
  }
  return { doseGuidance, levelInterp, timingWarn };
}

// --- 2.6 local-anesthetic-max: maximum dose by agent -------------------------
// Neal JM, et al. (ASRA practice advisory on LAST). Reg Anesth Pain Med
// 2018;43(2):113-123. Per-agent mg/kg ceiling and an absolute total-dose cap;
// the tile uses the LOWER of weight-based and absolute. Weight capped at 100 kg
// so total-body-weight math cannot over-dose the obese patient.
const LA_AGENTS = {
  'lidocaine':       { mgkg: 4.5, absMax: 300, label: 'Lidocaine (plain)' },
  'lidocaine-epi':   { mgkg: 7.0, absMax: 500, label: 'Lidocaine with epinephrine' },
  'bupivacaine':     { mgkg: 2.5, absMax: 175, label: 'Bupivacaine (plain)' },
  'bupivacaine-epi': { mgkg: 3.0, absMax: 225, label: 'Bupivacaine with epinephrine' },
  'ropivacaine':     { mgkg: 3.0, absMax: 200, label: 'Ropivacaine' },
};
const LA_WEIGHT_CAP = 100; // kg
export function localAnestheticMax({ agent = 'lidocaine', weightKg, concPct }) {
  num('weightKg', weightKg, { min: 1, max: 400 });
  num('concPct', concPct, { min: 0.01, max: 10 });
  const a = LA_AGENTS[agent];
  if (!a) throw new RangeError('unknown local anesthetic agent');
  const dw = Math.min(weightKg, LA_WEIGHT_CAP);
  const weightBased = dw * a.mgkg;
  const maxDoseMg = Math.min(weightBased, a.absMax);
  const mgPerMl = concPct * 10; // 1% w/v = 10 mg/mL
  const maxVolMl = maxDoseMg / mgPerMl;
  return {
    label: a.label,
    weightCapped: weightKg > LA_WEIGHT_CAP,
    capBinds: a.absMax < weightBased,
    maxDoseMg: r1(maxDoseMg),
    mgPerMl: r1(mgPerMl),
    maxVolMl: r1(maxVolMl),
  };
}

// --- 2.7 mgso4-preeclampsia: magnesium sulfate infusion ----------------------
// ACOG Practice Bulletin 222 (2020) / Magpie Trial (Lancet 2002;359(9321):
// 1877-1890). Load 4-6 g over 20-30 min, maintenance 1-2 g/h. Renal impairment
// halves the maintenance default with a warning. Bag concentration in g/mL
// (a 40 g/L premix = 0.04 g/mL).
export function mgso4Preeclampsia({ loadG = 4, maintGPerH = 2, concGPerMl, renalImpairment = false }) {
  num('loadG', loadG, { min: 1, max: 10 });
  num('maintGPerH', maintGPerH, { min: 0.5, max: 4 });
  num('concGPerMl', concGPerMl, { min: 0.001, max: 0.5 });
  const effectiveMaint = renalImpairment ? maintGPerH / 2 : maintGPerH;
  const loadVolMl = loadG / concGPerMl;
  const maintRateMlH = effectiveMaint / concGPerMl;
  return {
    loadG,
    loadVolMl: r1(loadVolMl),
    maintGPerH: r1(effectiveMaint),
    maintRateMlH: r1(maintRateMlH),
    renalImpairment,
  };
}

// --- 2.8 pca-pump: settings + hourly-maximum guardrail -----------------------
// ISMP safe-PCA guidance / ASPMN (no PCA-by-proxy). Max demand doses per hour =
// 60 / lockout(min). Max hourly delivered (mg) = demandMg * dosesPerHr +
// basalMgPerH. Flags when a programmed 1-h limit is inconsistent with the
// lockout-derived maximum.
export function pcaPump({ concMgPerMl, demandMg, lockoutMin, basalMgPerH = 0, oneHourLimitMg = null }) {
  num('concMgPerMl', concMgPerMl, { min: 0.001, max: 100 });
  num('demandMg', demandMg, { min: 0, max: 100 });
  num('lockoutMin', lockoutMin, { min: 1, max: 120 });
  num('basalMgPerH', basalMgPerH, { min: 0, max: 100 });
  const dosesPerHour = Math.floor(60 / lockoutMin);
  const maxDemandMg = demandMg * dosesPerHour;
  const maxHourlyMg = maxDemandMg + basalMgPerH;
  const demandVolMl = demandMg / concMgPerMl;
  let limitNote = null;
  if (oneHourLimitMg != null) {
    num('oneHourLimitMg', oneHourLimitMg, { min: 0, max: 1000 });
    if (oneHourLimitMg >= maxHourlyMg) limitNote = '1-h limit is at or above the lockout-derived maximum: it never binds (no extra protection).';
    else limitNote = `1-h limit (${r2(oneHourLimitMg)} mg) binds below the lockout-derived maximum (${r2(maxHourlyMg)} mg).`;
  }
  return {
    dosesPerHour,
    maxDemandMg: r2(maxDemandMg),
    maxHourlyMg: r2(maxHourlyMg),
    demandVolMl: r2(demandVolMl),
    limitNote,
  };
}

// --- 2.9 sugammadex: reversal dose by depth of block -------------------------
// Bridion (sugammadex) U.S. prescribing information. ACTUAL body weight per
// label: 2 mg/kg at reappearance of T2, 4 mg/kg at 1-2 post-tetanic counts,
// 16 mg/kg for immediate reversal after rocuronium. 100 mg/mL.
const SUGAMMADEX_MGKG = { t2: 2, ptc: 4, immediate: 16 };
const SUGAMMADEX_CONC = 100; // mg/mL
export function sugammadex({ weightKg, depth = 't2' }) {
  num('weightKg', weightKg, { min: 1, max: 400 });
  const mgkg = SUGAMMADEX_MGKG[depth];
  if (mgkg === undefined) throw new RangeError('depth must be t2, ptc, or immediate');
  const doseMg = Math.round(weightKg * mgkg);
  const volMl = doseMg / SUGAMMADEX_CONC;
  return { mgkg, doseMg, volMl: r1(volMl) };
}

// --- 2.10 ketamine-propofol: procedural sedation dosing ----------------------
// ACEP clinical policy on procedural sedation (Ann Emerg Med 2014;63(2):
// 247-258). Ketamine 1-2 mg/kg IV (50 mg/mL); propofol 0.5-1 mg/kg IV
// (10 mg/mL); ketofol per institutional 1:1 mix. Initial dose + re-dose
// increment; no infusion automation.
const PROC_AGENTS = {
  ketamine: { conc: 50, redoseFraction: 0.5, label: 'Ketamine' },
  propofol: { conc: 10, redoseFraction: 0.5, label: 'Propofol' },
  ketofol:  { conc: 5,  redoseFraction: 0.5, label: 'Ketofol (1:1 ketamine/propofol, 5 mg/mL each)' },
};
export function ketaminePropofol({ agent = 'ketamine', weightKg, mgkg }) {
  num('weightKg', weightKg, { min: 1, max: 400 });
  num('mgkg', mgkg, { min: 0.1, max: 5 });
  const a = PROC_AGENTS[agent];
  if (!a) throw new RangeError('agent must be ketamine, propofol, or ketofol');
  const doseMg = weightKg * mgkg;
  const volMl = doseMg / a.conc;
  const redoseMg = doseMg * a.redoseFraction;
  return {
    label: a.label,
    doseMg: r1(doseMg),
    volMl: r2(volMl),
    redoseMg: r1(redoseMg),
  };
}

// --- 2.11 peds-fluid-deficit: dehydration deficit + maintenance --------------
// Holliday MA, Segar WE. Pediatrics 1957;19(5):823-832 (4-2-1 maintenance).
// Deficit (mL) = % dehydration * weight(kg) * 10. Replacement: 1/2 over the
// first 8 h, 1/2 over the next 16 h, each on top of maintenance.
export function pedsFluidDeficit({ weightKg, dehydrationPct }) {
  num('weightKg', weightKg, { min: 0.5, max: 100 });
  num('dehydrationPct', dehydrationPct, { min: 0, max: 20 });
  // 4-2-1 hourly maintenance.
  let maintPerH;
  if (weightKg <= 10) maintPerH = 4 * weightKg;
  else if (weightKg <= 20) maintPerH = 40 + 2 * (weightKg - 10);
  else maintPerH = 60 + 1 * (weightKg - 20);
  const deficitMl = dehydrationPct * weightKg * 10;
  const first8hRate = maintPerH + (deficitMl / 2) / 8;
  const next16hRate = maintPerH + (deficitMl / 2) / 16;
  return {
    maintPerH: r1(maintPerH),
    deficitMl: Math.round(deficitMl),
    first8hRateMlH: r1(first8hRate),
    next16hRateMlH: r1(next16hRate),
  };
}

// --- 2.12 peds-resus: resuscitation bolus -----------------------------------
// AHA Pediatric Advanced Life Support (PALS), 2020 (Circulation 2020;142(16
// suppl 2)). Isotonic bolus 10-20 mL/kg, reassess after each; 10 mL/kg in
// suspected cardiac/DKA contexts. Weight capped at adult (typical adult bolus).
const PEDS_RESUS_WEIGHT_CAP = 50; // kg -> adult dosing beyond this
export function pedsResus({ weightKg, mlPerKg = 20, context = 'sepsis' }) {
  num('weightKg', weightKg, { min: 0.5, max: 150 });
  num('mlPerKg', mlPerKg, { min: 5, max: 20 });
  const dw = Math.min(weightKg, PEDS_RESUS_WEIGHT_CAP);
  const bolusMl = Math.round(dw * mlPerKg);
  const cardiacCautionFlag = context === 'cardiac-dka' && mlPerKg > 10;
  return {
    bolusMl,
    weightCapped: weightKg > PEDS_RESUS_WEIGHT_CAP,
    cardiacCautionFlag,
    context,
  };
}

// --- 2.13 conc-percent: concentration <-> percent <-> ratio ------------------
// USP conventions: 1% w/v = 10 mg/mL; ratio 1:X (g per X mL) -> mg/mL = 1000/X.
// Enter any one representation; the other two are returned.
export function concPercent({ mode, value }) {
  num('value', value, { min: 1e-9, max: 1e9 });
  let mgPerMl;
  if (mode === 'percent') mgPerMl = value * 10;       // % w/v -> mg/mL
  else if (mode === 'mgml') mgPerMl = value;          // mg/mL given
  else if (mode === 'ratio') mgPerMl = 1000 / value;  // 1:value -> mg/mL
  else throw new RangeError('mode must be percent, mgml, or ratio');
  const pct = mgPerMl / 10;
  const ratioX = 1000 / mgPerMl;
  return {
    mgPerMl: r3(mgPerMl),
    percent: r3(pct),
    ratio: r1(ratioX),
  };
}
