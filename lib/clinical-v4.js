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
