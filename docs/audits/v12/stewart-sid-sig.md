# v12 audit - stewart-sid-sig

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Stewart PA. Can J Physiol Pharmacol. 1983;61(12):1444-1461; Figge J, Mydosh T, Fencl V. J Lab Clin Med. 1992;120(5):713-719. Cross-read against Fencl V, et al. Am J Respir Crit Care Med 2000;162:2246 and the acid-base.org Figge-Fencl reference model.

`lib/acidbase-v129.js stewartSidSig()` computes apparent SID = (Na + K + Ca + Mg) − (Cl + lactate), effective SID = HCO3 + albumin charge + phosphate charge, and SIG = SIDa − SIDe. Class A (journal+author citation, no ISSUER_PATTERN trip — no docs/citation-staleness.md row).

## Source-governance / assumed-pH note
- The Figge weak-acid charges are pH-dependent. The spec-v129 §2.1 input set omits pH,
  so the charges are evaluated at the physiologic pH 7.4, giving the fixed bedside
  coefficients albumin 2.8 mEq/L per g/dL [(0.123×7.4 − 0.631)×10 = 2.79] and phosphate
  0.59 mEq/L per mg/dL [(0.309×7.4 − 0.469)/3.097 = 0.587]. This assumption is stated to
  the user in the tile note. The effective-SID approximation substitutes measured HCO3
  for the carbonic-acid term (valid bedside simplification).
- Ca and Mg are taken as ionized concentrations in mEq/L (the canonical Fencl/Kellum
  six-ion SIDa form); the renderer labels both inputs accordingly.

## Boundary worked examples added
- elevated SIG: Na 140, K 4, Ca 2.4, Mg 1, Cl 100, lactate 2, HCO3 14, alb 4, phos 4 →
  SIDa 45.4, SIDe 27.6, SIG 17.8 (unmeasured-anion flip, flagged).
- low/negative SIG: Cl 110, lactate 1, HCO3 24, alb 4.5, phos 3.5 → SIG −2.3 (none).
- threshold sits at SIG 2 mEq/L (a constructed case lands SIG 2.4, flagged).
- any blank required field → valid:false; scalar input → valid:false.

## Edge-input handling notes
- Na/K/Cl accept any finite value (fin); Ca/Mg/lactate/albumin/phosphate non-negative;
  bicarbonate must be positive (denominator-free but kept physiologic). Signed SIG
  reported, never capped. Band classified on the rounded SIG so the shown sign matches.

## A11y / keyboard notes
- Nine number inputs each labeled; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
