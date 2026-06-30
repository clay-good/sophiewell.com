// spec-v179 (seventh feature spec of the spec-v172 Long-Term Care & Geriatric
// Assessment program, cluster §3.7): geriatric-pharmacotherapy / polypharmacy
// burden quantifiers. v179 ships 3 of its 4 proposed tiles; medication-regimen-
// complexity (MRCI) is deferred (see the deferral note below). Each weight,
// level, and coefficient was re-fetched and cross-verified against >= 2
// independent sources at implementation (spec-v97).
//
//   anticholinergicBurden (ACB) - total = sum(level x count) over levels 1/2/3.
//   anticholinergicRiskScale (ARS) - sum of per-drug ARS points (1/2/3).
//   drugBurdenIndex (DBI) - sum of D/(D + delta) across the entered drugs.
//
// DEFERRED at implementation (not shipped here):
//   - medication-regimen-complexity (MRCI): the 65-item Section A (dosage form),
//     Section B (frequency), and Section C (additional-directions) weight tables
//     (George J, et al, Ann Pharmacother 2004) could not be byte-verified against
//     >= 2 independent open sources at implementation (the full weight tables are
//     paywalled and the instrument carries copyright); deferred on sourcing
//     grounds (spec-v97), the same gate as the spec-v173 / v177 deferrals.
//
// Per the spec-v100 §2 classification-tile clarification, these tiles do NOT
// embed a drug database — the clinician reads each drug's level/point/dose from
// the published scale and enters the per-level counts (ACB/ARS) or per-drug doses
// (DBI); the tile does the deterministic arithmetic. None authors a dosing or
// deprescribing order in Sophie's voice (spec-v11 §5.3). Citations live inline in
// lib/meta.js. No AI, no runtime network call.
//
// SCALES / CUTOFFS RE-FETCHED, NEVER RECALLED (spec-v97):
//   - ACB: each medication is a level 1 (possible), 2, or 3 (definite)
//     anticholinergic; total = 1*c1 + 2*c2 + 3*c3; a total >= 3 is commonly
//     treated as clinically relevant for cognitive/functional decline (Boustani
//     M, et al, Aging Health 2008; Indiana ACB scale).
//   - ARS: each medication is a 1-, 2-, or 3-point anticholinergic; total =
//     1*c1 + 2*c2 + 3*c3; a higher total is associated with greater
//     anticholinergic adverse-effect risk (Rudolph JL, et al, Arch Intern Med
//     2008). The scale is continuous; no official bands.
//   - DBI: for each anticholinergic/sedative medication, D/(D + delta) where D is
//     the daily dose taken and delta the minimum recommended daily dose; DBI =
//     sum of those ratios; higher DBI predicts poorer physical/cognitive function
//     (Hilmer SN, et al, Arch Intern Med 2007). Each division is delta>0-guarded.

import { r2 } from './num.js';

function countOpt(v) {
  // A per-level count: blank -> 0 (absent), else a non-negative integer.
  if (v === null || v === undefined || v === '') return { n: 0, provided: false };
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) return null;
  return { n, provided: true };
}
function numOpt(v) {
  if (v === null || v === undefined || v === '') return undefined; // blank
  const n = Number(v);
  return Number.isFinite(n) ? n : null; // null = invalid
}

// --- 2.1 ACB ------------------------------------------------------------------
const ACB_NOTE = 'Anticholinergic Cognitive Burden (ACB) scale (Boustani M, et al, Aging Health 2008; Indiana ACB scale). Each current medication is read from the published ACB list as a level 1 (possible anticholinergic), level 2, or level 3 (definite anticholinergic). The total ACB = (1 × number of level-1 drugs) + (2 × level-2) + (3 × level-3). Each point is associated with increased cognitive/functional decline; a total of 3 or more is commonly treated as clinically relevant.';

