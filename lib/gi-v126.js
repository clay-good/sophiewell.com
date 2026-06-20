// spec-v126 (Wave 5 of the spec-v100 MDCalc Parity Completion program): six
// deterministic GI disease-activity and pancreatitis-severity instruments that
// bring the IBD and pancreatitis clusters to clinical-trial parity beside the v93
// harvey-bradshaw / truelove-witts / mayo-uc and the glasgow-imrie / ranson
// tiles. None duplicates a live tile; each takes the clinician's diary, endoscopic
// read, exam, or imaging read as input.
//
//   cdaiCrohns        - Crohn's Disease Activity Index (8 weighted items, ~0-600)
//   uceis             - UC Endoscopic Index of Severity (0-8)
//   sesCd             - Simple Endoscopic Score for Crohn's Disease (0-56)
//   haps              - Harmless Acute Pancreatitis Score (3-criterion gate)
//   ctsiBalthazar     - CT Severity Index (Balthazar) 0-10
//   modifiedMarshall  - Modified Marshall organ-dysfunction score (Revised Atlanta)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v126.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the score / determination and the source's
// framing; the management decision stays with the clinician (spec-v11 §5.3).
//
// WEIGHTS / SCALES / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each
// cross-verified across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - cdaiCrohns (Best 1976, Gastroenterology): eight weighted 7-day items --
//     liquid stools x2, abdominal pain (daily 0-3) x5, general well-being (daily
//     0-4) x7, complications count x20, antidiarrheal use x30, abdominal mass
//     (0/2/5) x10, hematocrit deficit (47-Hct men / 42-Hct women) x6, and percent
//     below standard body weight (1 - weight/standard) x100 x1. Bands < 150
//     remission, 150-220 mild, 221-450 moderate, > 450 severe (the mild/moderate
//     split is a trial convention, not in the 1976 paper).
//   - uceis (Travis 2012, Gut): three endoscopic descriptors -- vascular pattern
//     (0-2), bleeding (0-3), erosions/ulcers (0-3) -- summed 0-8. The 0-based
//     scale (MDCalc / modern practice) is used; the ORIGINAL 2012 paper was
//     1-based (3-11), later rebased to zero. Remission 0-1, mild 2-4, moderate
//     5-6, severe 7-8.
//   - sesCd (Daperno 2004, Gastrointest Endosc): four variables (ulcer size,
//     ulcerated surface, affected surface, stenosis), each 0-3 per ileocolonic
//     segment, across 5 segments. SOURCE GOVERNANCE: the stenosis sub-total is
//     CAPPED at 11 (not 15) because "cannot be passed" (3) ends the exam, so the
//     true maximum is 56 (15+15+15+11), NOT the naive 60 some calculators show.
//     Bands 0-2 remission, 3-6 mild, 7-15 moderate, > 15 severe.
//   - haps (Lankisch 2009, Clin Gastroenterol Hepatol): a three-criterion gate --
//     no rebound/guarding, hematocrit normal (< 43 men / < 39.6 women), and
//     creatinine normal (< 2 mg/dL). ALL THREE normal predicts a harmless
//     (non-severe) course (specificity ~97%, PPV ~98%); any abnormal does NOT rule
//     severity in. The cutoff value itself counts as abnormal (strict <).
//   - ctsiBalthazar (Balthazar 1990, Radiology): CT grade A-E (0-4) + pancreatic
//     necrosis (none 0, <= 30% 2, 30-50% 4, > 50% 6) = total 0-10. Bands 0-3 mild,
//     4-6 moderate, 7-10 severe.
//   - modifiedMarshall (Banks 2013, Gut; Revised Atlanta): three organ systems --
//     respiratory (PaO2/FiO2: > 400 = 0, 301-400 = 1, 201-300 = 2, 101-200 = 3,
//     <= 101 = 4), renal (creatinine mg/dL: < 1.4 = 0, 1.4-1.8 = 1, 1.9-3.6 = 2,
//     3.6-4.9 = 3, > 4.9 = 4), and cardiovascular (systolic BP / fluid / pH, 0-4) --
//     organ FAILURE when any assessed system scores >= 2 (the Revised Atlanta
//     threshold). A blank system is reported as not-assessed, not scored 0.

