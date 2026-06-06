// spec-v57: brief screeners, decision rules, and triage scores (Group G).
// Pure functions only. Citations live inline in lib/meta.js; renderers in
// views/group-v9.js wire these to the home grid. num/fmt come from lib/num.js
// (spec-v53 §4.1). Item screeners clamp each item to its declared range via
// num(); decision rules are boolean/threshold logic (no division). years-pe
// and edacs surface their conditional thresholds explicitly. sipa/iss-rts guard
// every division denominator -> null -> fmt() fallback, never a non-finite DOM
// value (spec-v53 §3).

import { num, r1, r2 } from './num.js';

const B = (v) => v === true || v === 1 || v === '1' || v === 'true';

// --- 2.1 phq2-gad2 ----------------------------------------------------------
// PHQ-2 (Kroenke 2003) + GAD-2 (Kroenke 2007). Each item 0-3; positive >=3.
export function phq2Gad2({ d1, d2, a1, a2 }) {
  for (const [n, v] of [['d1', d1], ['d2', d2], ['a1', a1], ['a2', a2]]) num(n, v, { min: 0, max: 3 });
  const phq2 = d1 + d2;
  const gad2 = a1 + a2;
  return {
    phq2, gad2,
    phqPositive: phq2 >= 3,
    gadPositive: gad2 >= 3,
    phqBand: phq2 >= 3 ? 'PHQ-2 positive (>=3): administer the full PHQ-9.' : 'PHQ-2 negative (<3).',
    gadBand: gad2 >= 3 ? 'GAD-2 positive (>=3): administer the full GAD-7.' : 'GAD-2 negative (<3).',
  };
}

// --- 2.2 audit-full ---------------------------------------------------------
// WHO AUDIT (Saunders 1993; Babor 2001). Ten items 0-4; zones at 8/16/20.
export function auditFull({ items }) {
  if (!Array.isArray(items) || items.length !== 10) throw new TypeError('items must be an array of 10 values');
  let total = 0;
  for (let i = 0; i < 10; i += 1) { num(`item${i + 1}`, items[i], { min: 0, max: 4 }); total += items[i]; }
  let band;
  if (total >= 20) band = 'Zone IV (>=20): likely alcohol dependence -- refer to specialist for diagnostic evaluation and treatment.';
  else if (total >= 16) band = 'Zone III (16-19): harmful use -- brief counselling plus continued monitoring.';
  else if (total >= 8) band = 'Zone II (8-15): hazardous use -- brief intervention.';
  else band = 'Zone I (0-7): low-risk use -- alcohol education.';
  return { total, band };
}

// --- 2.3 dast10 -------------------------------------------------------------
// DAST-10 (Skinner 1982; Yudko 2007). Ten yes/no; item 3 reverse-scored
// ("No" scores 1). Bands: 0 none, 1-2 low, 3-5 moderate, 6-8 substantial,
// 9-10 severe.
export function dast10({ items }) {
  if (!Array.isArray(items) || items.length !== 10) throw new TypeError('items must be an array of 10 booleans');
  let total = 0;
  for (let i = 0; i < 10; i += 1) {
    const yes = B(items[i]);
    // Item 3 ("Are you always able to stop using drugs when you want to?")
    // is reverse-scored: "No" (not always able) scores 1.
    total += (i === 2) ? (yes ? 0 : 1) : (yes ? 1 : 0);
  }
  let band;
  if (total >= 9) band = 'Severe (9-10): intensive assessment indicated.';
  else if (total >= 6) band = 'Substantial (6-8): intensive assessment indicated.';
  else if (total >= 3) band = 'Moderate (3-5): further assessment indicated.';
  else if (total >= 1) band = 'Low (1-2): monitor, reassess.';
  else band = 'None reported (0).';
  return { total, band };
}

