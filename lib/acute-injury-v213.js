// spec-v213: emergency-department disposition & injury/physiology bedside
// instruments. Every id was verified absent by a direct scan of app.js first
// (spec-v85 §6.2). None duplicates a live tile; v213 runs no AI and makes no
// runtime network call. These stratify disposition / classify fluid / estimate
// burn mortality — they are NOT an admission, discharge, endoscopy, or
// treatment order (spec-v11 §5.3). Shipped one spec at a time per an active
// /goal.
//
//   heartPathway  - HEART Pathway early-discharge (HEART score + serial troponin)
//   ottawaHf      - Ottawa Heart Failure Risk Scale (OHFRS)
//   lightCriteria - Light's criteria (pleural exudate vs transudate)
//   bauxScore     - classic Baux score (burn mortality)
//   revisedBaux   - revised Baux score (adds inhalation injury)
//
// CUT-POINTS / POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation.

import { num, r1 } from './num.js';

function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return null;
  return n;
}
function bool(v) {
  return v === true || v === 1 || v === '1' || v === 'true' || v === 'on';
}

// --- 2.1 HEART Pathway --------------------------------------------------------
// RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified against Mahler SA, et al,
// Circ Cardiovasc Qual Outcomes 2015;8(2):195-203 (the randomized trial) and the
// HEART Pathway ADP concept paper (Mahler SA, et al, Crit Pathw Cardiol
// 2011;10(3):128-133): the HEART Pathway = HEART score 0-3 AND a NON-elevated
// troponin at 0 h AND at 3 h -> low risk, an early-discharge candidate (~0.9-2%
// 30-day MACE); HEART score >= 4 OR any positive troponin -> not low risk,
// further observation / testing.
const HEART_PATHWAY_NOTE = 'HEART Pathway (Mahler SA, et al, Circ Cardiovasc Qual Outcomes 2015;8(2):195-203): pairs the HEART score with serial troponin. A HEART score of 0-3 AND a non-elevated troponin at 0 h and 3 h identifies a low-risk patient who is an early-discharge candidate (~0.9-2% 30-day major adverse cardiac events); a HEART score >= 4 or any elevated troponin is not low risk. A disposition-support rule, not an admission or discharge order.';

export function heartPathway(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const heart = pos(o.heartScore, 10);
  if (heart === null) {
    return { valid: false, message: 'Enter the HEART score (0-10) and mark whether the 0-hour and 3-hour troponin are elevated.' };
  }
  const heartR = Math.round(num('HEART', heart, { min: 0, max: 10 }));
  const trop0 = bool(o.trop0);
  const trop3 = bool(o.trop3);
  const lowRisk = heartR <= 3 && !trop0 && !trop3;
  const tropText = trop0 || trop3
    ? `troponin elevated (${[trop0 ? '0 h' : null, trop3 ? '3 h' : null].filter(Boolean).join(' and ')})`
    : 'both troponins non-elevated';
  const band = lowRisk
    ? `Low risk (HEART ${heartR} and both troponins non-elevated): early-discharge candidate (~0.9-2% 30-day MACE).`
    : `Not low risk (${heartR >= 4 ? `HEART ${heartR}` : `HEART ${heartR}`}${trop0 || trop3 ? ', ' + tropText : ''}): further observation / testing.`;
  return {
    valid: true,
    heart: heartR,
    lowRisk,
    abnormal: !lowRisk,
    bandLabel: lowRisk ? 'Low risk — early discharge candidate' : 'Not low risk',
    band,
    detail: `HEART score ${heartR}; ${tropText}.`,
    note: HEART_PATHWAY_NOTE,
  };
}

