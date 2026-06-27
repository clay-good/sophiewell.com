# v12 audit - visual-acuity-converter

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Holladay JT. J Cataract Refract Surg. 2004;30(2):287-290 (logMAR/decimal/Snellen relations cross-verified against standard optometric references; ≥ 2 sources, spec-v97).

`lib/ophtho-v164.js visualAcuityConverter()` computes the Visual Acuity Converter. Group E, Class A.

## Source-governance notes
- logMAR = log10(Snellen denominator/20) = −log10(decimal); decimal = 20/denominator = 10^(−logMAR); metric 6/x is the same ratio.
- Round-trip stable: 20/40 ↔ logMAR 0.3 ↔ decimal 0.5 across every entry notation.
- Negative zero from −log10(1) normalized to 0; log/division domains guarded (decimal > 0).

## Boundary worked examples added
- 20/40 → decimal 0.5, logMAR 0.3, 6/12; 20/20 → decimal 1.0 / logMAR 0; logMAR −0.1 → decimal > 1; blank/zero value → valid:false.

## Edge-input handling notes
- low-vision CF/HM/LP categories are out of numeric scope (noted); logMAR range-checked to [−1,3]. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- A notation select + one labelled number input; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
