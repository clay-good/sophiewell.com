// spec-v128 (Wave 5 of the spec-v100 MDCalc Parity Completion program): five
// deterministic renal-excretion and dialysis-math tiles that fill confirmed gaps
// beside fena-feurea and ktv-urr. None duplicates a live tile; each takes lab
// values or dialysis settings as input.
//
//   fepo4    - Fractional excretion of phosphate (renal phosphate-wasting workup)
//   femg     - Fractional excretion of magnesium (0.7 free-fraction correction)
//   npcrPna  - Normalized protein catabolic / nitrogen-appearance rate (g/kg/day)
//   stdKtv   - Standard (weekly, frequency-normalized) Kt/V
//   efwc     - Electrolyte-free water clearance (dysnatremia driver)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v128.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the quantity and the source's framing; the
// management decision stays with the clinician (spec-v11 §5.3). All five are
// Class A (fixed arithmetic / kinetic forms) -- no docs/citation-staleness.md row.
//
// FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - fepo4 (Walton-Bijvoet 1975, Lancet): FEPO4 (%) = (urine PO4 x plasma Cr) /
//     (plasma PO4 x urine Cr) x 100 -- the standard fractional-excretion form. In
//     hypophosphatemia, > ~5% (StatPearls/NIH) suggests renal phosphate wasting;
//     <= 5% points to extra-renal / redistributive loss. (A higher ~20% cutoff is
//     a general / non-hypophosphatemic-context reading, noted but not the flip.)
//   - femg (Elisaf 1998, Miner Electrolyte Metab): FEMg (%) = (urine Mg x plasma
//     Cr) / (0.7 x plasma Mg x urine Cr) x 100. The 0.7 corrects for the ~30%
//     protein-bound, non-filterable plasma fraction. In hypomagnesemia, > ~2%
//     (Elisaf's hypomagnesemia-specific cutoff ~4%) suggests renal magnesium
//     wasting. The 0.7 is applied to the denominator so it never zeroes it.
//   - npcrPna (Depner-Daugirdas 1996, JASN): the two-point urea-kinetic nPCR. The
//     reproducible published form for {post-BUN of the prior session, pre-BUN of
//     the next session, interdialytic interval} is the intradialytic-rise eq
//     nPCR (g/kg/day) = 0.22 + 0.864 x (preBUN - postBUN) / interdialyticHours
//     (0.864 = 0.036 x 24; Renal Fellow Network worked example post 18 / pre 70 /
//     44 h -> 1.24, verbatim). NOTE: the Kt/V-coefficient form's first-of-week and
//     last-of-week coefficient triplets are NOT recoverable from any open source,
//     so they are deliberately NOT shipped (no-fabrication, cf. gwtg-hf). Target
//     ~ 1.0-1.2 g/kg/day; below ~0.8 suggests inadequate protein intake.
//   - stdKtv (Leypoldt 2003, Hemodial Int; FHN fixed-volume form): the weekly
//     frequency-normalized standard Kt/V. eKt/V = spKt/V x t/(t+35) (Tattersall,
//     t in minutes); stdKt/V = (10080 x (1 - e^-eKtV) / t) / ((1 - e^-eKtV)/eKtV +
//     10080/(N x t) - 1), 10080 = minutes per week, N = sessions/week. KDOQI 2015
//     adequacy target >= 2.1/week. Worked: spKt/V 1.4, t 240 min, N 3 -> 2.18.
//   - efwc (Rose 1986, Am J Med): EFWC = urine volume x [1 - (urine Na + urine K) /
//     plasma Na]. SOURCE-GOVERNANCE -- the spec-v128 prose has the sign inverted:
//     a POSITIVE EFWC is net free-water EXCRETION (raises plasma sodium, drives
//     toward hypernatremia / corrects hyponatremia); a NEGATIVE EFWC is net
//     free-water RETENTION (lowers plasma sodium, drives hyponatremia). The flip
//     occurs as (urine Na + urine K) crosses plasma Na. Verified across the
//     Frontiers 2018 review, ScienceDirect, and Rose 1986. The signed result is
//     reported with its sign, never capped.

import { r1, r2 } from './num.js';

const pos = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const nonneg = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const obj = (input) => (input && typeof input === 'object' ? input : {});

