// spec-v58: neonatal, maternal, and pediatric/adult ICU bedside scores.
// Pure functions only. Citations live inline in lib/meta.js; renderers in
// views/group-v10.js wire these to the home grid. num/r1/r2 come from
// lib/num.js (spec-v53 §4.1). Item scores clamp each item to its declared
// range via num(); age/gestational-age-banded tiles (bhutani-bilirubin,
// pelod2, psofa) pick the active band from the entered age and return it so
// the renderer can show which threshold was applied. Every division guards
// its denominator -> null -> fmt() fallback, never a non-finite DOM value
// (spec-v53 §3). The neonatal respiratory scores and finnegan use a
// higher = worse convention (the inverse of APGAR); the band strings state
// the direction explicitly so a cross-reading nurse cannot invert it.

import { num, r1, r2 } from './num.js';

const B = (v) => v === true || v === 1 || v === '1' || v === 'true';

// Sum an array of item scores, validating each against [min, max].
function sumItems(items, min, max, label = 'item') {
  if (!Array.isArray(items)) throw new TypeError(`${label}s must be an array`);
  let total = 0;
  for (let i = 0; i < items.length; i += 1) { num(`${label}${i + 1}`, items[i], { min, max }); total += items[i]; }
  return total;
}

// --- 2.1 ballard — New Ballard Score (gestational age) ----------------------
// Six neuromuscular + six physical-maturity criteria, each -1..+5. The total
// maturity score maps linearly to estimated gestational age: GA(weeks) =
// 24 + 0.4 x score (Ballard 1991 maturity-rating table: -10 -> 20 wk, +50 ->
// 44 wk, +2 wk per 5 points). Assessment precision is +/-2 weeks.
export function ballard({ neuromuscular, physical }) {
  const nm = sumItems(neuromuscular, -1, 5, 'neuromuscular');
  const ph = sumItems(physical, -1, 5, 'physical');
  if (neuromuscular.length !== 6 || physical.length !== 6) {
    throw new TypeError('ballard requires 6 neuromuscular and 6 physical criteria');
  }
  const score = nm + ph;
  let ga = 24 + 0.4 * score;
  if (ga < 20) ga = 20;
  if (ga > 44) ga = 44;
  return { score, gaWeeks: r1(ga), note: 'Assessment precision +/-2 weeks.' };
}

// --- 2.2 finnegan — modified Finnegan Neonatal Abstinence Scoring -----------
// The signs used in most U.S. modified-Finnegan protocols, each carrying its
// conventional weight. Higher = worse (the inverse of APGAR). Treatment is a
// TREND decision: >=8 on three consecutive scores, or >=12 on two, prompts
// pharmacologic-treatment consideration per protocol. Sophie computes a single
// interval score; it does not persist the trend.
const FINNEGAN_WEIGHTS = {
  highPitchedCry: 2, continuousCry: 3,
  moro: 2, markedMoro: 3,
  tremorsDisturbed: 1, markedTremorsDisturbed: 2,
  tremorsUndisturbed: 3, markedTremorsUndisturbed: 4,
  increasedTone: 2, excoriation: 1, myoclonus: 3, convulsions: 5,
  sweating: 1,
  yawning: 1, mottling: 1, nasalStuffiness: 1, sneezing: 1, nasalFlaring: 2,
  excessiveSucking: 1, poorFeeding: 2,
  regurgitation: 2, projectileVomiting: 3,
  looseStools: 2, wateryStools: 3,
};
// Graded items contribute their selected level (0..max) directly as points.
const FINNEGAN_GRADED = {
  sleep: 3,    // sleeps <3h(1)/<2h(2)/<1h(3) after feeding
  fever: 2,    // 37.2-38.3 C(1) / >38.3 C(2)
  respRate: 2, // RR >60(1) / >60 with retractions(2)
};
export function finnegan(signs) {
  if (signs == null || typeof signs !== 'object') throw new TypeError('finnegan requires a signs object');
  let total = 0;
  for (const [key, weight] of Object.entries(FINNEGAN_WEIGHTS)) {
    total += B(signs[key]) ? weight : 0;
  }
  for (const [key, max] of Object.entries(FINNEGAN_GRADED)) {
    const v = signs[key];
    total += num(key, typeof v === 'number' ? v : 0, { min: 0, max });
  }
  let band;
  if (total >= 12) band = 'High (>=12): two consecutive scores >=12 prompt pharmacologic-treatment consideration per protocol.';
  else if (total >= 8) band = 'Elevated (>=8): three consecutive scores >=8 prompt pharmacologic-treatment consideration per protocol.';
  else band = 'Below treatment threshold (<8): continue supportive care and rescoring per protocol.';
  return { total, band, note: 'Higher = worse. Score the full interval; treatment is a trend decision, not a single value.' };
}

