// spec-v110 (fifth spec of Wave 2 of the spec-v100 MDCalc Parity Completion
// program): five deterministic toxicology dosing and dialysis-decision tools
// that fill confirmed gaps. None duplicates a live tile.
//
//   digifabDosing   - Digoxin immune Fab (DigiFab) vial count
//   nacDosing       - Acetaminophen N-acetylcysteine (NAC) IV regimen
//   hietDosing      - High-dose insulin euglycemia therapy (HIET) dosing
//   tcaBicarbonate  - TCA toxicity QRS risk band + sodium-bicarbonate target
//   lithiumExtrip   - Lithium dialysis decision (EXTRIP 2015)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v35.js wire these to the home grid and
// render the spec-v11 §5.3 / spec-v100 §2 clause-5 second-check caveat on every
// dosing tile.
//
// FORMULAS / DECISION LIMBS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each
// cross-verified across >= 2 independent sources (original paper + product
// label / poison-center reference / MDCalc):
//   - DigiFab (Smith TW, et al, N Engl J Med 1982; carried into the product
//     label): by amount ingested, vials = amount(mg) x 0.8 bioavailability /
//     0.5 mg digoxin bound per vial; by steady-state serum level,
//     vials = level(ng/mL) x weight(kg) / 100; empiric acute 10-20, chronic
//     3-6. Vials are rounded UP to the next whole vial per the label. Class A.
//   - NAC (Prescott LF, et al, BMJ 1979 three-bag 21-hour regimen; two-bag SNAP
//     per Bateman DN, et al, Lancet 2014): three-bag = 150 mg/kg over 1 h ->
//     50 mg/kg over 4 h -> 100 mg/kg over 16 h; two-bag = 200 mg/kg over 4 h ->
//     100 mg/kg over 16 h. Dosing weight capped at 110 kg. Class A.
//   - HIET (Engebretsen KM, et al, Clin Toxicol 2011): regular-insulin bolus
//     1 unit/kg, infusion start 1 unit/kg/hr titratable to a 10 unit/kg/hr
//     ceiling, paired with a dextrose infusion to maintain euglycemia. Class A.
//   - TCA bicarbonate (Boehnert MT, Lovejoy FH, N Engl J Med 1985): QRS >= 100 ms
//     predicts seizures, QRS >= 160 ms predicts ventricular arrhythmias; sodium
//     bicarbonate 1-2 mEq/kg targeting serum pH 7.45-7.55. Class A.
//   - Lithium EXTRIP (Decker BS, et al; EXTRIP Workgroup, Clin J Am Soc Nephrol
//     2015): ECTR recommended if decreased consciousness / seizures / life-
//     threatening dysrhythmias (any level) OR impaired kidney function with
//     level > 4.0 mmol/L; suggested if level > 5.0 mmol/L OR confusion OR the
//     expected time to reduce the level < 1.0 mmol/L exceeds 36 h. Class B.
//
// Robustness (spec-v110 §3): the four dosing tiles guard weight/level domains
// (positive weight, non-negative level) and surface a valid:false fallback
// rather than a dose from a zero/blank/negative input; digifabDosing divides by
// fixed nonzero constants and rounds vials up; nacDosing applies the 110-kg cap
// as a Math.min and shows it; hietDosing clamps the titration rate to the 10
// unit/kg/hr ceiling; tcaBicarbonate bounds the bolus to 1-2 mEq/kg.
// lithiumExtrip walks the EXTRIP limbs and names the firing limb -- it is a
// decision, not a dialysis prescription. None authors an antidote, infusion, or
// dialysis order in Sophie's voice (spec-v11 §5.3); the give-it decision stays
// with the clinician, poison center, and local protocol.

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const r0 = (n) => Math.round(n);

// --- 2.1 digifab-dosing - Digoxin immune Fab (DigiFab) dosing ----------------
const DIGIFAB_NOTE = 'Digoxin immune Fab (DigiFab) dosing (Smith TW, Butler VP Jr, Haber E, et al, N Engl J Med 1982; carried into the product label): the vial count by (a) known amount ingested -- vials = amount (mg) x 0.8 bioavailability / 0.5 mg digoxin bound per vial; (b) steady-state serum digoxin level -- vials = level (ng/mL) x weight (kg) / 100; or (c) empiric -- acute ingestion 10-20 vials, chronic toxicity 3-6 vials. Vials are rounded up to the next whole vial per the label. A dosing aid: confirm the indication, the level timing (a level drawn < 6 h post-ingestion overestimates body burden), and the dose against your institutional protocol and an independent second check before administration.';