// --- 2.1 fepo4 ----------------------------------------------------------------
const FEPO4_NOTE = 'Fractional excretion of phosphate (Walton RJ, Bijvoet OL, Lancet 1975): FEPO4 (%) = (urine phosphate x plasma creatinine) / (plasma phosphate x urine creatinine) x 100. In the workup of hypophosphatemia, a value above about 5% (StatPearls/NIH) suggests renal phosphate wasting, while a value at or below 5% points to an extra-renal or redistributive cause; normal excretion is roughly 10-20%, so the same percentage is read against the plasma phosphate. It frames the excretion fraction; the management decision stays with the clinician.';

export function fepo4(input = {}) {
  const o = obj(input);
  const uPo4 = pos(o.urinePhos);
  const pPo4 = pos(o.plasmaPhos);
  const uCr = pos(o.urineCr);
  const pCr = pos(o.plasmaCr);
  if (uPo4 === null || pPo4 === null || uCr === null || pCr === null) {
    return { valid: false, message: 'Enter urine and plasma phosphate and creatinine (all positive, consistent units within each pair).' };
  }
  const fe = ((uPo4 * pCr) / (pPo4 * uCr)) * 100; // denominator > 0 by guards
  const shown = r1(fe);
  const wasting = shown > 5;
  return {
    valid: true, fe: shown,
    abnormal: wasting,
    band: `FEPO4 ${shown}%: ${wasting ? 'above ~5%, consistent with renal phosphate wasting in hypophosphatemia' : 'at or below ~5%, consistent with appropriate renal conservation (extra-renal or redistributive loss)'}.`,
    note: FEPO4_NOTE,
  };
}

// --- 2.2 femg -----------------------------------------------------------------
const FEMG_NOTE = 'Fractional excretion of magnesium (Elisaf M, Panteli K, Theodorou J, Siamopoulos KC, Miner Electrolyte Metab 1998): FEMg (%) = (urine Mg x plasma creatinine) / (0.7 x plasma Mg x urine creatinine) x 100. The 0.7 corrects for the roughly 30% of plasma magnesium that is protein-bound and not filtered. In the workup of hypomagnesemia, a value above about 2% (Elisaf reported a hypomagnesemia-specific cutoff near 4%) suggests renal magnesium wasting, while a lower value points to an extra-renal cause. It frames the excretion fraction; the management decision stays with the clinician.';

export function femg(input = {}) {
  const o = obj(input);
  const uMg = pos(o.urineMg);
  const pMg = pos(o.plasmaMg);
  const uCr = pos(o.urineCr);
  const pCr = pos(o.plasmaCr);
  if (uMg === null || pMg === null || uCr === null || pCr === null) {
    return { valid: false, message: 'Enter urine and plasma magnesium and creatinine (all positive, consistent units within each pair).' };
  }
  const fe = ((uMg * pCr) / (0.7 * pMg * uCr)) * 100; // denominator > 0 by guards
  const shown = r1(fe);
  const wasting = shown > 2;
  return {
    valid: true, fe: shown,
    abnormal: wasting,
    band: `FEMg ${shown}%: ${wasting ? 'above ~2% (Elisaf hypomagnesemia cutoff ~4%), consistent with renal magnesium wasting' : 'at or below ~2%, consistent with an extra-renal cause of magnesium loss'}.`,
    note: FEMG_NOTE,
  };
}

// --- 2.3 npcr-pna -------------------------------------------------------------
const NPCR_NOTE = 'Normalized protein catabolic rate / nitrogen appearance rate (Depner TA, Daugirdas JT, JASN 1996): the two-point urea-kinetic measure of dialysis-nutrition adequacy. For the post-dialysis BUN of one session and the pre-dialysis BUN of the next, nPCR (g/kg/day) = 0.22 + 0.864 x (pre-dialysis BUN - post-dialysis BUN) / interdialytic interval in hours (the 0.864 lumps the urea distribution and per-day constants of the anuric two-point model). The nutrition target is roughly 1.0-1.2 g/kg/day; below about 0.8 suggests inadequate protein intake. It frames protein-intake adequacy; the management decision stays with the clinician.';