// --- 2.3 silverman-andersen — neonatal respiratory severity -----------------
// Five signs, 0-2 each, total 0-10. Higher = worse (inverse of APGAR).
export function silvermanAndersen({ chestMovement, intercostal, xiphoid, naresDilatation, grunt }) {
  const total = sumItems([chestMovement, intercostal, xiphoid, naresDilatation, grunt], 0, 2);
  let band;
  if (total === 0) band = 'No respiratory distress (0).';
  else if (total <= 3) band = 'Mild distress (1-3).';
  else if (total <= 6) band = 'Moderate distress (4-6).';
  else band = 'Severe distress / impending respiratory failure (>=7).';
  return { total, band, note: 'Higher = worse (the inverse of APGAR).' };
}

// --- 2.4 downes — neonatal respiratory distress -----------------------------
// Five parameters, 0-2 each, total 0-10. Higher = worse.
export function downes({ respiratoryRate, cyanosis, airEntry, grunting, retractions }) {
  const total = sumItems([respiratoryRate, cyanosis, airEntry, grunting, retractions], 0, 2);
  let band;
  if (total <= 3) band = 'Mild distress (0-3).';
  else if (total <= 6) band = 'Moderate distress (4-6): impending respiratory failure.';
  else band = 'Severe distress (>=7): consider assisted ventilation.';
  return { total, band, note: 'Higher = worse (the inverse of APGAR).' };
}

// --- 2.5 bhutani-bilirubin — hour-specific nomogram + AAP-2022 threshold ----
// Bhutani 1999 hour-specific risk zones (40th / 75th / 95th percentile tracks,
// piecewise-linear in age-hours) plus the AAP-2022 phototherapy threshold for
// the entered gestational age and neurotoxicity-risk flag. Reports the zone
// and an above/below-threshold flag; it does not order phototherapy (§6).
const BHUTANI_AGE_H = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144];
const BHUTANI_P40 = [4.3, 5.8, 7.0, 7.8, 8.4, 8.9, 9.3, 9.6, 9.8, 10.0, 10.1, 10.2];
const BHUTANI_P75 = [6.0, 8.2, 9.6, 10.6, 11.4, 12.0, 12.4, 12.7, 12.9, 13.0, 13.1, 13.1];
const BHUTANI_P95 = [8.0, 11.0, 12.6, 13.7, 14.6, 15.3, 15.9, 16.4, 16.8, 17.1, 17.3, 17.4];
function interp(xs, ys, x) {
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length - 1]) return ys[ys.length - 1];
  for (let i = 1; i < xs.length; i += 1) {
    if (x <= xs[i]) {
      const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
      return ys[i - 1] + t * (ys[i] - ys[i - 1]);
    }
  }
  return ys[ys.length - 1];
}
// AAP-2022 phototherapy threshold (mg/dL) as a function of age-hours, anchored
// at the published 0 h / 24 h / 48 h / 72 h / >=96 h values for the
// gestational-age band, lowered by neurotoxicity risk factors.
function aapPhotoThreshold(ageHours, gaWeeks, riskFactors) {
  // Anchor curves: [0h, 24h, 48h, 72h, 96h+] for no-risk-factor infants.
  let anchors;
  if (gaWeeks >= 40) anchors = [10, 14.5, 17.5, 19.5, 21];
  else if (gaWeeks >= 38) anchors = [9, 13, 16, 18, 19.5];
  else if (gaWeeks >= 37) anchors = [8, 12, 15, 17, 18];
  else if (gaWeeks >= 36) anchors = [7, 11, 13.5, 15.5, 16.5];
  else anchors = [6, 9.5, 12, 14, 15]; // 35 wk
  const ages = [0, 24, 48, 72, 96];
  let t = interp(ages, anchors, ageHours);
  if (riskFactors) t -= 2; // neurotoxicity risk factors lower the threshold ~2 mg/dL
  return r1(t);
}
export function bhutaniBilirubin({ ageHours, tsb, gaWeeks, riskFactors }) {
  num('ageHours', ageHours, { min: 0, max: 168 });
  num('tsb', tsb, { min: 0, max: 50 });
  num('gaWeeks', gaWeeks, { min: 35, max: 44 });
  const p40 = interp(BHUTANI_AGE_H, BHUTANI_P40, ageHours);
  const p75 = interp(BHUTANI_AGE_H, BHUTANI_P75, ageHours);
  const p95 = interp(BHUTANI_AGE_H, BHUTANI_P95, ageHours);
  let zone;
  if (tsb >= p95) zone = 'High-risk zone (>95th percentile).';
  else if (tsb >= p75) zone = 'High-intermediate-risk zone (75th-95th percentile).';
  else if (tsb >= p40) zone = 'Low-intermediate-risk zone (40th-75th percentile).';
  else zone = 'Low-risk zone (<40th percentile).';
  const threshold = aapPhotoThreshold(ageHours, gaWeeks, B(riskFactors));
  const abovePhoto = tsb >= threshold;
  return {
    zone, threshold,
    p40: r1(p40), p75: r1(p75), p95: r1(p95),
    abovePhoto,
    photoBand: abovePhoto
      ? `At/above AAP-2022 phototherapy threshold (${threshold} mg/dL) for ${gaWeeks} wk -- treat per AAP.`
      : `Below AAP-2022 phototherapy threshold (${threshold} mg/dL) for ${gaWeeks} wk.`,
    note: 'Zone is the Bhutani hour-specific percentile; threshold is the AAP-2022 phototherapy line. Decision support, not a treatment order.',
  };
}