import { r2 } from './num.js';

const pos = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const numOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clampInt = (v, lo, hi) => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return lo;
  const r = Math.round(n);
  return r < lo ? lo : r > hi ? hi : r;
};
const obj = (input) => (input && typeof input === 'object' ? input : {});
const sumArr = (a) => (Array.isArray(a) ? a.reduce((s, v) => s + clampInt(v, 0, 3), 0) : 0);

// --- 2.1 cdai-crohns ----------------------------------------------------------
const CDAI_NOTE = 'Crohn\'s Disease Activity Index (Best WR, Becktel JM, Singleton JW, Kern F Jr, Gastroenterology 1976): the eight-item weighted score that defines remission and response in Crohn\'s trials. It sums liquid stools (7-day) x2, abdominal pain (daily 0-3, 7-day sum) x5, general well-being (daily 0-4, 7-day sum) x7, complications x20, antidiarrheal use x30, abdominal mass (0/2/5) x10, hematocrit deficit (47 minus Hct for men, 42 minus Hct for women) x6, and percent below standard body weight x1. Bands: under 150 remission, 150-220 mild, 221-450 moderate, over 450 severe. It frames disease activity; the treatment decision stays with the clinician.';

export function cdaiCrohns(input = {}) {
  const o = obj(input);
  const hct = pos(o.hct);
  const weight = pos(o.weight);
  const standard = pos(o.standardWeight);
  if (hct === null || weight === null || standard === null) return { valid: false, message: 'Enter hematocrit, weight, and standard weight (all positive).' };
  const stools = clampInt(o.stools, 0, 1000);
  const pain = clampInt(o.pain, 0, 21);
  const wellbeing = clampInt(o.wellbeing, 0, 28);
  const complications = clampInt(o.complications, 0, 6);
  const antidiarrheal = onFlag(o.antidiarrheal) ? 1 : 0;
  const mass = clampInt(o.abdMass, 0, 5); // 0 none, 2 questionable, 5 definite
  const ref = onFlag(o.female) ? 42 : 47;
  const hctDeficit = ref - hct;
  const weightPct = (1 - weight / standard) * 100;
  const total = Math.round(
    stools * 2 + pain * 5 + wellbeing * 7 + complications * 20 + antidiarrheal * 30 + mass * 10 + hctDeficit * 6 + weightPct,
  );
  let band; let high;
  if (total > 450) { band = 'severe disease'; high = true; }
  else if (total > 220) { band = 'moderate disease'; high = true; }
  else if (total >= 150) { band = 'mild disease'; high = false; }
  else { band = 'clinical remission'; high = false; }
  return {
    valid: true, total,
    abnormal: high,
    band: `CDAI ${total}: ${band} (< 150 remission, 150-220 mild, 221-450 moderate, > 450 severe).`,
    note: CDAI_NOTE,
  };
}

// --- 2.2 uceis ----------------------------------------------------------------
const UCEIS_NOTE = 'Ulcerative Colitis Endoscopic Index of Severity (Travis SP, Schnell D, Krzeski P, et al, Gut 2012): three endoscopic descriptors scored at the worst-affected area -- vascular pattern (0 normal, 1 patchy obliteration, 2 obliterated), bleeding (0 none, 1 mucosal, 2 luminal mild, 3 luminal moderate/severe), and erosions/ulcers (0 none, 1 erosions, 2 superficial ulcer, 3 deep ulcer) -- summed 0-8. The 0-based scale (modern practice) is used; the original 2012 paper was 1-based (3-11), later rebased to zero. Remission 0-1, mild 2-4, moderate 5-6, severe 7-8. It frames endoscopic severity; the management decision stays with the clinician.';

export function uceis(input = {}) {
  const o = obj(input);
  const vascular = clampInt(o.vascular, 0, 2);
  const bleeding = clampInt(o.bleeding, 0, 3);
  const erosions = clampInt(o.erosions, 0, 3);
  const total = vascular + bleeding + erosions;
  let band; let high;
  if (total >= 7) { band = 'severe'; high = true; }
  else if (total >= 5) { band = 'moderate'; high = true; }
  else if (total >= 2) { band = 'mild'; high = false; }
  else { band = 'remission/normal'; high = false; }
  return {
    valid: true, total,
    abnormal: high,
    band: `UCEIS ${total}/8: ${band} endoscopic activity.`,
    note: UCEIS_NOTE,
  };
}

