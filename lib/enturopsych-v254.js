// spec-v254: ENT / urology / psychiatry screening tools — the Reflux Symptom Index
// (RSI), the Lund-Mackay CT sinus score, the bladder-outlet-obstruction /
// contractility indices, and the Fagerstrom Test for Nicotine Dependence. Each id
// was verified absent by a fixed-string scan of the extracted app.js id/name lists
// AND the MCP adapter set first (spec-v85 §6.2). v254 runs no AI and makes no
// runtime network call.
//
// These score / grade / compute a value — they are NOT a diagnosis and NOT a
// treatment order (spec-v11 §5.3).
//
//   reflux-symptom-index             - Reflux Symptom Index (0-45)
//   lund-mackay                      - Lund-Mackay CT sinus score (0-24)
//   bladder-outlet-obstruction-index - BOOI + BCI
//   fagerstrom-ftnd                  - Fagerstrom nicotine dependence (0-10)
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r2 } from './num.js';

function lvl(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}
function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Reflux Symptom Index (RSI) ----------------------------------------------
// Belafsky PC, et al. J Voice. 2002: 9 symptom items each 0-5 (hoarseness, throat
// clearing, excess mucus/postnasal drip, difficulty swallowing, cough after eating
// or lying down, breathing difficulty/choking, annoying cough, globus, heartburn/
// chest pain). Total 0-45; > 13 is abnormal, suggests laryngopharyngeal reflux.
// Cross-verified: PubMed 12150380; Univ Iowa protocols.
const RSI_ITEMS = ['hoarseness', 'clearing', 'mucus', 'swallowing', 'cough1', 'breathing', 'cough2', 'globus', 'heartburn'];
const RSI_NOTE = 'Reflux Symptom Index (Belafsky PC, et al. J Voice. 2002): 9 symptom items each 0-5 (hoarseness, throat clearing, excess mucus/postnasal drip, difficulty swallowing, cough after eating or lying down, breathing difficulty/choking, annoying cough, globus, heartburn/chest pain). Total 0-45; > 13 is abnormal and suggests laryngopharyngeal reflux. A symptom score, not a diagnosis or treatment order.';
export function refluxSymptomIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of RSI_ITEMS) s += lvl(o[k], 5);
  const score = Math.round(num('RSI', s, { min: 0, max: 45 }));
  const abnormal = score > 13;
  return { valid: true, score, abnormal, bandLabel: `RSI ${score}`, band: `Reflux Symptom Index ${score} of 45 — ${abnormal ? 'suggests LPR (> 13)' : 'within normal limits (<= 13)'}.`, detail: '9 symptom items each 0-5.', note: RSI_NOTE };
}

// --- Lund-Mackay CT sinus score ----------------------------------------------
// Lund VJ, Mackay IS. Rhinology. 1993: each of 5 sinus systems (maxillary,
// anterior ethmoid, posterior ethmoid, sphenoid, frontal) scored 0 (no
// opacification), 1 (partial), 2 (total) per side, plus the ostiomeatal complex
// (0 not occluded, 2 occluded) per side. Per side max 12; total 0-24. Cross-
// verified: PMC8788565; otoscape.
const LM_SINUSES = ['maxR', 'aethR', 'pethR', 'sphR', 'frontR', 'maxL', 'aethL', 'pethL', 'sphL', 'frontL'];
const LM_NOTE = 'Lund-Mackay CT sinus score (Lund VJ, Mackay IS. Rhinology. 1993): each of 5 sinus systems (maxillary, anterior ethmoid, posterior ethmoid, sphenoid, frontal) scored 0/1/2 per side, plus the ostiomeatal complex 0/2 per side. Per side max 12; total 0-24; higher = more radiologic sinus disease. A staging score, not a diagnosis or treatment order.';
export function lundMackay(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of LM_SINUSES) s += lvl(o[k], 2);
  s += (bool(o.omcR) ? 2 : 0) + (bool(o.omcL) ? 2 : 0);
  const score = Math.round(num('Lund-Mackay', s, { min: 0, max: 24 }));
  return { valid: true, score, abnormal: false, bandLabel: `LM ${score}`, band: `Lund-Mackay CT score ${score} of 24 — higher = more radiologic sinus disease.`, detail: '5 sinuses x 0-2 per side + OMC 0/2 per side.', note: LM_NOTE };
}

