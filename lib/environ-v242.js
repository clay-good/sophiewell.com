// spec-v242: environmental heat / cold exposure indices — the NWS heat index, the
// Canadian humidex, the 2001 wind-chill index, and the wet-bulb globe temperature
// (WBGT). Each id was verified absent by a fixed-string scan of the extracted
// app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2). v242 runs no
// AI and makes no runtime network call.
//
// These compute an apparent-temperature / heat-stress value — they are NOT a
// diagnosis and NOT a treatment order (spec-v11 §5.3).
//
//   heat-index  - NWS heat index (Rothfusz)
//   humidex     - Canadian humidex
//   wind-chill  - 2001 wind-chill index
//   wbgt        - wet-bulb globe temperature
//
// FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r1 } from './num.js';

function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- NWS heat index (Rothfusz) -----------------------------------------------
// Rothfusz LP. NWS Technical Attachment SR 90-23 (1990): the simple Steadman
// formula is averaged with the temperature; if >= 80 F, the full regression plus
// the low-RH / high-RH adjustments is used. T in F, RH in %. Cross-verified: NOAA
// WPC; NWS.
const HI_NOTE = 'NWS heat index (Rothfusz regression, NOAA): apparent temperature from air temperature (F) and relative humidity (%). Caution 80-90, extreme caution 90-103, danger 103-124, extreme danger >= 125 F. A heat-stress value, not a diagnosis or treatment order.';
export function heatIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const T = fin(o.tempF, -40, 140);
  const RH = fin(o.humidity, 0, 100);
  if (T === null || RH === null) return { valid: false, message: 'Enter air temperature (F) and relative humidity (%).' };
  const simple = 0.5 * (T + 61 + (T - 68) * 1.2 + RH * 0.094);
  let hi;
  if ((simple + T) / 2 < 80) {
    hi = (simple + T) / 2;
  } else {
    hi = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH
      - 0.00683783 * T * T - 0.05481717 * RH * RH + 0.00122874 * T * T * RH
      + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
    if (RH < 13 && T >= 80 && T <= 112) hi -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    else if (RH > 85 && T >= 80 && T <= 87) hi += ((RH - 85) / 10) * ((87 - T) / 5);
  }
  const score = r1(num('Heat index', hi, { min: -60, max: 200 }));
  let tier; let abnormal = true;
  if (score >= 125) tier = 'extreme danger (>= 125 F)';
  else if (score >= 103) tier = 'danger (103-124 F)';
  else if (score >= 90) tier = 'extreme caution (90-103 F)';
  else if (score >= 80) tier = 'caution (80-90 F)';
  else { tier = 'no elevated heat stress (< 80 F)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `${score} F`, band: `Heat index ${score} F — ${tier}.`, detail: `Air ${T} F, RH ${RH}%.`, note: HI_NOTE };
}

// --- Canadian humidex --------------------------------------------------------
// Masterton JM, Richardson FA. 1979: humidex = Tair + 0.5555 x (e - 10), where
// e = 6.11 x exp[5417.7530 x (1/273.16 - 1/(Tdew + 273.16))]. Temps in C.
// Cross-verified: Environment Canada; Wikipedia.
const HUMIDEX_NOTE = 'Canadian humidex (Masterton & Richardson 1979) = air temperature (C) + 0.5555 x (e - 10), e = 6.11 x exp[5417.7530 x (1/273.16 - 1/(dewpoint K))]. 20-29 comfortable, 30-39 some discomfort, 40-45 great discomfort, > 45 dangerous, >= 54 heat stroke imminent. A comfort index, not a diagnosis or treatment order.';
export function humidex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const T = fin(o.tempC, -40, 60);
  const Td = fin(o.dewpointC, -60, 60);
  if (T === null || Td === null) return { valid: false, message: 'Enter air temperature and dewpoint (C).' };
  if (Td > T) return { valid: false, message: 'Dewpoint cannot exceed air temperature.' };
  const e = 6.11 * Math.exp(5417.7530 * (1 / 273.16 - 1 / (Td + 273.16)));
  const score = r1(num('Humidex', T + 0.5555 * (e - 10), { min: -40, max: 80 }));
  let tier; let abnormal = true;
  if (score >= 54) tier = 'heat stroke imminent (>= 54)';
  else if (score > 45) tier = 'dangerous (> 45)';
  else if (score >= 40) tier = 'great discomfort (40-45)';
  else if (score >= 30) tier = 'some discomfort (30-39)';
  else { tier = 'comfortable (< 30)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `Humidex ${score}`, band: `Humidex ${score} — ${tier}.`, detail: `Air ${T} C, dewpoint ${Td} C.`, note: HUMIDEX_NOTE };
}