// --- 2.4 gds15 --------------------------------------------------------------
// Geriatric Depression Scale short form (Sheikh & Yesavage 1986). Fifteen
// yes/no; items 1,5,7,11,13 score 1 for "No", the rest score 1 for "Yes".
const GDS_NO_SCORES = new Set([1, 5, 7, 11, 13]);
export function gds15({ items }) {
  if (!Array.isArray(items) || items.length !== 15) throw new TypeError('items must be an array of 15 booleans');
  let total = 0;
  for (let i = 0; i < 15; i += 1) {
    const yes = B(items[i]);
    const scoresOnNo = GDS_NO_SCORES.has(i + 1);
    total += scoresOnNo ? (yes ? 0 : 1) : (yes ? 1 : 0);
  }
  let band;
  if (total >= 12) band = 'Severe depression (12-15).';
  else if (total >= 9) band = 'Moderate depression (9-11).';
  else if (total >= 5) band = 'Mild depression (5-8): suggestive, evaluate further.';
  else band = 'Normal (0-4).';
  return { total, band };
}

// --- 2.5 ottawa-knee --------------------------------------------------------
// Ottawa Knee Rule (Stiell 1995). X-ray indicated if ANY criterion present.
export function ottawaKnee({ age55, patellarTender, fibularHeadTender, cannotFlex90, cannotBearWeight }) {
  const any = B(age55) || B(patellarTender) || B(fibularHeadTender) || B(cannotFlex90) || B(cannotBearWeight);
  return {
    xrayIndicated: any,
    band: any
      ? 'Knee x-ray indicated (>=1 criterion present).'
      : 'No criterion present: x-ray can be safely deferred.',
  };
}

// --- 2.6 nexus-chest --------------------------------------------------------
// NEXUS Chest (Rodriguez 2015). Imaging may be deferred ONLY if all absent.
export function nexusChest({ abnormalCxr, distractingInjury, chestWallTender, age60, rapidDecel, intoxication, alteredAlertness }) {
  const any = B(abnormalCxr) || B(distractingInjury) || B(chestWallTender) || B(age60) || B(rapidDecel) || B(intoxication) || B(alteredAlertness);
  return {
    imagingIndicated: any,
    band: any
      ? 'Chest imaging indicated (>=1 criterion present).'
      : 'All criteria absent: chest imaging may be deferred (high sensitivity for major thoracic injury).',
  };
}

// --- 2.7 sfsr (San Francisco Syncope Rule, "CHESS") -------------------------
// Quinn 2004. High-risk if ANY of CHF, Hct <30%, ECG abnormal, SOB, SBP <90.
export function sfsr({ chf, hctLow, ecgAbnormal, sob, sbpLow }) {
  const any = B(chf) || B(hctLow) || B(ecgAbnormal) || B(sob) || B(sbpLow);
  return {
    highRisk: any,
    band: any
      ? 'High risk: >=1 CHESS criterion present -- admission/workup for serious 7-day outcome.'
      : 'Low risk: no CHESS criterion present.',
  };
}

// --- 2.8 canadian-syncope --------------------------------------------------
// Canadian Syncope Risk Score (Thiruganasambandamoorthy 2016). Range -3..+11.
export function canadianSyncope({ vasovagalPredisp, heartDisease, sbpExtreme, tropElevated, abnormalAxis, qrsProlonged, qtcProlonged, edxVasovagal, edxCardiac }) {
  let score = 0;
  if (B(vasovagalPredisp)) score -= 1;
  if (B(heartDisease)) score += 1;
  if (B(sbpExtreme)) score += 2;        // any SBP <90 or >180
  if (B(tropElevated)) score += 2;      // troponin > 99th percentile
  if (B(abnormalAxis)) score += 1;      // QRS axis <-30 or >100 deg
  if (B(qrsProlonged)) score += 1;      // QRS >130 ms
  if (B(qtcProlonged)) score += 2;      // QTc >480 ms
  if (B(edxVasovagal)) score -= 2;
  if (B(edxCardiac)) score += 2;
  let band;
  if (score <= -2) band = 'Very low risk (0.4-0.7% 30-day serious outcome).';
  else if (score <= 0) band = 'Low risk (1.2-1.9%).';
  else if (score <= 3) band = 'Medium risk (3.1-8.1%).';
  else if (score <= 5) band = 'High risk (12.9-19.7%).';
  else band = 'Very high risk (28.9-83.6%).';
  return { score, band };
}

