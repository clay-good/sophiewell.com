// spec-v225: obstetrics & gynecology scoring instruments — the Nugent and Amsel
// bacterial-vaginosis criteria, the modified Ferriman-Gallwey hirsutism score, the
// PBAC menstrual-blood-loss chart, the Thompson neonatal-encephalopathy score, the
// Menopause Rating Scale, and the Blatt-Kupperman menopausal index. Every id was
// verified absent by a direct scan of app.js first (spec-v85 §6.2). None duplicates
// a live tile; v225 runs no AI and makes no runtime network call. These score /
// classify — they are NOT a treatment order (spec-v11 §5.3).
//
//   nugent      - Nugent score (BV Gram stain)
//   amsel       - Amsel criteria (clinical BV)
//   ferrimanGallwey - modified Ferriman-Gallwey hirsutism score
//   pbac        - Pictorial Blood Loss Assessment Chart
//   thompsonHie - Thompson neonatal HIE score
//   menopauseRating - Menopause Rating Scale
//   kupperman   - Blatt-Kupperman menopausal index
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function selN(v, lo, hi) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return 0;
  return n;
}
function cnt(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 1e6) return 0;
  return n;
}

// --- Nugent score ------------------------------------------------------------
// Nugent RP, Krohn MA, Hillier SL, J Clin Microbiol 1991;29(2):297-301:
// Lactobacillus morphotypes (>30 = 0, 5-30 = 1, 1-4 = 2, <1 = 3, 0 = 4) +
// Gardnerella/Bacteroides (0 = 0, <1 = 1, 1-4 = 2, 5-30 = 3, >30 = 4) + curved
// gram-variable rods / Mobiluncus (0 = 0, 1-4 = 1, >= 5 = 2). Total 0-10:
// 0-3 normal, 4-6 intermediate, 7-10 bacterial vaginosis.
const NUGENT_NOTE = 'Nugent score (Nugent RP, Krohn MA, Hillier SL, J Clin Microbiol 1991;29(2):297-301): a Gram-stain score summing Lactobacillus morphotypes (>30 = 0 to 0 = 4), Gardnerella/Bacteroides morphotypes (0 = 0 to >30 = 4), and curved gram-variable rods / Mobiluncus (0 = 0 to >= 5 = 2), per oil-immersion field. Total 0-10: 0-3 normal, 4-6 intermediate, 7-10 bacterial vaginosis. A laboratory score, not a treatment order.';
export function nugent(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lacto = selN(o.lactobacillus, 0, 4);
  const gard = selN(o.gardnerella, 0, 4);
  const mob = selN(o.mobiluncus, 0, 2);
  const score = Math.round(num('Nugent', lacto + gard + mob, { min: 0, max: 10 }));
  let tier; let abnormal = true;
  if (score >= 7) tier = 'bacterial vaginosis (7-10)';
  else if (score >= 4) tier = 'intermediate (4-6)';
  else { tier = 'normal (0-3)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `Nugent ${score}`, band: `Nugent score ${score} — ${tier}.`, detail: `Lactobacillus ${lacto} + Gardnerella ${gard} + Mobiluncus ${mob} = ${score}.`, note: NUGENT_NOTE };
}

// --- Amsel criteria ----------------------------------------------------------
// Amsel R, et al, Am J Med 1983;74(1):14-22: four findings - thin homogeneous
// gray-white discharge, vaginal pH > 4.5, positive whiff (amine) test, and clue
// cells > 20% on wet mount. >= 3 of 4 present = clinical bacterial vaginosis.
const AMSEL_NOTE = 'Amsel criteria (Amsel R, et al, Am J Med 1983;74(1):14-22): four clinical findings - thin homogeneous gray-white discharge, vaginal pH > 4.5, positive whiff (amine) test with 10% KOH, and clue cells > 20% on wet mount. >= 3 of 4 present classifies clinical bacterial vaginosis. A diagnostic criteria set, not a treatment order.';
export function amsel(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  const add = (c, l) => { if (bool(o[c])) { s += 1; p.push(l); } };
  add('discharge', 'thin gray-white discharge'); add('ph', 'pH > 4.5'); add('whiff', 'positive whiff test'); add('clueCells', 'clue cells > 20%');
  const score = Math.round(num('Amsel', s, { min: 0, max: 4 }));
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `Amsel ${score}/4`, band: `Amsel criteria ${score}/4 — ${abnormal ? 'bacterial vaginosis (>= 3)' : 'does not meet the threshold (< 3)'}.`, detail: p.length ? `Present: ${p.join('; ')}.` : 'No criteria.', note: AMSEL_NOTE };
}

