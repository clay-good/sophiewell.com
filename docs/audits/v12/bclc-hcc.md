# v12 audit - bclc-hcc

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Llovet JM, et al. Semin Liver Dis 1999;19(3):329-338; Reig M, et al. J Hepatol 2022;76(3):681-693 (stage boundaries cross-verified against the BCLC 1999 and 2022 algorithms; >= 2 sources, spec-v97).

`lib/onc-staging-v187.js bclcHcc()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- maps ECOG, tumor burden, and Child-Pugh to stage 0/A/B/C/D with a guideline-linked strategy; the strategy is not an order.

## Boundary worked examples added
- intermediate -> B (TACE); very-early -> 0; early -> A; PS 1-2 or spread -> C; Child C / PS >= 3 -> D; missing/invalid -> valid:false.

## Edge-input handling notes
- ECOG / Child / burden are enum-validated; an out-of-range ECOG or missing input surfaces a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