// --- 2.3 ses-cd ---------------------------------------------------------------
const SESCD_NOTE = 'Simple Endoscopic Score for Crohn\'s Disease (Daperno M, D\'Haens G, Van Assche G, et al, Gastrointest Endosc 2004): four variables -- ulcer size, ulcerated surface, affected surface, and stenosis -- each scored 0-3 in each of five ileocolonic segments (ileum, right colon, transverse, left colon, rectum). The stenosis sub-total is capped at 11 (a non-passable stenosis ends the exam), so the maximum total is 56, not the naive 60. Bands: 0-2 remission, 3-6 mild, 7-15 moderate, over 15 severe. It frames endoscopic activity; the management decision stays with the clinician.';

export function sesCd(input = {}) {
  const o = obj(input);
  const ulcerSize = sumArr(o.ulcerSize);
  const ulceratedSurface = sumArr(o.ulceratedSurface);
  const affectedSurface = sumArr(o.affectedSurface);
  const stenosisRaw = sumArr(o.stenosis);
  const stenosis = Math.min(stenosisRaw, 11); // published cap
  const total = ulcerSize + ulceratedSurface + affectedSurface + stenosis;
  let band; let high;
  if (total > 15) { band = 'severe'; high = true; }
  else if (total >= 7) { band = 'moderate'; high = true; }
  else if (total >= 3) { band = 'mild'; high = false; }
  else { band = 'remission'; high = false; }
  return {
    valid: true, total, stenosisCapped: stenosisRaw > 11,
    abnormal: high,
    band: `SES-CD ${total}/56: endoscopic ${band} (0-2 remission, 3-6 mild, 7-15 moderate, > 15 severe).`,
    note: SESCD_NOTE,
  };
}

// --- 2.4 haps -----------------------------------------------------------------
const HAPS_NOTE = 'Harmless Acute Pancreatitis Score (Lankisch PG, Weber-Dany B, Hebel K, et al, Clin Gastroenterol Hepatol 2009): a three-criterion admission gate -- absence of rebound tenderness or guarding, a normal hematocrit (below 43 in men, below 39.6 in women), and a normal serum creatinine (below 2 mg/dL). When all three are normal the course is predicted to be harmless (non-severe), with about 97% specificity and 98% positive predictive value; any abnormal value does NOT rule severity in. It rules out a severe course at admission; the management decision stays with the clinician.';

export function haps(input = {}) {
  const o = obj(input);
  const hct = pos(o.hct);
  const creat = pos(o.creatinine);
  if (hct === null || creat === null) return { valid: false, message: 'Enter hematocrit and creatinine (positive), and mark peritonitis.' };
  const peritonitis = onFlag(o.peritonitis);
  const hctNormal = onFlag(o.female) ? hct < 39.6 : hct < 43;
  const creatNormal = creat < 2.0;
  const harmless = !peritonitis && hctNormal && creatNormal;
  const reasons = [];
  if (peritonitis) reasons.push('rebound/guarding present');
  if (!hctNormal) reasons.push('hematocrit not normal');
  if (!creatNormal) reasons.push('creatinine >= 2 mg/dL');
  return {
    valid: true, harmless,
    abnormal: !harmless,
    band: harmless
      ? 'HAPS: harmless -- all three criteria normal, predicting a non-severe course (does not replace ongoing assessment).'
      : `HAPS: not harmless -- ${reasons.join(', ')}; this does not rule severity in, only that the harmless prediction does not apply.`,
    note: HAPS_NOTE,
  };
}

// --- 2.5 ctsi-balthazar -------------------------------------------------------
const CTSI_NOTE = 'CT Severity Index (Balthazar EJ, Robinson DL, Megibow AJ, Ranson JH, Radiology 1990): the contrast-CT grade plus the necrosis score. The Balthazar grade scores A normal (0), B focal/diffuse enlargement (1), C intrinsic changes with peripancreatic fat stranding (2), D a single fluid collection (3), and E two or more collections or gas (4); pancreatic necrosis adds none (0), 30% or less (2), 30-50% (4), or over 50% (6). Total 0-10: 0-3 mild, 4-6 moderate, 7-10 severe. It frames CT severity; the management decision stays with the clinician.';