export function digifabDosing(input = {}) {
  const mode = typeof input.mode === 'string' ? input.mode : 'level';
  if (mode === 'amount') {
    const amt = fin(input.amount);
    if (amt == null || amt <= 0) {
      return { valid: false, band: 'Enter the amount of digoxin ingested (mg) to compute the DigiFab vial count.', note: DIGIFAB_NOTE };
    }
    const vials = Math.ceil((amt * 0.8) / 0.5);
    return {
      valid: true, mode, vials,
      formula: `vials = ${amt} mg x 0.8 / 0.5 mg per vial, rounded up`,
      band: `DigiFab ${vials} vials by amount ingested (${amt} mg x 0.8 bioavailability / 0.5 mg bound per vial, rounded up).`,
      abnormal: false, note: DIGIFAB_NOTE,
    };
  }
  if (mode === 'empiric') {
    const timing = input.timing === 'chronic' ? 'chronic' : 'acute';
    const lo = timing === 'chronic' ? 3 : 10;
    const hi = timing === 'chronic' ? 6 : 20;
    return {
      valid: true, mode, timing, vialsLow: lo, vialsHigh: hi, vials: null,
      band: `DigiFab empiric dosing: ${lo}-${hi} vials for ${timing === 'chronic' ? 'chronic toxicity' : 'acute ingestion'} (give and titrate to clinical response).`,
      abnormal: false, note: DIGIFAB_NOTE,
    };
  }
  // default: steady-state serum level mode
  const level = fin(input.level);
  const weight = fin(input.weight);
  if (level == null || level < 0) {
    return { valid: false, band: 'Enter the steady-state serum digoxin level (ng/mL) and weight (kg).', note: DIGIFAB_NOTE };
  }
  if (weight == null || weight <= 0) {
    return { valid: false, band: 'Enter a positive body weight (kg) to compute the level-based DigiFab vial count.', note: DIGIFAB_NOTE };
  }
  const vials = Math.ceil((level * weight) / 100);
  return {
    valid: true, mode: 'level', vials,
    formula: `vials = ${level} ng/mL x ${weight} kg / 100, rounded up`,
    band: `DigiFab ${vials} vials by steady-state serum level (${level} ng/mL x ${weight} kg / 100, rounded up).`,
    abnormal: false, note: DIGIFAB_NOTE,
  };
}

// --- 2.2 nac-dosing - Acetaminophen N-acetylcysteine (NAC) IV dosing ---------
const NAC_NOTE = 'IV N-acetylcysteine (NAC) dosing for acetaminophen poisoning (Prescott LF, et al, BMJ 1979 three-bag 21-hour regimen; two-bag SNAP regimen per Bateman DN, et al, Lancet 2014). Three-bag: 150 mg/kg over 1 h, then 50 mg/kg over 4 h, then 100 mg/kg over 16 h (300 mg/kg total over 21 h). Two-bag (SNAP): 200 mg/kg over 4 h, then 100 mg/kg over 16 h. The dosing weight is capped at 110 kg. Cross-link the acetaminophen-nomogram for the treatment-line decision. A dosing aid: confirm the regimen, the nomogram indication, and the dose against your institutional protocol and an independent second check before administration.';
const NAC_REGIMENS = {
  'three-bag': { label: 'three-bag (21 h)', bags: [{ rate: 150, hr: 1 }, { rate: 50, hr: 4 }, { rate: 100, hr: 16 }] },
  'two-bag': { label: 'two-bag SNAP', bags: [{ rate: 200, hr: 4 }, { rate: 100, hr: 16 }] },
};