// --- Modified Ferriman-Gallwey -----------------------------------------------
// Ferriman D, Gallwey JD, J Clin Endocrinol Metab 1961;21(11):1440-1447 (modified,
// Hatch R, et al, Am J Obstet Gynecol 1981;140(7):815-830): terminal-hair grades
// 0-4 over 9 body areas (upper lip, chin, chest, upper abdomen, lower abdomen,
// upper arm, thigh, upper back, lower back); total 0-36. >= 8 indicates hirsutism.
const FG_NOTE = 'Modified Ferriman-Gallwey score (Ferriman D, Gallwey JD, J Clin Endocrinol Metab 1961;21(11):1440-1447): terminal-hair growth graded 0-4 over 9 body areas (upper lip, chin, chest, upper and lower abdomen, upper arm, thigh, upper and lower back); total 0-36. A score >= 8 indicates hirsutism (classic Caucasian cutoff; population-specific cutoffs 6-10 exist). A severity score, not a treatment order.';
const FG_AREAS = ['upperLip', 'chin', 'chest', 'upperAbdomen', 'lowerAbdomen', 'upperArm', 'thigh', 'upperBack', 'lowerBack'];
export function ferrimanGallwey(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const a of FG_AREAS) s += selN(o[a], 0, 4);
  const score = Math.round(num('Ferriman-Gallwey', s, { min: 0, max: 36 }));
  const abnormal = score >= 8;
  return { valid: true, score, abnormal, bandLabel: `mFG ${score}`, band: `Modified Ferriman-Gallwey score ${score} / 36 — ${abnormal ? 'hirsutism (>= 8)' : 'below the hirsutism cutoff (< 8)'}.`, detail: `sum across 9 areas = ${score}.`, note: FG_NOTE };
}

// --- PBAC --------------------------------------------------------------------
// Higham JM, O'Brien PMS, Shaw RW, Br J Obstet Gynaecol 1990;97(8):734-739: pads
// (lightly stained 1, moderate 5, fully soaked 20), tampons (1 / 5 / 10), clots
// (small 1, large 5), summed over the cycle. A total > 100 corresponds to
// menstrual blood loss > 80 mL (heavy menstrual bleeding).
const PBAC_NOTE = 'Pictorial Blood Loss Assessment Chart (Higham JM, et al, Br J Obstet Gynaecol 1990;97(8):734-739): sum over the cycle of pads (lightly stained 1, moderately 5, fully soaked 20), tampons (1 / 5 / 10), and clots (small 1, large 5). A total > 100 corresponds to menstrual blood loss > 80 mL, i.e. heavy menstrual bleeding. A semiquantitative tally, not a treatment order.';
export function pbac(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const score = Math.round(num('PBAC',
    cnt(o.lightPads) * 1 + cnt(o.moderatePads) * 5 + cnt(o.soakedPads) * 20
    + cnt(o.lightTampons) * 1 + cnt(o.moderateTampons) * 5 + cnt(o.soakedTampons) * 10
    + cnt(o.smallClots) * 1 + cnt(o.largeClots) * 5, { min: 0, max: 1e6 }));
  const abnormal = score > 100;
  return { valid: true, score, abnormal, bandLabel: `PBAC ${score}`, band: `PBAC score ${score} — ${abnormal ? 'heavy menstrual bleeding likely (> 100, ~ > 80 mL)' : 'not in the heavy range (<= 100)'}.`, detail: `weighted tally of pads, tampons, and clots = ${score}.`, note: PBAC_NOTE };
}

// --- Thompson neonatal HIE ---------------------------------------------------
// Thompson CM, et al, Acta Paediatr 1997;86(7):757-761: 9 signs - tone (0-3),
// consciousness (0-2), seizures (0-2), posture (0-3), Moro (0-2), grasp (0-2),
// suck (0-2), respiration (0-3), fontanelle (0-2). Total to 21+: 0-10 mild, 11-14
// moderate, >= 15 severe.
const THOMPSON_NOTE = 'Thompson score (Thompson CM, et al, Acta Paediatr 1997;86(7):757-761): grades 9 signs of neonatal hypoxic-ischemic encephalopathy - tone, consciousness, seizures, posture, Moro reflex, grasp, suck, respiration, and fontanelle - and sums them. 0-10 mild, 11-14 moderate, >= 15 severe; a peak > 10 in the first week predicts an abnormal outcome. A severity score, not a treatment order.';
const THOMPSON_ITEMS = [['tone', 3], ['consciousness', 2], ['seizures', 2], ['posture', 3], ['moro', 2], ['grasp', 2], ['suck', 2], ['respiration', 3], ['fontanelle', 2]];
export function thompsonHie(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const [k, hi] of THOMPSON_ITEMS) s += selN(o[k], 0, hi);
  const score = Math.round(num('Thompson', s, { min: 0, max: 22 }));
  let tier; let abnormal = true;
  if (score >= 15) tier = 'severe encephalopathy (>= 15)';
  else if (score >= 11) tier = 'moderate (11-14)';
  else { tier = 'mild (0-10)'; abnormal = score > 0; }
  return { valid: true, score, abnormal, bandLabel: `Thompson ${score}`, band: `Thompson score ${score} — ${tier}.`, detail: `sum of 9 signs = ${score}.`, note: THOMPSON_NOTE };
}

