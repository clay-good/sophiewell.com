// spec-v61 §3: twelve deterministic, bedside-necessary nursing computations
// that fill confirmed medication-safety, electrolyte/fluid, and OB/peds gaps.
// Pure functions only. Citations live inline in lib/meta.js; renderers in
// views/group-v11.js wire these to the home grid.
//
// Contract (spec-v59 / spec-v53): every numeric field is validated through
// num() (lib/num.js), so a missing/non-finite/out-of-range value throws a
// TypeError/RangeError (caught by the renderer safe() wrapper) rather than
// producing NaN/Infinity. Every division guards its denominator -> returns
// null -> fmt() fallback at the render site. Every band/note string routes
// interpolated numbers through fmt(), so no banned token reaches the DOM
// (spec-v59 §2.6 object-aware fuzz). Each dosing/replacement tile is an
// estimate, not an order; the renderer prints the "verify per local protocol"
// note (spec-v61 §4).

import { num, r1, r2 } from './num.js';

const B = (v) => v === true || v === 1 || v === '1' || v === 'true';

// --- 3.1 urine-output — KDIGO urine-output rate + oliguria flag --------------
// rate (mL/kg/hr) = total volume / (interval hours x weight). KDIGO 2012
// urine-output AKI criteria are duration-dependent (<0.5 mL/kg/hr for 6-12 h =
// Stage 1/2; <0.3 for 24 h, or anuria 12 h = Stage 3). This returns the hourly
// rate and names which threshold the rate crosses; it does not track duration.
export function urineOutput({ volumeMl, intervalHr, weightKg }) {
  num('volumeMl', volumeMl, { min: 0 });
  num('intervalHr', intervalHr, { min: 0 });
  num('weightKg', weightKg, { min: 0 });
  if (intervalHr <= 0 || weightKg <= 0) return null;
  const rate = volumeMl / (intervalHr * weightKg);
  let band;
  if (rate >= 0.5) band = 'At or above 0.5 mL/kg/hr — above the KDIGO oliguria threshold.';
  else if (rate >= 0.3) band = 'Below 0.5 mL/kg/hr — oliguria; meets the KDIGO Stage 1/2 urine-output criterion if sustained 6-12 h.';
  else band = 'Below 0.3 mL/kg/hr — meets the KDIGO Stage 3 urine-output criterion if sustained 24 h (or anuria 12 h).';
  return {
    rate: r2(rate),
    oliguria: rate < 0.5,
    band,
    note: 'KDIGO urine-output staging is duration-dependent; this is the hourly rate, not a stage. Read it with the trend, not a single hour.',
  };
}

// --- 3.2 gir — Glucose Infusion Rate (mg/kg/min) -----------------------------
// GIR = (rate mL/hr x dextrose g/100mL x 1000 mg/g) / (60 min/hr x weight kg)
//     = (rate x dextrose%) / (6 x weight). Typical neonatal target 4-8
// mg/kg/min; >12 prompts review (Kalhan 1999).
export function gir({ dextrosePct, rateMlHr, weightKg }) {
  num('dextrosePct', dextrosePct, { min: 0, max: 100 });
  num('rateMlHr', rateMlHr, { min: 0 });
  num('weightKg', weightKg, { min: 0 });
  if (weightKg <= 0) return null;
  const value = (rateMlHr * dextrosePct) / (6 * weightKg);
  let band;
  if (value < 4) band = 'Below the typical 4-8 mg/kg/min neonatal target range.';
  else if (value <= 8) band = 'Within the typical 4-8 mg/kg/min neonatal target range.';
  else if (value <= 12) band = 'Above the typical target (8-12 mg/kg/min); confirm the order.';
  else band = 'Above 12 mg/kg/min — review the order and check for hyperglycemia.';
  return { gir: r2(value), band, note: 'Confirm GIR before titrating dextrose; targets are unit- and gestational-age-specific.' };
}