export function nacDosing(input = {}) {
  const weight = fin(input.weight);
  if (weight == null || weight <= 0) {
    return { valid: false, band: 'Enter a positive body weight (kg) to compute the NAC regimen.', note: NAC_NOTE };
  }
  const key = input.regimen === 'two-bag' ? 'two-bag' : 'three-bag';
  const reg = NAC_REGIMENS[key];
  const capped = weight > 110;
  const dosingWt = Math.min(weight, 110);
  const bags = reg.bags.map((b, i) => ({ n: i + 1, mg: r0(b.rate * dosingWt), hr: b.hr, rate: b.rate }));
  const totalMg = bags.reduce((s, b) => s + b.mg, 0);
  const bagText = bags.map((b) => `bag ${b.n} ${b.mg} mg over ${b.hr} h`).join(', ');
  const capText = capped ? `dosing weight capped at 110 kg (entered ${weight} kg)` : `dosing weight ${dosingWt} kg`;
  return {
    valid: true, regimen: reg.label, capped, dosingWt, bags, totalMg,
    band: `NAC ${reg.label}, ${capText}: ${bagText} (total ${totalMg} mg).`,
    abnormal: false, note: NAC_NOTE,
  };
}

// --- 2.3 hiet-dosing - High-dose insulin euglycemia therapy (HIET) -----------
const HIET_NOTE = 'High-dose insulin euglycemia therapy (HIET) for beta-blocker or calcium-channel-blocker poisoning (Engebretsen KM, Kaczmarek KM, Morgan J, Holger JS, Clin Toxicol 2011): a regular-insulin bolus of 1 unit/kg, then an infusion starting at 1 unit/kg/hr titratable to a 10 unit/kg/hr ceiling, paired with a dextrose infusion (and frequent glucose and potassium monitoring) to maintain euglycemia. A dosing aid: confirm the indication, the dextrose/potassium coupling, and the dose against your institutional protocol and an independent second check before administration.';

export function hietDosing(input = {}) {
  const weight = fin(input.weight);
  if (weight == null || weight <= 0) {
    return { valid: false, band: 'Enter a positive body weight (kg) to compute the HIET bolus and infusion.', note: HIET_NOTE };
  }
  const rateRaw = fin(input.rate);
  const ratePerKg = clamp(rateRaw == null ? 1 : rateRaw, 0.5, 10);
  const rateClamped = rateRaw != null && rateRaw > 10;
  const bolusRaw = fin(input.bolus);
  const bolusPerKg = clamp(bolusRaw == null ? 1 : bolusRaw, 0, 1);
  const bolus = r0(bolusPerKg * weight);
  const startRate = r0(ratePerKg * weight);
  const ceiling = r0(10 * weight);
  return {
    valid: true, bolus, startRate, ceiling, ratePerKg, bolusPerKg, rateClamped,
    band: `HIET: bolus ${bolus} units (${bolusPerKg} unit/kg), starting infusion ${startRate} units/hr (${ratePerKg} unit/kg/hr${rateClamped ? ', clamped to the 10 unit/kg/hr ceiling' : ''}), titration ceiling ${ceiling} units/hr (10 unit/kg/hr); pair with a dextrose infusion to maintain euglycemia.`,
    abnormal: false, note: HIET_NOTE,
  };
}

// --- 2.4 tca-bicarbonate - TCA QRS risk + sodium-bicarbonate target ----------
const TCA_NOTE = 'Tricyclic-antidepressant (TCA) toxicity QRS risk and sodium-bicarbonate target (Boehnert MT, Lovejoy FH Jr, N Engl J Med 1985): a maximal limb-lead QRS >= 100 ms predicts seizures and a QRS >= 160 ms predicts ventricular arrhythmias after an acute TCA overdose. Treat QRS widening with a sodium-bicarbonate bolus of 1-2 mEq/kg, repeated to a target serum pH of 7.45-7.55. A dosing aid: confirm the indication, the serum-pH ceiling, and the bolus against your institutional protocol and an independent second check before administration.';