// --- 2.9 edacs --------------------------------------------------------------
// EDACS / EDACS-ADP (Than 2014). Age points (2 per 5-yr band from 18-45=2),
// male +6, age 18-50 with CAD/>=3 risk factors +4, plus symptom features.
// ADP low-risk: score <16 AND non-ischemic ECG AND 0/2-h troponins negative.
function edacsAgePoints(age) {
  if (age <= 45) return 2;
  if (age >= 86) return 20;
  // 46-50 ->4, 51-55 ->6 ... each 5-year band adds 2.
  return 4 + Math.floor((age - 46) / 5) * 2;
}
export function edacs({ age, male, riskOrCad, diaphoresis, painRadiates, painInspiration, painPalpation, ecgIschemic, trop0Pos, trop2Pos }) {
  num('age', age, { min: 18, max: 120 });
  let score = edacsAgePoints(age);
  if (B(male)) score += 6;
  if (age <= 50 && B(riskOrCad)) score += 4;
  if (B(diaphoresis)) score += 3;
  if (B(painRadiates)) score += 5;
  if (B(painInspiration)) score -= 4;
  if (B(painPalpation)) score -= 6;
  const lowRisk = score < 16 && !B(ecgIschemic) && !B(trop0Pos) && !B(trop2Pos);
  return {
    score,
    lowRisk,
    band: lowRisk
      ? 'EDACS-ADP low risk: score <16, non-ischemic ECG, negative 0/2-h troponins -- early-discharge candidate.'
      : 'Not low risk by EDACS-ADP: score >=16, or ischemic ECG, or a positive troponin -- further observation/workup.',
  };
}

// --- 2.10 years-pe ----------------------------------------------------------
// YEARS algorithm (van der Hulle 2017). 0 items -> D-dimer threshold 1000;
// >=1 item -> threshold 500. PE excluded if D-dimer < threshold.
export function yearsPe({ dvtSigns, hemoptysis, peMostLikely, dDimer }) {
  num('dDimer', dDimer, { min: 0, max: 100000 });
  const itemCount = (B(dvtSigns) ? 1 : 0) + (B(hemoptysis) ? 1 : 0) + (B(peMostLikely) ? 1 : 0);
  const threshold = itemCount === 0 ? 1000 : 500;
  const excluded = dDimer < threshold;
  return {
    itemCount,
    threshold,
    excluded,
    band: excluded
      ? `PE excluded: ${itemCount} YEARS item(s), D-dimer ${dDimer} < ${threshold} ng/mL threshold -- no CTPA needed.`
      : `CTPA indicated: D-dimer ${dDimer} >= ${threshold} ng/mL threshold (${itemCount} YEARS item(s)).`,
  };
}

// --- 2.11 feverpain ---------------------------------------------------------
// FeverPAIN (Little 2013; NICE NG84). Five items, total 0-5.
export function feverpain({ fever, purulence, attendRapid, inflamedTonsils, noCough }) {
  const total = (B(fever) ? 1 : 0) + (B(purulence) ? 1 : 0) + (B(attendRapid) ? 1 : 0) + (B(inflamedTonsils) ? 1 : 0) + (B(noCough) ? 1 : 0);
  let band;
  if (total >= 4) band = 'Score 4-5: 62-65% streptococci -- consider immediate or short delayed antibiotic.';
  else if (total >= 2) band = 'Score 2-3: 34-40% streptococci -- consider a delayed (backup) antibiotic.';
  else band = 'Score 0-1: 13-18% streptococci -- no antibiotic strategy.';
  return { total, band };
}