// AAP-2022 exchange-transfusion threshold (mg/dL), read from the published
// no-risk-factor curve (Kemper 2022, Pediatrics 150(3), Fig 6) at the same
// 0/24/48/72/96h+ anchors as the phototherapy curve, by gestational-age band
// (the exchange figure tops out at a single >=38 wk band). The published
// "1 or more risk factors" curve sits ~3.5 mg/dL lower; we apply that offset.
// Values after 96 h flatten to the 96 h anchor (the published curve rises only
// ~0.5-1 mg/dL further by 14 d), which keeps the threshold on the conservative
// side for a decision-support flag.
function aapExchangeThreshold(ageHours, gaWeeks, riskFactors) {
  let anchors;
  if (gaWeeks >= 38) anchors = [17, 22.5, 25, 26.5, 27];
  else if (gaWeeks >= 37) anchors = [16.5, 22, 24.5, 26, 26.5];
  else if (gaWeeks >= 36) anchors = [16, 21, 23.5, 25, 26];
  else anchors = [15, 19, 22, 24, 25]; // 35 wk
  const ages = [0, 24, 48, 72, 96];
  let t = interp(ages, anchors, ageHours);
  if (riskFactors) t -= 3.5;
  return r1(t);
}

// --- spec-v62 §3.3 Part B (wave 2): neo-phototherapy ------------------------
// AAP-2022 risk-stratified treatment thresholds. Reuses the phototherapy curve
// already validated for bhutani-bilirubin and adds the exchange-transfusion
// curve and the AAP "escalation of care" line (TSB within 2 mg/dL of the
// exchange threshold -> NICU). Reports the current TSB's distance from the
// phototherapy line and which treatment band it falls in. Decision support,
// not a treatment order; the published chart / BiliTool is the source of truth.
export function neoPhototherapy({ ageHours, tsb, gaWeeks, riskFactors }) {
  num('ageHours', ageHours, { min: 0, max: 336 });
  num('tsb', tsb, { min: 0, max: 50 });
  num('gaWeeks', gaWeeks, { min: 35, max: 44 });
  const rf = B(riskFactors);
  const photo = aapPhotoThreshold(ageHours, gaWeeks, rf);
  const exchange = aapExchangeThreshold(ageHours, gaWeeks, rf);
  const escalation = r1(exchange - 2); // AAP: within 2 mg/dL of exchange -> escalate
  const atPhoto = tsb >= photo;
  const atEscalation = tsb >= escalation;
  const atExchange = tsb >= exchange;
  let band;
  if (atExchange) {
    band = `At/above the AAP-2022 exchange-transfusion threshold (${exchange} mg/dL) -- emergent intensive phototherapy and exchange per AAP.`;
  } else if (atEscalation) {
    band = `Within 2 mg/dL of the exchange threshold (${exchange} mg/dL) -- escalation of care: admit to a unit able to perform exchange, recheck q2h (AAP-2022).`;
  } else if (atPhoto) {
    band = `At/above the AAP-2022 phototherapy threshold (${photo} mg/dL) -- start intensive phototherapy.`;
  } else {
    band = `Below the AAP-2022 phototherapy threshold (${photo} mg/dL).`;
  }
  return {
    photoThreshold: photo,
    exchangeThreshold: exchange,
    escalationThreshold: escalation,
    marginToPhoto: r1(tsb - photo), // +ve = above the phototherapy line
    atPhoto,
    atEscalation,
    atExchange,
    band,
    note: 'AAP-2022 thresholds (Kemper 2022) anchored from the published phototherapy and exchange curves; confirm against the AAP chart or BiliTool before acting. Decision support, not a treatment order.',
  };
}