// --- 3.3 ebv-mabl — estimated blood volume + maximum allowable blood loss ----
// EBV = weight x EBV factor (mL/kg, age/sex-banded). MABL = EBV x
// (startHct - minHct) / startHct (Gross 1983, linear dilution).
export function ebvMabl({ weightKg, ebvFactor, startHct, minHct }) {
  num('weightKg', weightKg, { min: 0 });
  num('ebvFactor', ebvFactor, { min: 1, max: 120 });
  num('startHct', startHct, { min: 0, max: 100 });
  num('minHct', minHct, { min: 0, max: 100 });
  if (weightKg <= 0 || startHct <= 0) return null;
  if (minHct > startHct) throw new RangeError('minimum acceptable Hct must be <= starting Hct');
  const ebv = weightKg * ebvFactor;
  const mabl = ebv * (startHct - minHct) / startHct;
  return {
    ebv: Math.round(ebv),
    mabl: Math.round(mabl),
    note: 'A planning estimate for the transfusion-threshold conversation, not a transfusion trigger; chase the patient, the labs, and local protocol.',
  };
}

// --- 3.4 corrected-phenytoin — albumin-corrected phenytoin (Sheiner-Tozer) ---
// corrected = measured / (adjust x albumin + 0.1). adjust = 0.2 normally,
// 0.1 for CrCl<10 / ESRD (Winter-Tozer). Therapeutic total range 10-20 µg/mL.
export function correctedPhenytoin({ measured, albumin, esrd }) {
  num('measured', measured, { min: 0 });
  num('albumin', albumin, { min: 0 });
  const adjust = B(esrd) ? 0.1 : 0.2;
  const denom = adjust * albumin + 0.1;
  if (denom <= 0) return null;
  const corrected = measured / denom;
  let band;
  if (corrected < 10) band = 'Corrected level below the 10-20 µg/mL therapeutic range.';
  else if (corrected <= 20) band = 'Corrected level within the 10-20 µg/mL therapeutic range.';
  else band = 'Corrected level above the 10-20 µg/mL therapeutic range — watch for toxicity.';
  return {
    corrected: r1(corrected),
    band,
    note: B(esrd)
      ? 'Renal-adjusted variant (CrCl<10 / ESRD) applied. A free (unbound) phenytoin level is the definitive test where available.'
      : 'A free (unbound) phenytoin level is the definitive test where available; this corrects the total level for hypoalbuminemia only.',
  };
}

// --- 3.5 potassium-deficit — total-body K deficit + replacement guidance -----
// Coarse bedside estimate: ~10 mEq total-body deficit per 0.1 mEq/L the serum
// K is below target, i.e. deficit ≈ (target - serum K) x 100. A planning aid
// only; serum K is a poor proxy for total-body stores (Kruse-Carlson 1990).
export function potassiumDeficit({ serumK, weightKg, targetK }) {
  num('serumK', serumK, { min: 0, max: 10 });
  num('weightKg', weightKg, { min: 0 });
  num('targetK', targetK, { min: 0, max: 10 });
  if (serumK >= targetK) {
    return { deficit: 0, band: 'Serum K is at or above target — no deficit by this estimate.', note: 'Estimate only; replace per local protocol with a monitored infusion and recheck.' };
  }
  const deficit = Math.round((targetK - serumK) * 100);
  return {
    deficit,
    band: `Approximate total-body deficit ${fmtInt(deficit)} mEq toward a target of ${r1(targetK)} mEq/L.`,
    note: `Coarse estimate for a ~${r1(weightKg)} kg adult and a planning aid only — serum K underestimates total-body stores. Peripheral KCl is typically capped at 10 mEq/hr (higher only on a monitor via a central line); replace per local protocol and recheck.`,
  };
}

// --- 3.6 magnesium-replacement — MgSO4 repletion estimate --------------------
// Banded MgSO4 dose range by severity (Tong-Rude 2005). severity: 1 mild,
// 2 moderate, 3 severe. serum Mg is context for the bounds advisory.
export function magnesiumReplacement({ serumMg, severity }) {
  num('serumMg', serumMg, { min: 0, max: 10 });
  num('severity', severity, { min: 1, max: 3 });
  const bands = {
    1: { low: 1, high: 2, label: 'Mild (serum Mg ~1.4-1.8 mg/dL)' },
    2: { low: 2, high: 4, label: 'Moderate (serum Mg ~1.0-1.4 mg/dL)' },
    3: { low: 4, high: 8, label: 'Severe (serum Mg <1.0 mg/dL)' },
  };
  const b = bands[Math.round(severity)];
  if (!b) return null;
  return {
    doseLow: b.low,
    doseHigh: b.high,
    band: `${b.label}: ${fmtInt(b.low)}-${fmtInt(b.high)} g magnesium sulfate IV.`,
    note: 'Estimate only; infuse no faster than ~1 g over 5-60 min per severity and local protocol. Arrhythmia and eclampsia prophylaxis are governed by their own protocols (see mgso4-preeclampsia).',
  };
}