export function anticholinergicBurden(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const c1 = countOpt(o.level1Count);
  const c2 = countOpt(o.level2Count);
  const c3 = countOpt(o.level3Count);
  if (c1 === null || c2 === null || c3 === null) {
    return { valid: false, message: 'Enter each ACB-level drug count as a whole number (0 or more).' };
  }
  if (!c1.provided && !c2.provided && !c3.provided) {
    return { valid: false, message: 'Enter the number of the patient’s drugs at ACB level 1, 2, and/or 3.' };
  }
  const total = 1 * c1.n + 2 * c2.n + 3 * c3.n;
  const relevant = total >= 3;
  return {
    valid: true,
    total,
    relevant,
    bandLabel: `ACB ${total}`,
    band: `ACB ${total} — ${relevant ? 'clinically relevant anticholinergic burden (≥ 3)' : 'below the commonly-cited cut (0–2)'}`,
    detail: `${c1.n} level-1, ${c2.n} level-2, ${c3.n} level-3 drug(s); total = 1×${c1.n} + 2×${c2.n} + 3×${c3.n}.`,
    note: ACB_NOTE,
  };
}

// --- 2.2 ARS ------------------------------------------------------------------
const ARS_NOTE = 'Anticholinergic Risk Scale (ARS) (Rudolph JL, et al, Arch Intern Med 2008). Each current medication is read from the published ARS list as a 1-, 2-, or 3-point anticholinergic. The total ARS = (1 × number of 1-point drugs) + (2 × 2-point) + (3 × 3-point). A higher total is associated with greater risk of anticholinergic adverse effects, peripheral and central. The scale is continuous; it defines no official cut-points.';

export function anticholinergicRiskScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const c1 = countOpt(o.point1Count);
  const c2 = countOpt(o.point2Count);
  const c3 = countOpt(o.point3Count);
  if (c1 === null || c2 === null || c3 === null) {
    return { valid: false, message: 'Enter each ARS-point drug count as a whole number (0 or more).' };
  }
  if (!c1.provided && !c2.provided && !c3.provided) {
    return { valid: false, message: 'Enter the number of the patient’s 1-, 2-, and/or 3-point ARS drugs.' };
  }
  const total = 1 * c1.n + 2 * c2.n + 3 * c3.n;
  return {
    valid: true,
    total,
    bandLabel: `ARS ${total}`,
    band: `ARS ${total} — higher total, greater anticholinergic adverse-effect risk`,
    detail: `${c1.n} one-point, ${c2.n} two-point, ${c3.n} three-point drug(s); total = 1×${c1.n} + 2×${c2.n} + 3×${c3.n}.`,
    note: ARS_NOTE,
  };
}

// --- 2.3 DBI ------------------------------------------------------------------
const DBI_NOTE = 'Drug Burden Index (DBI) (Hilmer SN, et al, Arch Intern Med 2007). For each anticholinergic or sedative medication, the contribution is D ÷ (D + δ), where D is the daily dose taken and δ the minimum recommended daily dose for that drug (read from the formulary). The DBI is the sum of those contributions; a higher DBI predicts poorer physical and cognitive function in older adults. Each ratio is bounded below 1; the δ denominator is positive-guarded.';

export function drugBurdenIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const drugs = Array.isArray(o.drugs) ? o.drugs : [];
  let sum = 0;
  let counted = 0;
  for (const d of drugs) {
    const D = numOpt(d && d.dose);
    const delta = numOpt(d && d.minDose);
    if (D === undefined && delta === undefined) continue; // blank row, skip
    if (D === undefined || delta === undefined || D === null || delta === null) {
      return { valid: false, message: 'Each entered drug needs both a daily dose (D) and a minimum recommended dose (δ).' };
    }
    if (!(delta > 0) || D < 0) {
      return { valid: false, message: 'Minimum dose (δ) must be greater than zero and daily dose (D) non-negative.' };
    }
    sum += D / (D + delta);
    counted += 1;
  }
  if (counted === 0) {
    return { valid: false, message: 'Enter at least one anticholinergic/sedative drug with its daily dose (D) and minimum dose (δ).' };
  }
  const value = r2(sum);
  return {
    valid: true,
    value,
    drugs: counted,
    bandLabel: `DBI ${value}`,
    band: `DBI ${value} — functional medication burden over ${counted} drug(s) (higher = poorer predicted function)`,
    detail: `Sum of D/(D + δ) across ${counted} drug(s).`,
    note: DBI_NOTE,
  };
}
