// spec-v246: IBD / GI activity indices — the Simple Clinical Colitis Activity
// Index (SCCAI), the Pediatric Ulcerative Colitis Activity Index (PUCAI), the
// Boston Bowel Preparation Scale (BBPS), and the simplified diagnostic criteria for
// autoimmune hepatitis. Each id was verified absent by a fixed-string scan of the
// extracted app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2).
// v246 runs no AI and makes no runtime network call.
//
// These score / grade disease activity — they are NOT a diagnosis and NOT a
// treatment order (spec-v11 §5.3).
//
//   sccai          - Simple Clinical Colitis Activity Index (0-19)
//   pucai          - Pediatric Ulcerative Colitis Activity Index (0-85)
//   bbps-boston    - Boston Bowel Preparation Scale (0-9)
//   simplified-aih - simplified autoimmune-hepatitis criteria (0-8)
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num } from './num.js';

function lvl(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}

// --- SCCAI -------------------------------------------------------------------
// Walmsley RS, et al. Gut. 1998: bowel frequency day (0-3), night (0-2), urgency
// (0-3), blood in stool (0-3), general wellbeing (0-4), extracolonic manifestations
// (1 each, up to 4). Total 0-19; a score >= 5 indicates active disease. Cross-
// verified: Wikipedia; ECCO e-Guide.
const SCCAI_NOTE = 'Simple Clinical Colitis Activity Index (Walmsley RS, et al. Gut. 1998): bowel frequency day (0-3), night (0-2), urgency (0-3), blood in stool (0-3), general wellbeing (0-4), extracolonic manifestations (1 each, up to 4). Total 0-19; a score >= 5 indicates active disease. An activity index, not a diagnosis or treatment order.';
export function sccai(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const s = lvl(o.freqDay, 3) + lvl(o.freqNight, 2) + lvl(o.urgency, 3) + lvl(o.blood, 3) + lvl(o.wellbeing, 4) + lvl(o.extracolonic, 4);
  const score = Math.round(num('SCCAI', s, { min: 0, max: 19 }));
  const abnormal = score >= 5;
  return { valid: true, score, abnormal, bandLabel: `SCCAI ${score}`, band: `SCCAI ${score} of 19 — ${abnormal ? 'active disease (>= 5)' : 'remission (< 5)'}.`, detail: 'Day + night frequency, urgency, blood, wellbeing, extracolonic.', note: SCCAI_NOTE };
}

// --- PUCAI -------------------------------------------------------------------
// Turner D, et al. Gastroenterology. 2007: abdominal pain (0/5/10), rectal bleeding
// (0/10/20/30), stool consistency (0/5/10), stools per 24 h (0/5/10/15), nocturnal
// stools (0/10), activity level (0/5/10). Total 0-85; < 10 remission, 10-34 mild,
// 35-64 moderate, 65-85 severe. Cross-verified: MDCalc; PMC4308561.
const PUCAI_NOTE = 'Pediatric Ulcerative Colitis Activity Index (Turner D, et al. Gastroenterology. 2007): abdominal pain (0/5/10), rectal bleeding (0/10/20/30), stool consistency (0/5/10), stools per 24 h (0/5/10/15), nocturnal stools (0/10), activity level (0/5/10). Total 0-85; < 10 remission, 10-34 mild, 35-64 moderate, 65-85 severe. An activity index, not a diagnosis or treatment order.';
export function pucai(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const s = lvl(o.pain, 10) + lvl(o.bleeding, 30) + lvl(o.consistency, 10) + lvl(o.number, 15) + lvl(o.nocturnal, 10) + lvl(o.activity, 10);
  const score = Math.round(num('PUCAI', s, { min: 0, max: 85 }));
  let tier; let abnormal = true;
  if (score >= 65) tier = 'severe (65-85)';
  else if (score >= 35) tier = 'moderate (35-64)';
  else if (score >= 10) tier = 'mild (10-34)';
  else { tier = 'remission (< 10)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `PUCAI ${score}`, band: `PUCAI ${score} of 85 — ${tier}.`, detail: '6 clinical items.', note: PUCAI_NOTE };
}

// --- Boston Bowel Preparation Scale (BBPS) -----------------------------------
// Lai EJ, et al. Gastrointest Endosc. 2009: right, transverse, and left colon
// segments each 0-3 (0 unprepared, 3 clean). Total 0-9; a total >= 6 with each
// segment >= 2 is adequate (the original used >= 5). Cross-verified: PMC2763922;
// PubMed 24629422.
const BBPS_NOTE = 'Boston Bowel Preparation Scale (Lai EJ, et al. Gastrointest Endosc. 2009): right, transverse, and left colon segments each 0-3 (0 unprepared solid stool, 3 entire mucosa well seen). Total 0-9; a total >= 6 (with each segment >= 2) is adequate (the original threshold was >= 5). A preparation-quality score, not a diagnosis or treatment order.';
export function bbpsBoston(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const right = lvl(o.right, 3), transverse = lvl(o.transverse, 3), left = lvl(o.left, 3);
  const score = Math.round(num('BBPS', right + transverse + left, { min: 0, max: 9 }));
  const abnormal = score < 6;
  return { valid: true, score, abnormal, bandLabel: `BBPS ${score}`, band: `Boston Bowel Prep ${score} of 9 — ${abnormal ? 'inadequate (< 6)' : 'adequate (>= 6)'}.`, detail: `Right ${right}, transverse ${transverse}, left ${left}.`, note: BBPS_NOTE };
}

// --- Simplified autoimmune-hepatitis criteria --------------------------------
// Hennes EM, et al (IAIHG). Hepatology. 2008: autoantibodies (ANA/SMA 1:40 = 1,
// >= 1:80 = 2; anti-LKM1/SLA also 2; capped at 2), IgG (> ULN = 1, > 1.1x ULN = 2),
// histology (compatible = 1, typical = 2), and absence of viral hepatitis (= 1).
// Total 0-8; >= 6 probable, >= 7 definite AIH. Cross-verified: PMC5915689; PubMed
// 18537184.
const AIH_NOTE = 'Simplified autoimmune-hepatitis criteria (Hennes EM, et al; IAIHG. Hepatology. 2008): autoantibodies (ANA/SMA 1:40 = 1, >= 1:80 = 2; capped at 2), IgG (> ULN = 1, > 1.1x ULN = 2), histology (compatible = 1, typical = 2), and absence of viral hepatitis (= 1). Total 0-8; >= 6 probable, >= 7 definite AIH. A diagnostic-criteria score, not a standalone diagnosis or treatment order.';
export function simplifiedAih(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const auto = lvl(o.autoantibody, 2), igg = lvl(o.igg, 2), histology = lvl(o.histology, 2);
  const viral = (o.viralAbsent === true || o.viralAbsent === 1 || o.viralAbsent === '1' || o.viralAbsent === 'on') ? 1 : 0;
  const score = Math.round(num('AIH', auto + igg + histology + viral, { min: 0, max: 8 }));
  let tier; let abnormal = true;
  if (score >= 7) tier = 'definite AIH (>= 7)';
  else if (score >= 6) tier = 'probable AIH (>= 6)';
  else { tier = 'AIH not met (< 6)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `AIH ${score}`, band: `Simplified AIH score ${score} of 8 — ${tier}.`, detail: `Autoantibody ${auto}, IgG ${igg}, histology ${histology}, viral-absent ${viral}.`, note: AIH_NOTE };
}