// --- 3.7 rhig-dose — Rh immune globulin dose from fetomaternal hemorrhage -----
// FMH (mL fetal whole blood) = maternal blood volume x fetal-cell %. One
// standard 300 µg vial covers 30 mL fetal whole blood. AABB convention: round
// the quotient (>=0.5 up, else down) then add one vial for safety.
export function rhigDose({ maternalBloodVolumeMl, fetalCellPct }) {
  num('maternalBloodVolumeMl', maternalBloodVolumeMl, { min: 0 });
  num('fetalCellPct', fetalCellPct, { min: 0, max: 100 });
  const fmh = maternalBloodVolumeMl * (fetalCellPct / 100);
  const quotient = fmh / 30;
  const whole = Math.floor(quotient);
  const rounded = (quotient - whole) >= 0.5 ? whole + 1 : whole;
  const vials = rounded + 1;
  return {
    fmhMl: r1(fmh),
    vials,
    band: `${fmtInt(vials)} standard 300 µg vial(s): FMH ${fmtNum(r1(fmh))} mL / 30 mL/vial, rounded, plus one for safety.`,
    note: 'Estimate from the Kleihauer-Betke %; confirm with the blood bank. Maternal blood volume defaults to ~5000 mL when not entered from weight.',
  };
}

// --- 3.8 peds-transfusion-volume — pediatric/neonatal PRBC volume ------------
// volume (mL) = (desired Hb rise x weight x 3) / product-Hct fraction
// (New 2016 / BCSH). At product Hct ~0.6 this lands in the 10-15 mL/kg band.
export function pedsTransfusionVolume({ weightKg, hbRise, productHctPct }) {
  num('weightKg', weightKg, { min: 0 });
  num('hbRise', hbRise, { min: 0 });
  num('productHctPct', productHctPct, { min: 1, max: 100 });
  if (weightKg <= 0) return null;
  const frac = productHctPct / 100;
  const volume = (hbRise * weightKg * 3) / frac;
  const mlPerKg = volume / weightKg;
  return {
    volumeMl: Math.round(volume),
    mlPerKg: r1(mlPerKg),
    band: `${fmtInt(Math.round(volume))} mL (${fmtNum(r1(mlPerKg))} mL/kg). The usual single-transfusion reference band is 10-15 mL/kg.`,
    note: 'Estimate only; verify against the ordered volume and rate and local neonatal/pediatric transfusion protocol.',
  };
}

// --- 3.9 iv-osmolarity — IV / PN osmolarity + central-line flag --------------
// Estimated osmolarity (mOsm/L) ≈ dextrose%*50 + amino-acid%*100 +
// (Na + K mEq/L)*2 (ASPEN safe-practices estimation). Solutions >~900 mOsm/L
// need a central line.
export function ivOsmolarity({ dextrosePct, aminoAcidPct, naMeqL, kMeqL }) {
  num('dextrosePct', dextrosePct, { min: 0, max: 100 });
  num('aminoAcidPct', aminoAcidPct, { min: 0, max: 100 });
  num('naMeqL', naMeqL, { min: 0 });
  num('kMeqL', kMeqL, { min: 0 });
  const osm = dextrosePct * 50 + aminoAcidPct * 100 + (naMeqL + kMeqL) * 2;
  const central = osm >= 900;
  return {
    osmolarity: Math.round(osm),
    central,
    band: central
      ? `${fmtInt(Math.round(osm))} mOsm/L — at or above ~900 mOsm/L; a central line is indicated.`
      : `${fmtInt(Math.round(osm))} mOsm/L — below ~900 mOsm/L; peripheral administration is generally acceptable.`,
    note: 'An estimate from macronutrient and major-electrolyte content; the compounding pharmacy label is the source of record.',
  };
}