// --- 2.6 qbl-pph — quantitative blood loss + PPH risk -----------------------
// QBL = measured/collected volume + (weighed-pad grams - dry tare), 1 g = 1 mL.
// PPH flag at >=1000 mL, or >=500 mL after a vaginal birth with instability.
// CMQCC admission risk tier from the entered risk-factor counts.
export function qblPph({ measuredMl = 0, padGrams = 0, dryTareGrams = 0, vaginal = true, unstable = false, riskFactors = 0 }) {
  num('measuredMl', measuredMl, { min: 0, max: 20000 });
  num('padGrams', padGrams, { min: 0, max: 20000 });
  num('dryTareGrams', dryTareGrams, { min: 0, max: padGrams });
  num('riskFactors', riskFactors, { min: 0, max: 20 });
  const qbl = measuredMl + Math.max(0, padGrams - dryTareGrams);
  let pph;
  if (qbl >= 1000) pph = true;
  else if (B(vaginal) && qbl >= 500 && B(unstable)) pph = true;
  else pph = false;
  let tier;
  if (riskFactors >= 2) tier = 'High risk -- crossmatch 2 units and activate the hemorrhage protocol pathway per CMQCC.';
  else if (riskFactors === 1) tier = 'Medium risk -- type and screen; have the hemorrhage cart available.';
  else tier = 'Low risk -- clot/hold per unit policy.';
  return {
    qbl,
    pphFlag: pph,
    pphBand: pph
      ? 'Postpartum-hemorrhage threshold met -- escalate per OB hemorrhage protocol.'
      : 'Below the postpartum-hemorrhage threshold.',
    tier,
    note: '1 g = 1 mL weighed-pad convention; dry-pad/irrigation tare subtracted. Decision support, not a transfusion order.',
  };
}