export function ctsiBalthazar(input = {}) {
  const o = obj(input);
  const grade = clampInt(o.grade, 0, 4);     // A-E -> 0-4
  const necrosis = clampInt(o.necrosis, 0, 6); // 0/2/4/6 (renderer offers those)
  const total = grade + necrosis;
  let band; let high;
  if (total >= 7) { band = 'severe'; high = true; }
  else if (total >= 4) { band = 'moderate'; high = true; }
  else { band = 'mild'; high = false; }
  return {
    valid: true, total,
    abnormal: high,
    band: `CTSI ${total}/10: ${band} acute pancreatitis (0-3 mild, 4-6 moderate, 7-10 severe).`,
    note: CTSI_NOTE,
  };
}

// --- 2.6 modified-marshall ----------------------------------------------------
const MARSHALL_NOTE = 'Modified Marshall organ-dysfunction score (Banks PA, Bollen TL, Dervenis C, et al; Acute Pancreatitis Classification Working Group, Gut 2013; Revised Atlanta): scores three organ systems 0-4 -- respiratory by PaO2/FiO2 (> 400 = 0, 301-400 = 1, 201-300 = 2, 101-200 = 3, 101 or below = 4), renal by creatinine in mg/dL (< 1.4 = 0, 1.4-1.8 = 1, 1.9-3.6 = 2, 3.6-4.9 = 3, > 4.9 = 4), and cardiovascular by systolic blood pressure with fluid responsiveness and pH. Organ FAILURE is a score of 2 or more in any system -- the Revised Atlanta threshold separating moderately severe from severe acute pancreatitis (persistent failure beyond 48 hours defines severe). It frames organ dysfunction; the management decision stays with the clinician.';

function respScore(ratio) {
  if (ratio > 400) return 0;
  if (ratio > 300) return 1; // 301-400
  if (ratio > 200) return 2; // 201-300
  if (ratio > 100) return 3; // 101-200
  return 4; // <= 100/101
}
function renalScore(cr) {
  if (cr < 1.4) return 0;
  if (cr <= 1.8) return 1;
  if (cr <= 3.6) return 2;
  if (cr <= 4.9) return 3;
  return 4;
}

export function modifiedMarshall(input = {}) {
  const o = obj(input);
  const systems = [];
  // Respiratory: PaO2 (mmHg) and FiO2 (%); both required to score.
  const pao2 = numOrNull(o.pao2);
  const fio2 = pos(o.fio2);
  if (pao2 !== null && fio2 !== null) {
    const ratio = pao2 / (fio2 / 100);
    systems.push({ name: 'respiratory', score: respScore(ratio) });
  }
  // Renal: creatinine mg/dL.
  const cr = pos(o.creatinine);
  if (cr !== null) systems.push({ name: 'renal', score: renalScore(cr) });
  // Cardiovascular: a pre-banded 0-4 selection (blank = not assessed).
  const cv = o.cardiovascular;
  if (cv !== undefined && cv !== '' && cv !== null) systems.push({ name: 'cardiovascular', score: clampInt(cv, 0, 4) });

  if (systems.length === 0) return { valid: false, message: 'Enter at least one organ system (respiratory PaO2 + FiO2, renal creatinine, or cardiovascular).' };
  const maxScore = systems.reduce((m, s) => Math.max(m, s.score), 0);
  const failed = systems.filter((s) => s.score >= 2);
  const detail = systems.map((s) => `${s.name} ${s.score}`).join(', ');
  return {
    valid: true, maxScore, organFailure: failed.length > 0,
    abnormal: failed.length > 0,
    band: failed.length > 0
      ? `Modified Marshall: organ failure -- ${failed.map((s) => s.name).join(', ')} scored >= 2 (the Revised Atlanta threshold; assessed: ${detail}).`
      : `Modified Marshall: no organ failure (all assessed systems below 2; assessed: ${detail}).`,
    note: MARSHALL_NOTE,
  };
}
