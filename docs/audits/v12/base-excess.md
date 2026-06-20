# v12 audit - base-excess

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Siggaard-Andersen O. The Van Slyke equation. Scand J Clin Lab Invest Suppl. 1977;146:15-20. Constants reconciled against Lang W, Zander R. Clin Chem Lab Med 2002;40:404-410 (NCCLS C12-T2 pairing) and CLSI.

`lib/acidbase-v129.js baseExcess()` computes BE = (1 − 0.0143×Hb) × (HCO3 − 24.8 + (9.5 + 1.63×Hb) × (pH − 7.4)), hemoglobin in g/dL. Class A (journal+author citation, no ISSUER_PATTERN trip — no docs/citation-staleness.md row).

## Source-governance / constant-pairing note
- Lang & Zander warn against crossing editions of the Van Slyke constants. The NCCLS
  C12-T2 pairing (24.8 ↔ 9.5/1.63, factor 0.0143) is kept intact; it reproduces the
  published −13.0 mEq/L for pH 7.20 / HCO3 15 / Hb 15. The alternative SA-1974 pairing
  (24.1 ↔ 7.7/1.43) was NOT mixed in.
- The zero point is HCO3 24.8 at pH 7.4 (the NCCLS reference bicarbonate). Negative =
  base deficit (metabolic acidosis); positive = base excess (metabolic alkalosis).

## Boundary worked examples added
- neutral: pH 7.4, HCO3 24.8, Hb 15 → BE 0 (sign flip point).
- metabolic acidosis: pH 7.2, HCO3 15, Hb 15 → BE −13.0 (base deficit, flagged).
- metabolic alkalosis: pH 7.55, HCO3 34, Hb 14 → BE +11.2 (base excess).
- any blank field → valid:false; scalar input → valid:false.

## Edge-input handling notes
- pH, HCO3, and Hb all require positive values (pos). Signed BE reported with an explicit
  leading + for positive values; never capped. Band classified on the rounded BE.

## A11y / keyboard notes
- Three number inputs each labeled; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