export function tcaBicarbonate(input = {}) {
  const weight = fin(input.weight);
  if (weight == null || weight <= 0) {
    return { valid: false, band: 'Enter a positive body weight (kg) to compute the sodium-bicarbonate bolus.', note: TCA_NOTE };
  }
  const qrs = fin(input.qrs);
  if (qrs == null || qrs < 0) {
    return { valid: false, band: 'Enter the maximal QRS duration (ms) to band the TCA-toxicity risk.', note: TCA_NOTE };
  }
  const bicarbLow = r0(1 * weight);
  const bicarbHigh = r0(2 * weight);
  const risk = qrs >= 160 ? 'ventricular-arrhythmia risk' : qrs >= 100 ? 'seizure risk' : 'below the 100 ms risk threshold';
  const thresh = qrs >= 160 ? '>= 160 ms' : qrs >= 100 ? '>= 100 ms' : '< 100 ms';
  const give = qrs >= 100
    ? ` -- give sodium bicarbonate 1-2 mEq/kg = ${bicarbLow}-${bicarbHigh} mEq, target serum pH 7.45-7.55.`
    : `; sodium bicarbonate 1-2 mEq/kg = ${bicarbLow}-${bicarbHigh} mEq is indicated if the QRS widens, target serum pH 7.45-7.55.`;
  return {
    valid: true, qrs, risk, bicarbLow, bicarbHigh,
    abnormal: qrs >= 100,
    band: `QRS ${qrs} ms (${thresh}): ${risk}${give}`,
    note: TCA_NOTE,
  };
}

// --- 2.5 lithium-extrip - Lithium dialysis decision (EXTRIP 2015) -------------
const LITHIUM_NOTE = 'Lithium extracorporeal-treatment (ECTR) decision (Decker BS, Goldfarb DS, Dargan PI, et al; EXTRIP Workgroup, Clin J Am Soc Nephrol 2015): ECTR is recommended if there is a decreased level of consciousness, seizures, or life-threatening dysrhythmias (irrespective of level), OR if kidney function is impaired and the lithium level is > 4.0 mmol/L. ECTR is suggested if the level is > 5.0 mmol/L, OR significant confusion is present, OR the expected time to reduce the level below 1.0 mmol/L exceeds 36 hours. A decision aid, not a dialysis prescription: the modality, duration, and prescription stay with the nephrology and toxicology team and local protocol.';

export function lithiumExtrip(input = {}) {
  const level = fin(input.level);
  if (level == null || level < 0) {
    return { valid: false, band: 'Enter the serum lithium level (mmol/L) to walk the EXTRIP decision.', note: LITHIUM_NOTE };
  }
  const renal = onFlag(input.renalImpaired);
  const consciousness = onFlag(input.decreasedConsciousness);
  const seizures = onFlag(input.seizures);
  const dysrhythmias = onFlag(input.dysrhythmias);
  const confusion = onFlag(input.confusion);
  const slowClearance = onFlag(input.slowClearance);

  const recommendLimbs = [];
  if (consciousness || seizures || dysrhythmias) {
    const features = [];
    if (consciousness) features.push('decreased consciousness');
    if (seizures) features.push('seizures');
    if (dysrhythmias) features.push('life-threatening dysrhythmias');
    recommendLimbs.push(`life-threatening features (${features.join(', ')}), irrespective of level`);
  }
  if (renal && level > 4.0) recommendLimbs.push('impaired kidney function with a lithium level > 4.0 mmol/L');

  const suggestLimbs = [];
  if (level > 5.0) suggestLimbs.push('lithium level > 5.0 mmol/L');
  if (confusion) suggestLimbs.push('significant confusion');
  if (slowClearance) suggestLimbs.push('expected time to a level < 1.0 mmol/L exceeds 36 h');

  let recommendation, limbs;
  if (recommendLimbs.length) { recommendation = 'recommended'; limbs = recommendLimbs; }
  else if (suggestLimbs.length) { recommendation = 'suggested'; limbs = suggestLimbs; }
  else { recommendation = 'not indicated'; limbs = []; }

  const verdict = recommendation === 'not indicated'
    ? 'no EXTRIP limb fired'
    : `${recommendation === 'recommended' ? 'RECOMMENDED' : 'suggested'} -- ${limbs.join('; ')}`;
  return {
    valid: true, level, recommendation, limbs,
    abnormal: recommendation !== 'not indicated',
    band: `Lithium ${level} mmol/L: extracorporeal treatment (ECTR) ${recommendation === 'not indicated' ? 'not indicated by the EXTRIP rule (no limb fired)' : verdict}.`,
    note: LITHIUM_NOTE,
  };
}