// --- 2.2 Ottawa Heart Failure Risk Scale -------------------------------------
// POINT SYSTEM RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified against the
// derivation (Stiell IG, et al, Acad Emerg Med 2013;20(1):17-26) and the
// prospective validation (Stiell IG, et al, Acad Emerg Med 2017;24(3):316-327):
// 10 weighted items summing 0-15; serious-adverse-event risk rises from ~2.8%
// at 0 to ~89% at the high end. The authors recommend an admission threshold of
// > 1 (a score >= 2 gives sensitivity similar to prior practice with fewer
// admissions).
const OHFRS_ITEMS = [
  ['strokeTia', 1, 'history of stroke or TIA'],
  ['intubation', 2, 'prior intubation for respiratory distress'],
  ['hrArrival', 2, 'heart rate >= 110 on ED arrival'],
  ['spo2', 1, 'SaO2 < 90% on arrival'],
  ['hrWalk', 1, 'heart rate >= 110 on 3-minute walk (or too ill to walk)'],
  ['ischemia', 2, 'new ischemic changes on ECG'],
  ['urea', 1, 'serum urea >= 12 mmol/L'],
  ['co2', 2, 'serum CO2 >= 35 mmol/L'],
  ['troponin', 2, 'troponin elevated to MI level'],
  ['ntprobnp', 1, 'NT-proBNP >= 5000 ng/L'],
];
const OHFRS_NOTE = 'Ottawa Heart Failure Risk Scale (Stiell IG, et al, Acad Emerg Med 2013;20(1):17-26): 10 weighted items (0-15) for ED heart-failure patients. Serious-adverse-event risk rises from ~2.8% at a score of 0 to ~89% at the high end; the authors suggest an admission threshold of > 1 (a score >= 2 keeps sensitivity similar to usual practice while admitting fewer patients). A risk-stratification scale, not an admission order.';

export function ottawaHf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let score = 0;
  const present = [];
  for (const [key, pts, label] of OHFRS_ITEMS) {
    if (bool(o[key])) { score += pts; present.push(label); }
  }
  score = Math.round(num('OHFRS', score, { min: 0, max: 15 }));
  let tier; let abnormal = true;
  if (score >= 2) tier = 'higher risk (>= 2): at or above the recommended admission threshold';
  else if (score === 1) tier = 'low-moderate risk (1): above the > 1 admission threshold by one point — use clinical judgment';
  else { tier = 'lowest measured risk (0): ~2.8% serious adverse events'; abnormal = false; }
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `OHFRS ${score}`,
    band: `Ottawa Heart Failure Risk Scale ${score} — ${tier}.`,
    detail: present.length ? `Positive: ${present.join('; ')}.` : 'No risk items marked.',
    note: OHFRS_NOTE,
  };
}

// --- 2.3 Light's criteria ----------------------------------------------------
// RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified against the derivation
// (Light RW, Macgregor MI, Luchsinger PC, Ball WC Jr, Ann Intern Med
// 1972;77(4):507-513) and StatPearls (Pleural Effusion, NBK448189): a pleural
// effusion is an EXUDATE if ANY of - pleural/serum protein ratio > 0.5;
// pleural/serum LDH ratio > 0.6; pleural LDH > two-thirds the upper limit of
// normal serum LDH. If none are met it is a TRANSUDATE.
const LIGHT_NOTE = "Light's criteria (Light RW, et al, Ann Intern Med 1972;77(4):507-513): a pleural effusion is an exudate if ANY of - pleural/serum protein ratio > 0.5; pleural/serum LDH ratio > 0.6; pleural LDH > two-thirds the upper limit of normal serum LDH. If none are met it is a transudate. Highly sensitive for exudates (it can misclassify ~15-20% of transudates as exudates). A classification, not a drainage or workup order.";

export function lightCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pProt = pos(o.pleuralProtein, 100);
  const sProt = pos(o.serumProtein, 100);
  const pLdh = pos(o.pleuralLdh, 100000);
  const sLdh = pos(o.serumLdh, 100000);
  const sLdhUln = pos(o.serumLdhUln, 100000);
  if (pProt === null || sProt === null || pLdh === null || sLdh === null || sLdhUln === null || sProt === 0 || sLdh === 0 || sLdhUln === 0) {
    return { valid: false, message: 'Enter pleural and serum total protein (g/dL), pleural and serum LDH, and the upper limit of normal for serum LDH (all greater than 0).' };
  }
  const protRatio = r1(num('protein ratio', (pProt / sProt) * 100, { min: 0, max: 1e6 })) / 100;
  const ldhRatio = r1(num('LDH ratio', (pLdh / sLdh) * 100, { min: 0, max: 1e6 })) / 100;
  const ldhThreshold = (2 / 3) * sLdhUln;
  const met = [];
  if (protRatio > 0.5) met.push(`protein ratio ${protRatio} > 0.5`);
  if (ldhRatio > 0.6) met.push(`LDH ratio ${ldhRatio} > 0.6`);
  if (pLdh > ldhThreshold) met.push(`pleural LDH ${r1(pLdh)} > ${r1(ldhThreshold)} (2/3 ULN)`);
  const exudate = met.length > 0;
  return {
    valid: true,
    exudate,
    protRatio,
    ldhRatio,
    abnormal: exudate,
    bandLabel: exudate ? 'Exudate' : 'Transudate',
    band: exudate
      ? `Exudate — meets Light's criteria (${met.join('; ')}).`
      : "Transudate — meets none of Light's criteria.",
    detail: `Protein ratio ${protRatio}, LDH ratio ${ldhRatio}, pleural LDH vs 2/3 ULN ${r1(pLdh)} vs ${r1(ldhThreshold)}.`,
    note: LIGHT_NOTE,
  };
}

