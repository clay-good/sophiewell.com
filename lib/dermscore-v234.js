// spec-v234: dermatology scoring indices — the Melasma Area and Severity Index
// (MASI), the Severity of Alopecia Tool (SALT), the Nail Psoriasis Severity Index
// (NAPSI, per target nail), and the Vancouver Scar Scale (VSS). Each id was
// verified absent by a fixed-string scan of the extracted app.js id/name lists AND
// the MCP adapter set first (spec-v85 §6.2). v234 runs no AI and makes no runtime
// network call.
//
// These grade / classify severity — they are NOT a diagnosis and NOT a treatment
// order (spec-v11 §5.3).
//
//   masi                 - Melasma Area and Severity Index (0-48)
//   salt-score           - Severity of Alopecia Tool (0-100)
//   napsi                - Nail Psoriasis Severity Index, per target nail (0-8)
//   vancouver-scar-scale - Vancouver Scar Scale (0-13)
//
// FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r1, inputFault } from './num.js';

// spec-v1214: these two returned **0** for a value outside the scale, which is
// the silent clamp spec-v1209 exists to remove -- an impossible reading did not
// merely score, it scored as the most NORMAL score the instrument has. Four
// scalp regions entered as 150% terminal hair loss read "Severity of Alopecia
// Tool 0 of 100 -- S0 (no loss)", `valid: true`, on both surfaces.
//
// They now grade only what is on the scale. Every caller asks `inputFault` first,
// so an out-of-range value is refused by name and a blank is asked for rather
// than counted as a zero.
// The fallback is NaN, not 0. Every caller refuses an off-scale value before
// reaching these, so the fallback is unreachable today -- and the day somebody
// adds a fifth export and forgets the guard, a NaN is visible where a 0 would
// quietly be the most reassuring score the instrument has.
function lvl(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return NaN;
  return Math.round(n);
}
function pct(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 100) return NaN;
  return n;
}
// The refusal both surfaces render. `render()` in views/group-v234.js branches on
// `!r.valid` and prints `r.message`, so a guard that returned only `band` would
// fall back to "Complete the fields." -- spec-v1212's regression, in a new file.
function refuse(fault, note) {
  return { valid: false, message: fault, band: fault, note };
}

// --- MASI --------------------------------------------------------------------
// Kimbrough-Green CK, et al. Arch Dermatol. 1994: four facial regions — forehead
// (F), right malar (RMR), left malar (LMR) each weighted 0.3, chin (M) weighted
// 0.1. Each region has an Area grade (A, 0-6) and Darkness (D, 0-4) and
// Homogeneity (H, 0-4). MASI = 0.3·A_F·(D+H)_F + 0.3·A_RMR·(D+H)_RMR +
// 0.3·A_LMR·(D+H)_LMR + 0.1·A_M·(D+H)_M. Range 0-48; no official severity bands
// (a continuous change measure). Cross-verified: plasticsurgerykey; globale-
// dermatologie.
const MASI_NOTE = 'Melasma Area and Severity Index (Kimbrough-Green 1994): forehead, right malar, left malar (each x 0.3) and chin (x 0.1). Each region scores Area (0-6), Darkness (0-4), Homogeneity (0-4). MASI = 0.3·A·(D+H) for each of the three large regions + 0.1·A·(D+H) for chin. Range 0-48; higher = more severe. No official severity bands (a continuous measure). A grading index, not a diagnosis or treatment order.';
const MASI_REGIONS = [['f', 0.3], ['rmr', 0.3], ['lmr', 0.3], ['m', 0.1]];
// The label a reader sees, not the key a developer wrote (spec-v1017).
const MASI_LABELS = { f: 'the forehead', rmr: 'the right malar', lmr: 'the left malar', m: 'the chin' };
export function masi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault(MASI_REGIONS.flatMap(([k]) => [
    [`${MASI_LABELS[k]} area`, o[`${k}A`], 0, 6, ''],
    [`${MASI_LABELS[k]} darkness`, o[`${k}D`], 0, 4, ''],
    [`${MASI_LABELS[k]} homogeneity`, o[`${k}H`], 0, 4, ''],
  ]));
  if (fault) return refuse(fault, MASI_NOTE);
  let total = 0;
  for (const [k, w] of MASI_REGIONS) {
    const a = lvl(o[`${k}A`], 6), d = lvl(o[`${k}D`], 4), h = lvl(o[`${k}H`], 4);
    total += w * a * (d + h);
  }
  const score = r1(num('MASI', total, { min: 0, max: 48 }));
  return { valid: true, score, abnormal: false, bandLabel: `MASI ${score}`, band: `Melasma Area and Severity Index ${score} of 48 — higher = more severe.`, detail: 'A continuous severity measure; no official bands.', note: MASI_NOTE };
}