export function npcrPna(input = {}) {
  const o = obj(input);
  const post = pos(o.postBun); // mg/dL, end of the prior session
  const pre = pos(o.preBun);   // mg/dL, start of the next session
  const hours = pos(o.hours);  // interdialytic interval
  if (post === null || pre === null || hours === null) {
    return { valid: false, message: 'Enter post-dialysis BUN (prior session), pre-dialysis BUN (next session), and the interdialytic interval (hours).' };
  }
  const rise = pre - post;
  if (rise <= 0) {
    return { valid: false, message: 'The pre-dialysis BUN of the next session must exceed the post-dialysis BUN of the prior session.' };
  }
  const npcr = 0.22 + (0.864 * rise) / hours;
  const shown = r2(npcr);
  const low = shown < 0.8;
  const target = shown >= 1.0 && shown <= 1.2;
  return {
    valid: true, npcr: shown,
    abnormal: low,
    band: `nPCR ${shown} g/kg/day: ${low ? 'below the ~0.8 g/kg/day floor, suggesting inadequate protein intake' : target ? 'within the ~1.0-1.2 g/kg/day nutrition target' : 'outside the ~1.0-1.2 g/kg/day nutrition target'}.`,
    note: NPCR_NOTE,
  };
}

// --- 2.4 std-ktv --------------------------------------------------------------
const STDKTV_NOTE = 'Standard Kt/V (Leypoldt JK, Jaber BL, Zimmerman DL, Hemodial Int 2003; FHN fixed-volume form): the weekly, frequency-normalized dialysis dose that lets thrice-weekly, short-daily, and nocturnal schedules be compared on one axis. The equilibrated Kt/V is eKt/V = single-pool Kt/V x time / (time + 35) (Tattersall, time in minutes); stdKt/V = (10080 x (1 - e^-eKtV) / time) / ((1 - e^-eKtV)/eKtV + 10080/(sessions x time) - 1), where 10080 is the minutes in a week. The KDOQI 2015 weekly adequacy target is at least 2.1/week. It frames the weekly dose; the prescription decision stays with the clinician.';

export function stdKtv(input = {}) {
  const o = obj(input);
  const spk = pos(o.spKtv);
  const tmin = pos(o.minutes);
  const n = pos(o.sessions);
  if (spk === null || tmin === null || n === null) {
    return { valid: false, message: 'Enter the single-pool Kt/V per session, the session time (minutes), and the sessions per week.' };
  }
  const ekt = (spk * tmin) / (tmin + 35);
  const e = Math.exp(-ekt);
  const num = (10080 * (1 - e)) / tmin;
  const denom = (1 - e) / ekt + 10080 / (n * tmin) - 1;
  if (!Number.isFinite(denom) || denom <= 0) {
    return { valid: false, message: 'The schedule is degenerate (check the session time and sessions per week).' };
  }
  const std = num / denom;
  if (!Number.isFinite(std)) {
    return { valid: false, message: 'The schedule is degenerate (check the session time and sessions per week).' };
  }
  const shown = r2(std);
  const adequate = shown >= 2.1;
  return {
    valid: true, std: shown, ekt: r2(ekt),
    abnormal: !adequate,
    band: `Standard Kt/V ${shown}/week (eKt/V ${r2(ekt)}): ${adequate ? 'meets the >= 2.1/week adequacy target' : 'below the >= 2.1/week adequacy target'}.`,
    note: STDKTV_NOTE,
  };
}

// --- 2.5 efwc -----------------------------------------------------------------
const EFWC_NOTE = 'Electrolyte-free water clearance (Rose BD, Am J Med 1986): EFWC = urine volume x [1 - (urine Na + urine K) / plasma Na]. A positive EFWC is net free-water excretion, which raises plasma sodium (drives toward hypernatremia or corrects hyponatremia); a negative EFWC is net free-water retention, which lowers plasma sodium (drives hyponatremia). The result flips sign as the urine Na + K sum crosses the plasma sodium. It frames the free-water balance; the management decision stays with the clinician.';

export function efwc(input = {}) {
  const o = obj(input);
  const vol = pos(o.volume);   // urine volume (L), positive
  const uNa = nonneg(o.urineNa);
  const uK = nonneg(o.urineK);
  const pNa = pos(o.plasmaNa); // denominator, positive
  if (vol === null || uNa === null || uK === null || pNa === null) {
    return { valid: false, message: 'Enter urine volume (L), urine Na, urine K, and plasma Na (plasma Na positive).' };
  }
  const value = vol * (1 - (uNa + uK) / pNa);
  const shown = r2(value);
  const positive = shown > 0;
  const negative = shown < 0;
  return {
    valid: true, efwc: shown,
    abnormal: negative,
    band: `Electrolyte-free water clearance ${shown} L: ${positive ? 'positive, net free-water excretion that raises plasma sodium (toward hypernatremia, or corrects hyponatremia)' : negative ? 'negative, net free-water retention that lowers plasma sodium (drives hyponatremia)' : 'zero, electrolyte-free water in balance'}.`,
    note: EFWC_NOTE,
  };
}