// --- 2.7 pelod2 — Pediatric Logistic Organ Dysfunction-2 --------------------
// Ten variables across five organ systems (Leteurtre 2013). MAP and creatinine
// cutoffs are age-banded and applied automatically from ageMonths; the active
// band is returned. Total 0-33.
function ageBandIndex(ageMonths) {
  // 0:<1mo 1:1-11mo 2:12-23mo 3:24-59mo 4:60-143mo 5:>=144mo
  if (ageMonths < 1) return 0;
  if (ageMonths < 12) return 1;
  if (ageMonths < 24) return 2;
  if (ageMonths < 60) return 3;
  if (ageMonths < 144) return 4;
  return 5;
}
const PELOD2_MAP = [ // [p2lo, p3lo, p6hi] -> >=p2lo:0, p3lo..p2lo-1:2, p6hi+1..p3lo-1:3, <=p6hi:6
  { c0: 46, c2: 31, c3: 17 }, { c0: 55, c2: 39, c3: 25 }, { c0: 60, c2: 44, c3: 31 },
  { c0: 62, c2: 46, c3: 32 }, { c0: 65, c2: 49, c3: 36 }, { c0: 67, c2: 52, c3: 38 },
];
const PELOD2_CREAT = [70, 23, 35, 51, 59, 93]; // umol/L; >= -> 2 points
export function pelod2(p) {
  if (p == null || typeof p !== 'object') throw new TypeError('pelod2 requires an inputs object');
  const ageMonths = num('ageMonths', p.ageMonths, { min: 0, max: 300 });
  const band = ageBandIndex(ageMonths);
  let score = 0;
  const parts = [];
  // Neurologic: GCS + pupillary reaction
  const gcs = num('gcs', p.gcs, { min: 3, max: 15 });
  let neuro = gcs >= 11 ? 0 : (gcs >= 5 ? 1 : 4);
  if (B(p.pupilsFixed)) neuro = Math.max(neuro, 5);
  parts.push(['Neurologic (GCS/pupils)', neuro]); score += neuro;
  // Cardiovascular: lactate + MAP
  const lactate = num('lactate', p.lactate, { min: 0, max: 40 });
  const lac = lactate < 5 ? 0 : (lactate < 11 ? 1 : 4);
  const m = PELOD2_MAP[band];
  const map = num('map', p.map, { min: 0, max: 250 });
  const mapPts = map >= m.c0 ? 0 : (map >= m.c2 ? 2 : (map >= m.c3 ? 3 : 6));
  parts.push(['Cardiovascular (lactate)', lac], ['Cardiovascular (MAP)', mapPts]);
  score += lac + mapPts;
  // Renal: creatinine by age
  const creat = num('creatinine', p.creatinine, { min: 0, max: 2000 });
  const renal = creat >= PELOD2_CREAT[band] ? 2 : 0;
  parts.push(['Renal (creatinine)', renal]); score += renal;
  // Respiratory: PaO2/FiO2 + PaCO2 + invasive ventilation
  const pf = num('pao2fio2', p.pao2fio2, { min: 0, max: 1000 });
  const pfPts = pf >= 61 ? 0 : 2;
  const paco2 = num('paco2', p.paco2, { min: 0, max: 200 });
  const co2Pts = paco2 <= 58 ? 0 : (paco2 <= 94 ? 1 : 3);
  const ventPts = B(p.invasiveVent) ? 3 : 0;
  parts.push(['Respiratory (PaO2/FiO2)', pfPts], ['Respiratory (PaCO2)', co2Pts], ['Respiratory (ventilation)', ventPts]);
  score += pfPts + co2Pts + ventPts;
  // Hematologic: WBC + platelets
  const wbc = num('wbc', p.wbc, { min: 0, max: 200 });
  const wbcPts = wbc >= 2 ? 0 : 2;
  const plt = num('platelets', p.platelets, { min: 0, max: 2000 });
  const pltPts = plt >= 142 ? 0 : (plt >= 77 ? 1 : 2);
  parts.push(['Hematologic (WBC)', wbcPts], ['Hematologic (platelets)', pltPts]);
  score += wbcPts + pltPts;
  const bandLabels = ['<1 mo', '1-11 mo', '12-23 mo', '24-59 mo', '60-143 mo', '>=144 mo'];
  return {
    score, parts,
    activeBand: bandLabels[band],
    note: `Age-banded MAP/creatinine cutoffs applied for ${bandLabels[band]}. Higher = worse; PELOD-2 is a cohort mortality-risk estimate, not an individual prognosis.`,
  };
}