// --- 3.10 burn-uop-target — burn-resuscitation hourly urine-output target -----
// Target urine output (mL/hr) = weight x rate. Adult 0.5 mL/kg/hr; pediatric
// ~1 mL/kg/hr; electrical/rhabdomyolysis 1-1.5 mL/kg/hr (ABA 2008).
export function burnUopTarget({ weightKg, pediatric, electrical }) {
  num('weightKg', weightKg, { min: 0 });
  let rateLow;
  let rateHigh;
  let label;
  if (B(electrical)) { rateLow = 1.0; rateHigh = 1.5; label = 'Electrical injury / pigmenturia'; }
  else if (B(pediatric)) { rateLow = 1.0; rateHigh = 1.0; label = 'Pediatric'; }
  else { rateLow = 0.5; rateHigh = 0.5; label = 'Adult'; }
  const targetLow = weightKg * rateLow;
  const targetHigh = weightKg * rateHigh;
  const rateText = rateLow === rateHigh ? `${fmtNum(rateLow)} mL/kg/hr` : `${fmtNum(rateLow)}-${fmtNum(rateHigh)} mL/kg/hr`;
  const targetText = targetLow === targetHigh ? `${fmtNum(r1(targetLow))} mL/hr` : `${fmtNum(r1(targetLow))}-${fmtNum(r1(targetHigh))} mL/hr`;
  return {
    rateLow,
    rateHigh,
    targetLowMlHr: r1(targetLow),
    targetHighMlHr: r1(targetHigh),
    band: `${label}: ${rateText} → ${targetText}.`,
    note: 'This is the titration target you chase by adjusting the Parkland/Brooke LR rate (see burn-fluid), not the fluid volume itself.',
  };
}

// --- 3.11 fluid-balance — shift net fluid balance (I&O) ----------------------
// net (mL) = intake - output (signed). With weight, cumulative balance as a
// percent of body weight (1 L ≈ 1 kg); >10% flags fluid overload (Malbrain 2018).
export function fluidBalance({ intakeMl, outputMl, weightKg }) {
  num('intakeMl', intakeMl, { min: 0 });
  num('outputMl', outputMl, { min: 0 });
  num('weightKg', weightKg, { min: 0 });
  const net = intakeMl - outputMl;
  let pct = null;
  if (weightKg > 0) pct = r1((net / 1000) / weightKg * 100);
  const sign = net > 0 ? '+' : '';
  let band = `Net balance ${sign}${fmtInt(net)} mL.`;
  if (pct !== null) {
    const overload = pct >= 10;
    band += ` ${sign}${fmtNum(pct)}% of body weight${overload ? ' — at or above the 10% fluid-overload reference flag.' : '.'}`;
  }
  return { netMl: net, pctBodyWeight: pct, band, note: 'End-of-shift I&O tally for handoff; positive = net intake, negative = net output.' };
}

// --- 3.12 carb-insulin-bolus — carb-counting mealtime insulin bolus ----------
// meal bolus = carbs / IC ratio; correction = (glucose - target) / ISF, floored
// at 0; total = meal + correction (ADA Standards of Care). Each component shown.
export function carbInsulinBolus({ carbsG, icRatio, isf, currentGlucose, targetGlucose }) {
  num('carbsG', carbsG, { min: 0 });
  num('icRatio', icRatio, { min: 0 });
  num('isf', isf, { min: 0 });
  num('currentGlucose', currentGlucose, { min: 0, max: 2000 });
  num('targetGlucose', targetGlucose, { min: 0, max: 2000 });
  if (icRatio <= 0 || isf <= 0) return null;
  const meal = carbsG / icRatio;
  const rawCorrection = (currentGlucose - targetGlucose) / isf;
  const correction = rawCorrection > 0 ? rawCorrection : 0;
  const total = meal + correction;
  return {
    mealBolus: r1(meal),
    correctionBolus: r1(correction),
    totalBolus: r1(total),
    floored: rawCorrection < 0,
    band: `Meal ${fmtNum(r1(meal))} U + correction ${fmtNum(r1(correction))} U = ${fmtNum(r1(total))} U total.`,
    note: rawCorrection < 0
      ? 'Glucose is below target, so the correction component is floored at 0 (no negative/subtraction dose). Estimate only; verify with an independent double-check per protocol.'
      : 'Estimate only; verify with an independent double-check and the current sliding-scale/correction order per protocol.',
  };
}

// Local string helpers that keep banned tokens (NaN/Infinity) out of returned
// strings even if an upstream guard were ever bypassed (spec-v59 §2.6).
function fmtInt(n) { return Number.isFinite(n) ? String(Math.round(n)) : '--'; }
function fmtNum(n) { return Number.isFinite(n) ? String(n) : '--'; }