// --- 2.12 stone-score -------------------------------------------------------
// STONE score (Moore 2014). Sex, Timing, Origin, Nausea, Erythrocytes.
export function stoneScore({ sex, timing, nonBlack, nausea, hematuria }) {
  let score = 0;
  if (sex === 'male') score += 2;
  if (timing === 'lt6') score += 3; else if (timing === '6to24') score += 1;
  if (B(nonBlack)) score += 3;
  if (nausea === 'vomiting') score += 2; else if (nausea === 'nausea') score += 1;
  if (B(hematuria)) score += 3;
  let band;
  if (score >= 10) band = 'High probability (10-13): uncomplicated ureteral stone likely -- consider deferring CT if no red flags.';
  else if (score >= 6) band = 'Moderate probability (6-9).';
  else band = 'Low probability (0-5).';
  return { score, band };
}

// --- 2.13 iss-rts -----------------------------------------------------------
// ISS (Baker 1974) + RTS (Champion 1989). ISS = sum of squares of the three
// highest AIS region scores (0-75); any region = 6 -> ISS 75. RTS = coded
// physiologic score 0-7.84.
function rtsGcsCode(g) { if (g >= 13) return 4; if (g >= 9) return 3; if (g >= 6) return 2; if (g >= 4) return 1; return 0; }
function rtsSbpCode(s) { if (s > 89) return 4; if (s >= 76) return 3; if (s >= 50) return 2; if (s >= 1) return 1; return 0; }
function rtsRrCode(r) { if (r >= 10 && r <= 29) return 4; if (r > 29) return 3; if (r >= 6) return 2; if (r >= 1) return 1; return 0; }
export function issRts({ ais1, ais2, ais3, gcs, sbp, rr }) {
  num('ais1', ais1, { min: 0, max: 6 });
  num('ais2', ais2, { min: 0, max: 6 });
  num('ais3', ais3, { min: 0, max: 6 });
  num('gcs', gcs, { min: 3, max: 15 });
  num('sbp', sbp, { min: 0, max: 300 });
  num('rr', rr, { min: 0, max: 80 });
  const iss = (ais1 === 6 || ais2 === 6 || ais3 === 6)
    ? 75
    : ais1 * ais1 + ais2 * ais2 + ais3 * ais3;
  const rts = r2(0.9368 * rtsGcsCode(gcs) + 0.7326 * rtsSbpCode(sbp) + 0.2908 * rtsRrCode(rr));
  return {
    iss,
    majorTrauma: iss >= 16,
    rts,
    issBand: iss >= 16 ? `ISS ${iss}: major trauma (>=16).` : `ISS ${iss}: below the major-trauma threshold (16).`,
  };
}

// --- 2.14 sipa --------------------------------------------------------------
// Shock Index, Pediatric Age-Adjusted (Acker 2015). SI = HR/SBP; elevated
// cutoffs 1.22 (4-6 yr), 1.0 (7-12 yr), 0.9 (13-16 yr).
export function sipa({ ageYears, hr, sbp }) {
  num('ageYears', ageYears, { min: 1, max: 18 });
  num('hr', hr, { min: 0, max: 300 });
  num('sbp', sbp, { min: 1, max: 300 });
  const si = hr / sbp;
  let cutoff; let inRange = true;
  if (ageYears >= 4 && ageYears <= 6) cutoff = 1.22;
  else if (ageYears >= 7 && ageYears <= 12) cutoff = 1.0;
  else if (ageYears >= 13 && ageYears <= 16) cutoff = 0.9;
  else { cutoff = null; inRange = false; }
  const elevated = cutoff != null ? si > cutoff : null;
  let band;
  if (!inRange) band = 'SIPA cutoffs are validated for ages 4-16 only; interpret outside this range with caution.';
  else if (elevated) band = `Elevated SIPA (SI ${r2(si)} > ${cutoff}): higher injury severity / transfusion risk.`;
  else band = `Within age-adjusted range (SI ${r2(si)} <= ${cutoff}).`;
  return { shockIndex: r2(si), cutoff, elevated, band };
}