// --- 2.8 psofa — Pediatric SOFA --------------------------------------------
// Six organ systems, age-adjusted cardiovascular and renal (Matics 2017).
// Total 0-24. Age-banded MAP and creatinine applied from ageMonths.
const PSOFA_MAP = [46, 55, 60, 62, 65, 67]; // <band -> 1 point (no vasoactive)
const PSOFA_CREAT = [ // mg/dL thresholds for points 1/2/3/4 by age band
  [0.8, 1.0, 1.2, 1.6], [0.3, 0.5, 0.7, 1.2], [0.4, 0.6, 1.1, 1.5],
  [0.6, 0.9, 1.6, 2.3], [0.7, 1.1, 1.8, 2.6], [1.0, 1.7, 2.9, 4.2],
];
export function psofa(p) {
  if (p == null || typeof p !== 'object') throw new TypeError('psofa requires an inputs object');
  const ageMonths = num('ageMonths', p.ageMonths, { min: 0, max: 300 });
  const band = ageBandIndex(ageMonths);
  const parts = [];
  let score = 0;
  // Respiration: PaO2/FiO2 (vent required for 3/4)
  const pf = num('pao2fio2', p.pao2fio2, { min: 0, max: 1000 });
  const vent = B(p.vent);
  let resp;
  if (pf >= 400) resp = 0; else if (pf >= 300) resp = 1; else if (pf >= 200) resp = 2;
  else if (pf >= 100) resp = vent ? 3 : 2; else resp = vent ? 4 : 2;
  parts.push(['Respiration', resp]); score += resp;
  // Coagulation: platelets x10^3
  const plt = num('platelets', p.platelets, { min: 0, max: 2000 });
  const coag = plt >= 150 ? 0 : plt >= 100 ? 1 : plt >= 50 ? 2 : plt >= 20 ? 3 : 4;
  parts.push(['Coagulation', coag]); score += coag;
  // Hepatic: bilirubin mg/dL
  const bili = num('bilirubin', p.bilirubin, { min: 0, max: 60 });
  const hep = bili < 1.2 ? 0 : bili < 2 ? 1 : bili < 6 ? 2 : bili < 12 ? 3 : 4;
  parts.push(['Hepatic', hep]); score += hep;
  // Cardiovascular: MAP by age or vasoactive grade
  const map = num('map', p.map, { min: 0, max: 250 });
  const vaso = typeof p.vasoactive === 'number' ? num('vasoactive', p.vasoactive, { min: 0, max: 4 }) : 0;
  let cv = map >= PSOFA_MAP[band] ? 0 : 1;
  if (vaso > cv) cv = vaso;
  parts.push(['Cardiovascular', cv]); score += cv;
  // Neuro: GCS
  const gcs = num('gcs', p.gcs, { min: 3, max: 15 });
  const neuro = gcs >= 15 ? 0 : gcs >= 13 ? 1 : gcs >= 10 ? 2 : gcs >= 6 ? 3 : 4;
  parts.push(['Neurologic', neuro]); score += neuro;
  // Renal: creatinine by age
  const creat = num('creatinine', p.creatinine, { min: 0, max: 30 });
  const ct = PSOFA_CREAT[band];
  const renal = creat < ct[0] ? 0 : creat < ct[1] ? 1 : creat < ct[2] ? 2 : creat < ct[3] ? 3 : 4;
  parts.push(['Renal', renal]); score += renal;
  const bandLabels = ['<1 mo', '1-11 mo', '12-23 mo', '24-59 mo', '60-143 mo', '>=144 mo'];
  return {
    score, parts,
    activeBand: bandLabels[band],
    note: `Age-banded cardiovascular/renal cutoffs applied for ${bandLabels[band]}. Higher = worse; companion to the adult SOFA.`,
  };
}

// --- 2.9 burch-wartofsky — thyroid-storm point scale ------------------------
// Weighted criteria across thermoregulatory, CNS, GI-hepatic, cardiovascular,
// and precipitant history (Burch & Wartofsky 1993). Each input is the selected
// point value for that category; total is summed.
export function burchWartofsky(p) {
  if (p == null || typeof p !== 'object') throw new TypeError('burch-wartofsky requires an inputs object');
  const temp = num('temp', p.temp ?? 0, { min: 0, max: 30 });
  const cns = num('cns', p.cns ?? 0, { min: 0, max: 30 });
  const gi = num('gi', p.gi ?? 0, { min: 0, max: 20 });
  const hr = num('hr', p.hr ?? 0, { min: 0, max: 25 });
  const chf = num('chf', p.chf ?? 0, { min: 0, max: 15 });
  const afib = B(p.afib) ? 10 : 0;
  const precip = B(p.precipitant) ? 10 : 0;
  const total = temp + cns + gi + hr + chf + afib + precip;
  let band;
  if (total >= 45) band = 'Highly suggestive of thyroid storm (>=45).';
  else if (total >= 25) band = 'Impending storm -- suggestive (25-44).';
  else band = 'Thyroid storm unlikely (<25).';
  return { total, band, note: 'Decision support for an endocrine emergency, not a diagnosis.' };
}

