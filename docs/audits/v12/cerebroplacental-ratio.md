# v12 audit - cerebroplacental-ratio

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Gramellini D, Folli MC, Raboni S, et al. Obstet Gynecol. 1992;79(3):416-420 (CPR ratio and < 1 threshold cross-verified against fetal-Doppler references; ≥ 2 sources, spec-v97).

`lib/oneformula-v167.js cerebroplacentalRatio()` computes the Cerebroplacental Ratio. Group E, Class A.

## Source-governance notes
- CPR = MCA-PI / UA-PI; the UA-PI denominator is guarded.
- A CPR below 1 (or below the gestational-age centile) indicates cerebral redistribution / brain-sparing.
- The < 1 cutoff is flagged with a note to compare against gestational-age reference ranges.

## Boundary worked examples added
- MCA 1.2 / UA 1.5 → CPR 0.8 (redistribution); MCA 1.8 / UA 1.0 → 1.8 normal; CPR exactly 1 not flagged; zero UA-PI → valid:false.

## Edge-input handling notes
- MCA/UA guarded > 0; ratio range-checked. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Two labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
