// spec-v245: hematology discrimination indices + dermatology severity — the Shine
// & Lal index, the Green & King index (both thalassemia-vs-iron-deficiency
// discriminants), the percent platelet recovery, and the IHS4 hidradenitis
// suppurativa severity score. Each id was verified absent by a fixed-string scan of
// the extracted app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2).
// v245 runs no AI and makes no runtime network call.
//
// These compute an index / score — they are NOT a diagnosis and NOT a treatment
// order (spec-v11 §5.3).
//
//   shine-lal-index           - Shine & Lal discrimination index
//   green-king-index          - Green & King discrimination index
//   percent-platelet-recovery - PPR (transfusion response)
//   ihs4                      - International HS Severity Score System
//
// FORMULAS / POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation (see per-function headers).

import { num, r1 } from './num.js';

function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function cnt(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}

// --- Shine & Lal index -------------------------------------------------------
// Shine I, Lal S. Lancet. 1977: index = (MCV^2 x MCH) / 100. A value < 1530
// suggests beta-thalassemia trait; > 1530 suggests iron-deficiency anemia (cutoff
// varies by population). Cross-verified: PMC11303888; PMC6688316.
const SHINE_NOTE = 'Shine & Lal index (Shine I, Lal S. Lancet. 1977) = (MCV^2 x MCH) / 100. A value < 1530 suggests beta-thalassemia trait; > 1530 suggests iron-deficiency anemia (the discriminating cutoff varies by population). A red-cell discrimination index, not a diagnosis or treatment order.';
export function shineLal(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mcv = fin(o.mcv, 30, 150);
  const mch = fin(o.mch, 10, 50);
  if (mcv === null || mch === null) return { valid: false, message: 'Enter MCV (fL) and MCH (pg).' };
  const score = r1(num('Shine-Lal', mcv * mcv * mch / 100, { min: 0, max: 100000 }));
  const abnormal = score < 1530;
  return { valid: true, score, abnormal, bandLabel: `S&L ${score}`, band: `Shine & Lal index ${score} — ${abnormal ? 'thalassemia trait suggested (< 1530)' : 'iron-deficiency suggested (> 1530)'}.`, detail: `(MCV ${mcv}^2 x MCH ${mch}) / 100.`, note: SHINE_NOTE };
}

// --- Green & King index ------------------------------------------------------
// Green R, King R. Blood Cells. 1989: index = (MCV^2 x RDW) / (Hb x 100). A value
// < 65 suggests beta-thalassemia trait; > 65 suggests iron-deficiency anemia
// (cutoff varies by population). Cross-verified: EBMcalc; PMC11303888.
const GK_NOTE = 'Green & King index (Green R, King R. Blood Cells. 1989) = (MCV^2 x RDW) / (Hb x 100). A value < 65 suggests beta-thalassemia trait; > 65 suggests iron-deficiency anemia (the discriminating cutoff varies by population, ~59-65). A red-cell discrimination index, not a diagnosis or treatment order.';
export function greenKing(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mcv = fin(o.mcv, 30, 150);
  const rdw = fin(o.rdw, 5, 40);
  const hb = fin(o.hb, 3, 25);
  if (mcv === null || rdw === null || hb === null) return { valid: false, message: 'Enter MCV (fL), RDW (%), and hemoglobin (g/dL).' };
  const score = r1(num('Green-King', mcv * mcv * rdw / (hb * 100), { min: 0, max: 100000 }));
  const abnormal = score < 65;
  return { valid: true, score, abnormal, bandLabel: `G&K ${score}`, band: `Green & King index ${score} — ${abnormal ? 'thalassemia trait suggested (< 65)' : 'iron-deficiency suggested (> 65)'}.`, detail: `(MCV ${mcv}^2 x RDW ${rdw}) / (Hb ${hb} x 100).`, note: GK_NOTE };
}

// --- Percent platelet recovery (PPR) -----------------------------------------
// PPR (%) = [(post - pre) platelet count (x10^9/L) x blood volume (L)] / [platelets
// transfused (x10^11)]. > 30% at 1 h / > 20% at 20-24 h = good response; a low PPR
// suggests platelet refractoriness. Cross-verified: PubMed 10378838; PMC5622816.
const PPR_NOTE = 'Percent platelet recovery = [(post - pre) platelet count (x10^9/L) x blood volume (L)] / [platelets transfused (x10^11)]. > 30% at 1 h (or > 20% at 20-24 h) reflects a good transfusion response; a low PPR suggests platelet refractoriness. A response metric, not a diagnosis or treatment order.';
export function percentPlateletRecovery(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pre = fin(o.pre, 0, 2000);
  const post = fin(o.post, 0, 2000);
  const bv = fin(o.bloodVolume, 1, 12);
  const tx = fin(o.transfused, 0.1, 100);
  if (pre === null || post === null || bv === null || tx === null) {
    return { valid: false, message: 'Enter pre- and post-transfusion platelet count (x10^9/L), blood volume (L), and platelets transfused (x10^11).' };
  }
  if (post < pre) return { valid: false, message: 'Post-transfusion count is below the pre-transfusion count.' };
  const score = r1(num('PPR', (post - pre) * bv / tx, { min: 0, max: 500 }));
  const abnormal = score < 20;
  return { valid: true, score, abnormal, bandLabel: `PPR ${score}%`, band: `Percent platelet recovery ${score}% — ${abnormal ? 'low increment (suggests refractoriness)' : 'adequate increment (>= 20%)'}.`, detail: `increment ${r1(post - pre)} x BV ${bv} / transfused ${tx}.`, note: PPR_NOTE };
}

// --- IHS4 (International HS Severity Score System) ----------------------------
// Zouboulis CC, et al. Br J Dermatol. 2017: IHS4 = (nodules x 1) + (abscesses x 2)
// + (draining tunnels x 4). 0-3 mild, 4-10 moderate, >= 11 severe hidradenitis
// suppurativa. Cross-verified: European HS Foundation; cmsderm.
const IHS4_NOTE = 'IHS4 (Zouboulis CC, et al. Br J Dermatol. 2017) = (inflammatory nodules x 1) + (abscesses x 2) + (draining tunnels x 4). 0-3 mild, 4-10 moderate, >= 11 severe hidradenitis suppurativa. A dynamic severity score, not a diagnosis or treatment order.';
export function ihs4(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const nodules = cnt(o.nodules, 500);
  const abscesses = cnt(o.abscesses, 500);
  const tunnels = cnt(o.tunnels, 500);
  const score = Math.round(num('IHS4', nodules * 1 + abscesses * 2 + tunnels * 4, { min: 0, max: 5000 }));
  let tier; let abnormal = true;
  if (score >= 11) tier = 'severe (>= 11)';
  else if (score >= 4) tier = 'moderate (4-10)';
  else { tier = 'mild (0-3)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `IHS4 ${score}`, band: `IHS4 ${score} — ${tier}.`, detail: `Nodules ${nodules} + abscesses ${abscesses} x 2 + tunnels ${tunnels} x 4.`, note: IHS4_NOTE };
}