// --- 2.10 ariscat — postoperative pulmonary complication risk ---------------
// Seven weighted predictors (Canet 2010). Each input is a point value or flag.
export function ariscat(p) {
  if (p == null || typeof p !== 'object') throw new TypeError('ariscat requires an inputs object');
  const age = num('agePts', p.agePts ?? 0, { min: 0, max: 16 });       // 0 / 3 / 16
  const spo2 = num('spo2Pts', p.spo2Pts ?? 0, { min: 0, max: 24 });    // 0 / 8 / 24
  const incision = num('incisionPts', p.incisionPts ?? 0, { min: 0, max: 24 }); // 0 / 15 / 24
  const duration = num('durationPts', p.durationPts ?? 0, { min: 0, max: 23 }); // 0 / 16 / 23
  const infection = B(p.respInfection) ? 17 : 0;
  const anemia = B(p.anemia) ? 11 : 0;
  const emergency = B(p.emergency) ? 8 : 0;
  const total = age + spo2 + incision + duration + infection + anemia + emergency;
  let band;
  if (total >= 45) band = 'High risk (>=45): ~42% predicted postoperative pulmonary complication rate.';
  else if (total >= 26) band = 'Intermediate risk (26-44): ~13% predicted rate.';
  else band = 'Low risk (<26): ~1.6% predicted rate.';
  return { total, band, note: 'Predicts in-hospital postoperative pulmonary complications.' };
}