// --- 2.4 / 2.5 Baux and revised Baux -----------------------------------------
// RE-FETCHED, NEVER RECALLED (spec-v97). Classic Baux = age + %TBSA (Baux S,
// thesis, Paris 1961; reviewed in Roberts G, et al, J Trauma Acute Care Surg
// 2012;72(1):251-256). Revised Baux = age + %TBSA + 17 x (inhalation injury)
// (Osler T, Glance LG, Hosmer DW, J Trauma 2010;68(3):690-697), whose LD50 in the
// best modern burn units is a score of ~130-140.
function bauxBand(score) {
  if (score >= 160) return 'near-universally fatal even with modern care';
  if (score >= 130) return 'around the LD50 for well-performing burn units (~130-140)';
  if (score >= 100) return 'historically near-universally fatal; survivable with modern intensive burn care';
  return 'lower predicted mortality';
}
const BAUX_NOTE = 'Baux score (Baux S, Paris 1961; reviewed in Roberts G, et al, J Trauma Acute Care Surg 2012;72(1):251-256): burn mortality estimate = age (years) + burned total body surface area (%TBSA). A score approaching 100 was near-universally fatal in the pre-modern era; modern burn care has shifted survivable thresholds substantially higher. A prognostic estimate, not a triage or treatment order.';
const REVISED_BAUX_NOTE = 'Revised Baux score (Osler T, Glance LG, Hosmer DW, J Trauma 2010;68(3):690-697): age (years) + burned %TBSA + 17 if inhalation injury is present. Adding inhalation injury sharply raises predicted mortality; the LD50 in the best modern burn units is a score of ~130-140. A prognostic estimate, not a triage or treatment order.';

export function bauxScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const tbsa = pos(o.tbsa, 100);
  if (age === null || tbsa === null) {
    return { valid: false, message: 'Enter age (years) and burned total body surface area (%TBSA, 0-100).' };
  }
  const score = Math.round(num('Baux', age + tbsa, { min: 0, max: 230 }));
  const band = bauxBand(score);
  return {
    valid: true,
    score,
    abnormal: score >= 100,
    bandLabel: `Baux ${score}`,
    band: `Baux score ${score} — ${band}.`,
    detail: `age ${Math.round(age)} + %TBSA ${r1(tbsa)} = ${score}.`,
    note: BAUX_NOTE,
  };
}

export function revisedBaux(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const tbsa = pos(o.tbsa, 100);
  if (age === null || tbsa === null) {
    return { valid: false, message: 'Enter age (years), burned %TBSA (0-100), and whether inhalation injury is present.' };
  }
  const inhalation = bool(o.inhalation);
  const classic = Math.round(age + tbsa);
  const score = Math.round(num('revised Baux', age + tbsa + (inhalation ? 17 : 0), { min: 0, max: 247 }));
  const band = bauxBand(score);
  return {
    valid: true,
    score,
    classic,
    inhalation,
    abnormal: score >= 100,
    bandLabel: `Revised Baux ${score}`,
    band: `Revised Baux score ${score} — ${band}.`,
    detail: `age ${Math.round(age)} + %TBSA ${r1(tbsa)}${inhalation ? ' + 17 (inhalation injury)' : ''} = ${score} (classic Baux ${classic}).`,
    note: REVISED_BAUX_NOTE,
  };
}