// --- 2001 wind-chill index ---------------------------------------------------
// JAG/TI 2001 (Canada/US/UK): Twc = 13.12 + 0.6215 x Ta - 11.37 x V^0.16 +
// 0.3965 x Ta x V^0.16 (Ta in C, V in km/h). Defined for Ta <= 10 C and V > 4.8
// km/h. Cross-verified: Environment Canada; NWS.
const WC_NOTE = 'Wind-chill index (2001 JAG/TI, Canada/US/UK) = 13.12 + 0.6215 x Ta - 11.37 x V^0.16 + 0.3965 x Ta x V^0.16 (Ta in C, wind V in km/h). Defined for Ta <= 10 C and V > 4.8 km/h; frostbite risk rises steeply below about -27 C. A perceived-temperature value, not a diagnosis or treatment order.';
export function windChill(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const Ta = fin(o.tempC, -60, 20);
  const V = fin(o.windKmh, 0, 200);
  if (Ta === null || V === null) return { valid: false, message: 'Enter air temperature (C) and wind speed (km/h).' };
  const v16 = Math.pow(V, 0.16);
  const score = r1(num('Wind chill', 13.12 + 0.6215 * Ta - 11.37 * v16 + 0.3965 * Ta * v16, { min: -100, max: 40 }));
  const abnormal = score <= -27;
  return { valid: true, score, abnormal, bandLabel: `${score} C`, band: `Wind chill ${score} C — ${abnormal ? 'high frostbite risk (<= -27 C)' : 'lower frostbite risk (> -27 C)'}.`, detail: `Air ${Ta} C, wind ${V} km/h.`, note: WC_NOTE };
}

// --- Wet-bulb globe temperature (WBGT) ---------------------------------------
// Yaglou CP, Minard D. 1957 (ISO 7243): outdoor (in sun) WBGT = 0.7 x Tnwb +
// 0.2 x Tg + 0.1 x Ta; indoor / shade WBGT = 0.7 x Tnwb + 0.3 x Ta, all temps in
// the same unit. Cross-verified: Wikipedia; NWS/ISO 7243.
const WBGT_NOTE = 'Wet-bulb globe temperature (Yaglou & Minard 1957; ISO 7243): outdoor (in sun) = 0.7 x natural-wet-bulb + 0.2 x globe + 0.1 x dry-bulb; indoor / shade = 0.7 x natural-wet-bulb + 0.3 x dry-bulb, all temps in the same unit. A heat-stress index mapped to ACGIH/NWS work-rest activity flags. Not a diagnosis or treatment order.';
export function wbgt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const outdoor = o.setting !== 'indoor';
  const nwb = fin(o.naturalWetBulb, -20, 60);
  const globe = fin(o.globe, -20, 100);
  const dry = fin(o.dryBulb, -20, 70);
  if (nwb === null || dry === null || (outdoor && globe === null)) {
    return { valid: false, message: outdoor ? 'Enter natural wet-bulb, globe, and dry-bulb temperature.' : 'Enter natural wet-bulb and dry-bulb temperature.' };
  }
  const val = outdoor ? 0.7 * nwb + 0.2 * globe + 0.1 * dry : 0.7 * nwb + 0.3 * dry;
  const score = r1(num('WBGT', val, { min: -20, max: 80 }));
  return { valid: true, score, abnormal: false, bandLabel: `WBGT ${score}`, band: `Wet-bulb globe temperature ${score} (${outdoor ? 'outdoor/sun' : 'indoor/shade'}) — map to work-rest activity flags.`, detail: outdoor ? `NWB ${nwb}, globe ${globe}, dry ${dry}.` : `NWB ${nwb}, dry ${dry}.`, note: WBGT_NOTE };
}