// --- Menopause Rating Scale --------------------------------------------------
// Heinemann K, et al, Health Qual Life Outcomes 2004;2:45: 11 items each 0-4
// across psychological, somato-vegetative, and urogenital domains; total 0-44.
// 0-4 none/little, 5-8 mild, 9-16 moderate, >= 17 severe.
const MRS_NOTE = 'Menopause Rating Scale (Heinemann K, et al, Health Qual Life Outcomes 2004;2:45): 11 items each 0-4 across psychological (4), somato-vegetative (4), and urogenital (3) domains; total 0-44. 0-4 none/little, 5-8 mild, 9-16 moderate, >= 17 severe. A symptom-burden measure, not a treatment order.';
const MRS_ITEMS = ['hotFlushes', 'heartDiscomfort', 'sleepProblems', 'depressive', 'irritability', 'anxiety', 'exhaustion', 'sexualProblems', 'bladderProblems', 'vaginalDryness', 'jointMuscle'];
export function menopauseRating(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of MRS_ITEMS) s += selN(o[k], 0, 4);
  const score = Math.round(num('MRS', s, { min: 0, max: 44 }));
  let tier; let abnormal = true;
  if (score >= 17) tier = 'severe (>= 17)';
  else if (score >= 9) tier = 'moderate (9-16)';
  else if (score >= 5) tier = 'mild (5-8)';
  else { tier = 'none / little (0-4)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `MRS ${score}`, band: `Menopause Rating Scale ${score} / 44 — ${tier}.`, detail: `sum of 11 items = ${score}.`, note: MRS_NOTE };
}

// --- Blatt-Kupperman menopausal index ----------------------------------------
// Kupperman HS, Blatt MHG, et al, J Clin Endocrinol Metab 1953;13(6):688-703: 11
// symptoms rated 0-3 and weighted - hot flushes x4; paresthesia, insomnia,
// nervousness x2; melancholia, vertigo, weakness, arthralgia/myalgia, headache,
// palpitations, formication x1. Weighted total up to 51. Band cutoffs vary across
// "modified Kupperman" variants.
const KUPPERMAN_NOTE = 'Blatt-Kupperman menopausal index (Kupperman HS, Blatt MHG, et al, J Clin Endocrinol Metab 1953;13(6):688-703): 11 symptoms each rated 0-3 and weighted - hot flushes x4; paresthesia, insomnia, nervousness x2; melancholia, vertigo, weakness/fatigue, arthralgia/myalgia, headache, palpitations, formication x1. Weighted total to 51; severity bands vary across modified variants (commonly < 15 mild, 15-35 moderate, > 35 severe). A symptom index, not a treatment order.';
const KUPP_ITEMS = [['hotFlushes', 4], ['paresthesia', 2], ['insomnia', 2], ['nervousness', 2], ['melancholia', 1], ['vertigo', 1], ['weakness', 1], ['arthralgia', 1], ['headache', 1], ['palpitations', 1], ['formication', 1]];
export function kupperman(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const [k, w] of KUPP_ITEMS) s += selN(o[k], 0, 3) * w;
  const score = Math.round(num('Kupperman', s, { min: 0, max: 51 }));
  let tier; let abnormal = true;
  if (score > 35) tier = 'severe (> 35)';
  else if (score >= 15) tier = 'moderate (15-35)';
  else { tier = 'mild (< 15)'; abnormal = score > 0; }
  return { valid: true, score, abnormal, bandLabel: `Kupperman ${score}`, band: `Blatt-Kupperman index ${score} — ${tier}.`, detail: `weighted sum of 11 symptoms = ${score}.`, note: KUPPERMAN_NOTE };
}