// --- Bladder outlet obstruction / contractility indices ----------------------
// Abrams P. BJU Int. 1999: BOOI (Abrams-Griffiths number) = PdetQmax - 2 x Qmax;
// < 20 unobstructed, 20-40 equivocal, > 40 obstructed. BCI = PdetQmax + 5 x Qmax;
// < 100 weak (underactive), 100-150 normal, > 150 strong. Cross-verified: Abrams
// 1999; NCBI Bookshelf NBK562310.
const BOOI_NOTE = 'Bladder outlet obstruction index (Abrams P. BJU Int. 1999): BOOI = PdetQmax - 2 x Qmax (< 20 unobstructed, 20-40 equivocal, > 40 obstructed). Bladder contractility index BCI = PdetQmax + 5 x Qmax (< 100 weak/underactive, 100-150 normal, > 150 strong). Pressure-flow indices, not a diagnosis or treatment order.';
export function bladderOutletObstructionIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pdet = fin(o.pdet, 0, 300);
  const qmax = fin(o.qmax, 0, 60);
  if (pdet === null || qmax === null) {
    return { valid: false, message: 'Enter detrusor pressure at max flow (PdetQmax, cmH2O) and Qmax (mL/s).' };
  }
  const booi = r2(num('BOOI', pdet - 2 * qmax, { min: -200, max: 300 }));
  const bci = r2(num('BCI', pdet + 5 * qmax, { min: 0, max: 600 }));
  let obs; let abnormal = true;
  if (booi > 40) obs = 'obstructed (> 40)';
  else if (booi >= 20) obs = 'equivocal (20-40)';
  else { obs = 'unobstructed (< 20)'; abnormal = false; }
  let con;
  if (bci > 150) con = 'strong'; else if (bci >= 100) con = 'normal'; else con = 'weak';
  return { valid: true, score: booi, abnormal, bandLabel: `BOOI ${booi}`, band: `Bladder outlet obstruction index ${booi} — ${obs}; BCI ${bci} (${con} contractility).`, detail: `BOOI = ${pdet} - 2 x ${qmax}; BCI = ${pdet} + 5 x ${qmax}.`, note: BOOI_NOTE };
}

// --- Fagerstrom Test for Nicotine Dependence (FTND) --------------------------
// Heatherton TF, et al. Br J Addict. 1991: time to first cigarette (<= 5 min 3,
// 6-30 2, 31-60 1, > 60 0), hard to refrain in forbidden places (1), first-of-
// morning is hardest to give up (1), cigarettes/day (<= 10 = 0, 11-20 = 1, 21-30 =
// 2, >= 31 = 3), smoke more in the morning (1), smoke when ill in bed (1). Total
// 0-10; 0-2 very low, 3-4 low, 5 moderate, 6-7 high, 8-10 very high dependence.
// Cross-verified: PMC4241548; UW self-report.
const FTND_NOTE = 'Fagerstrom Test for Nicotine Dependence (Heatherton TF, et al. Br J Addict. 1991): time to first cigarette (<= 5 min 3, 6-30 2, 31-60 1, > 60 0), hard to refrain in forbidden places (1), first-of-morning is hardest to give up (1), cigarettes/day (<= 10 = 0, 11-20 = 1, 21-30 = 2, >= 31 = 3), smoke more in the morning (1), smoke when ill in bed (1). Total 0-10; 0-2 very low, 3-4 low, 5 moderate, 6-7 high, 8-10 very high dependence. A screening score, not a diagnosis or treatment order.';
export function fagerstromFtnd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const s = lvl(o.timeToFirst, 3) + (bool(o.refrain) ? 1 : 0) + (bool(o.firstMorning) ? 1 : 0) + lvl(o.perDay, 3) + (bool(o.moreMorning) ? 1 : 0) + (bool(o.whenIll) ? 1 : 0);
  const score = Math.round(num('FTND', s, { min: 0, max: 10 }));
  let tier; let abnormal = true;
  if (score >= 8) tier = 'very high (8-10)';
  else if (score >= 6) tier = 'high (6-7)';
  else if (score >= 5) tier = 'moderate (5)';
  else if (score >= 3) { tier = 'low (3-4)'; abnormal = false; }
  else { tier = 'very low (0-2)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `FTND ${score}`, band: `Fagerstrom score ${score} of 10 — ${tier} nicotine dependence.`, detail: 'Time-to-first + refrain + morning + per-day + more-morning + when-ill.', note: FTND_NOTE };
}