// --- 2.11 apache2 — ICU mortality estimate ----------------------------------
// Twelve acute-physiology variables + age points + chronic-health points
// (Knaus 1985). APS for each variable is a 0-4 step function; GCS contributes
// 15 - GCS. Total 0-71. Reports the APS/age/chronic breakdown and an
// approximate hospital-mortality band -- a cohort estimate, not a prognosis.
function apsStep(v, breaks) {
  // breaks: array of [lowInclusive, highInclusive, points] in descending point
  // order; returns the points for the first band that contains v.
  for (const [lo, hi, pts] of breaks) if (v >= lo && v <= hi) return pts;
  return 0;
}
export function apache2(p) {
  if (p == null || typeof p !== 'object') throw new TypeError('apache2 requires an inputs object');
  const temp = num('temp', p.temp, { min: 20, max: 46 });
  const map = num('map', p.map, { min: 0, max: 250 });
  const hr = num('hr', p.hr, { min: 0, max: 300 });
  const rr = num('rr', p.rr, { min: 0, max: 100 });
  const oxy = num('oxy', p.oxy, { min: 0, max: 700 }); // A-aDO2 or PaO2 proxy, scored below
  const ph = num('ph', p.ph, { min: 6.5, max: 8 });
  const na = num('na', p.na, { min: 80, max: 200 });
  const k = num('k', p.k, { min: 0, max: 12 });
  const creat = num('creatinine', p.creatinine, { min: 0, max: 25 }); // mg/dL
  const hct = num('hct', p.hct, { min: 0, max: 80 });
  const wbc = num('wbc', p.wbc, { min: 0, max: 200 }); // x10^3
  const gcs = num('gcs', p.gcs, { min: 3, max: 15 });
  const age = num('age', p.age, { min: 0, max: 120 });

  let aps = 0;
  const parts = [];
  const add = (label, pts) => { parts.push([label, pts]); aps += pts; };
  add('Temperature', apsStep(temp, [[41, 99, 4], [39, 40.9, 3], [38.5, 38.9, 1], [36, 38.4, 0], [34, 35.9, 1], [32, 33.9, 2], [30, 31.9, 3], [0, 29.9, 4]]));
  add('Mean arterial pressure', apsStep(map, [[160, 999, 4], [130, 159, 3], [110, 129, 2], [70, 109, 0], [50, 69, 2], [0, 49, 4]]));
  add('Heart rate', apsStep(hr, [[180, 999, 4], [140, 179, 3], [110, 139, 2], [70, 109, 0], [55, 69, 2], [40, 54, 3], [0, 39, 4]]));
  add('Respiratory rate', apsStep(rr, [[50, 999, 4], [35, 49, 3], [25, 34, 1], [12, 24, 0], [10, 11, 1], [6, 9, 2], [0, 5, 4]]));
  add('Oxygenation (PaO2)', apsStep(oxy, [[0, 54.9, 4], [55, 60, 3], [60.1, 70, 1], [70.1, 999, 0]]));
  add('Arterial pH', apsStep(ph, [[7.7, 9, 4], [7.6, 7.69, 3], [7.5, 7.59, 1], [7.33, 7.49, 0], [7.25, 7.32, 2], [7.15, 7.24, 3], [0, 7.14, 4]]));
  add('Serum sodium', apsStep(na, [[180, 999, 4], [160, 179, 3], [155, 159, 2], [150, 154, 1], [130, 149, 0], [120, 129, 2], [111, 119, 3], [0, 110, 4]]));
  add('Serum potassium', apsStep(k, [[7, 99, 4], [6, 6.9, 3], [5.5, 5.9, 1], [3.5, 5.4, 0], [3, 3.4, 1], [2.5, 2.9, 2], [0, 2.4, 4]]));
  // Creatinine: points double for acute renal failure (not modeled here; base table).
  add('Serum creatinine', apsStep(creat, [[3.5, 99, 4], [2, 3.4, 3], [1.5, 1.9, 2], [0.6, 1.4, 0], [0, 0.59, 2]]));
  add('Hematocrit', apsStep(hct, [[60, 999, 4], [50, 59.9, 2], [46, 49.9, 1], [30, 45.9, 0], [20, 29.9, 2], [0, 19.9, 4]]));
  add('White blood cell count', apsStep(wbc, [[40, 999, 4], [20, 39.9, 2], [15, 19.9, 1], [3, 14.9, 0], [1, 2.9, 2], [0, 0.9, 4]]));
  const gcsPts = 15 - gcs;
  add('Glasgow Coma Scale (15 - GCS)', gcsPts);

  const agePts = age >= 75 ? 6 : age >= 65 ? 5 : age >= 55 ? 3 : age >= 45 ? 2 : 0;
  const chronicPts = B(p.chronicHealth) ? (B(p.nonoperativeOrEmergency) ? 5 : 2) : 0;
  const total = aps + agePts + chronicPts;
  let band;
  if (total >= 35) band = 'Very high (>=35): ~85% approximate hospital mortality.';
  else if (total >= 25) band = 'High (25-34): ~55% approximate hospital mortality.';
  else if (total >= 15) band = 'Moderate (15-24): ~25% approximate hospital mortality.';
  else if (total >= 5) band = 'Low (5-14): ~8% approximate hospital mortality.';
  else band = 'Very low (0-4): ~4% approximate hospital mortality.';
  return {
    aps, agePts, chronicPts, total, parts, band,
    note: 'APACHE II is a cohort mortality estimate, not an individual prognosis.',
  };
}

// --- 2.12 braden-q — pediatric pressure-injury risk -------------------------
// Seven subscales, 1-4 each, total 7-28. Lower = higher risk; at-risk <=16.
export function bradenQ({ mobility, activity, sensory, moisture, friction, nutrition, perfusion }) {
  const items = [mobility, activity, sensory, moisture, friction, nutrition, perfusion];
  const total = sumItems(items, 1, 4, 'subscale');
  let band;
  if (total <= 16) band = 'At risk for pressure injury (<=16): initiate prevention protocol.';
  else band = 'Lower risk (>16): reassess per protocol.';
  return { total, band, note: 'Lower = higher risk (the inverse of most scores); pediatric counterpart to the adult Braden.' };
}