// --- SALT ---------------------------------------------------------------------
// Olsen EA, et al. J Am Acad Dermatol. 2004: scalp divided into top (40%), back
// (24%), right (18%), left (18%). Each region's % terminal hair loss (0-100) is
// weighted by its area fraction and summed. SALT = 0.40·top + 0.24·back +
// 0.18·right + 0.18·left (range 0-100). S categories: S0 = 0, S1 1-24, S2 25-49,
// S3 50-74, S4 75-99, S5 = 100. Cross-verified: PMC7450487; DermaTopics.
const SALT_NOTE = 'Severity of Alopecia Tool (Olsen EA, et al. J Am Acad Dermatol. 2004): top of scalp 40%, back 24%, right side 18%, left side 18%. Each region\'s % terminal hair loss (0-100) is weighted by its area and summed. SALT = 0.40·top + 0.24·back + 0.18·right + 0.18·left (0-100). S0 = 0, S1 1-24, S2 25-49, S3 50-74, S4 75-99, S5 = 100 (only terminal hair counts). A severity tool, not a diagnosis or treatment order.';
export function saltScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([
    ['the top of the scalp', o.top, 0, 100, '%'],
    ['the back of the scalp', o.back, 0, 100, '%'],
    ['the right side', o.right, 0, 100, '%'],
    ['the left side', o.left, 0, 100, '%'],
  ]);
  if (fault) return refuse(fault, SALT_NOTE);
  const top = pct(o.top), back = pct(o.back), right = pct(o.right), left = pct(o.left);
  const score = r1(num('SALT', 0.40 * top + 0.24 * back + 0.18 * right + 0.18 * left, { min: 0, max: 100 }));
  let s; let abnormal = false;
  if (score >= 100) { s = 'S5 (100% loss)'; abnormal = true; }
  else if (score >= 75) { s = 'S4 (75-99%)'; abnormal = true; }
  else if (score >= 50) { s = 'S3 (50-74%)'; abnormal = true; }
  else if (score >= 25) s = 'S2 (25-49%)';
  else if (score >= 1) s = 'S1 (1-24%)';
  else s = 'S0 (no loss)';
  return { valid: true, score, abnormal, bandLabel: `SALT ${score}`, band: `Severity of Alopecia Tool ${score} of 100 — ${s}.`, detail: `Top ${top}%, back ${back}%, right ${right}%, left ${left}%.`, note: SALT_NOTE };
}

// --- NAPSI (per target nail) -------------------------------------------------
// Rich P, Scher RK. J Am Acad Dermatol. 2003: each nail is divided into 4
// quadrants. The matrix score (0-4) is the number of quadrants showing any matrix
// feature (pitting, leukonychia, red spots in the lunula, crumbling); the bed
// score (0-4) is the number of quadrants showing any bed feature (onycholysis,
// splinter hemorrhage, oil-drop dyschromia, subungual hyperkeratosis). Per nail =
// matrix + bed = 0-8; the patient total sums involved nails (fingernails 0-80,
// all 20 nails 0-160). No official severity bands. Cross-verified: primarycare-
// notebook; clinicaltoolslibrary.
const NAPSI_NOTE = 'Nail Psoriasis Severity Index, per target nail (Rich P, Scher RK. J Am Acad Dermatol. 2003): each nail is divided into 4 quadrants. Matrix score (0-4) = quadrants with any matrix feature (pitting, leukonychia, red lunula spots, crumbling); bed score (0-4) = quadrants with any bed feature (onycholysis, splinter hemorrhage, oil-drop dyschromia, subungual hyperkeratosis). Per nail = matrix + bed = 0-8. The patient total sums involved nails (0-80 fingernails, 0-160 all 20). A grading index, not a diagnosis or treatment order.';
export function napsi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([
    ['the nail matrix quadrants involved', o.matrix, 0, 4, ''],
    ['the nail bed quadrants involved', o.bed, 0, 4, ''],
  ]);
  if (fault) return refuse(fault, NAPSI_NOTE);
  const matrix = lvl(o.matrix, 4), bed = lvl(o.bed, 4);
  const score = Math.round(num('NAPSI', matrix + bed, { min: 0, max: 8 }));
  return { valid: true, score, abnormal: score > 0, bandLabel: `NAPSI ${score}`, band: `Nail Psoriasis Severity Index ${score} of 8 for this nail — matrix ${matrix}, bed ${bed}.`, detail: 'Sum involved nails for the patient total (fingernails 0-80, all 20 nails 0-160).', note: NAPSI_NOTE };
}

// --- Vancouver Scar Scale ----------------------------------------------------
// Sullivan T, et al. J Burn Care Rehabil. 1990: pigmentation (0 normal, 1 hypo,
// 2 hyper), vascularity (0 normal, 1 pink, 2 red, 3 purple), pliability (0 normal,
// 1 supple, 2 yielding, 3 firm, 4 ropes, 5 contracture), height (0 flat, 1 < 2 mm,
// 2 2-5 mm, 3 > 5 mm). Total 0-13; 0 = normal skin, higher = worse. No validated
// severity bands. Cross-verified: J Korean Soc Laser Med Surg review; 222health.
const VSS_NOTE = 'Vancouver Scar Scale (Sullivan T, et al. J Burn Care Rehabil. 1990): pigmentation (0-2), vascularity (0-3), pliability (0-5), height (0-3). Total 0-13; 0 = normal skin, higher = worse. Pain/pruritus (mVSS, 0-16) and a pigmentation-0-3 form (0-14) are recognized modified variants. No validated severity bands. A grading scale, not a diagnosis or treatment order.';
export function vancouverScarScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([
    ['pigmentation', o.pigmentation, 0, 2, ''],
    ['vascularity', o.vascularity, 0, 3, ''],
    ['pliability', o.pliability, 0, 5, ''],
    ['height', o.height, 0, 3, ''],
  ]);
  if (fault) return refuse(fault, VSS_NOTE);
  const pig = lvl(o.pigmentation, 2), vas = lvl(o.vascularity, 3), pli = lvl(o.pliability, 5), ht = lvl(o.height, 3);
  const score = Math.round(num('VSS', pig + vas + pli + ht, { min: 0, max: 13 }));
  return { valid: true, score, abnormal: score > 0, bandLabel: `VSS ${score}`, band: `Vancouver Scar Scale ${score} of 13 — ${score === 0 ? 'normal skin' : 'higher = worse scar'}.`, detail: `Pigmentation ${pig}, vascularity ${vas}, pliability ${pli}, height ${ht}.`, note: VSS_NOTE };
}
