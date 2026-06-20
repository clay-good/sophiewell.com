# v12 audit - psa-density

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Benson MC, et al. J Urol. 1992;147(3 Pt 2):815-816. Cross-read against StatPearls NBK557495 and PMC7672084 (PSA density thresholds).

`lib/uro-v130.js psaDensity()` computes PSA density = serum PSA (ng/mL) / prostate volume (cc), flagging > 0.15 ng/mL/cc. Class A (journal+author citation — no docs/citation-staleness.md row).

## Source-governance / threshold note
- The 0.15 ng/mL/cc benchmark is a widely cited convention (not an absolute Benson-mandated
  rule; sensitivity is debated). The tile frames it as a suspicion threshold, not a verdict.
- The volume input is the same ellipsoid volume the prostate-volume tile produces; the two
  are cross-linked.

## Boundary worked examples added
- PSA 6 / volume 30 → 0.2 ng/mL/cc (above 0.15, flagged).
- PSA 6 / volume 40 → 0.15 ng/mL/cc exactly (at threshold, not flagged; strict > 0.15).
- blank field → valid:false; zero volume → valid:false (denominator guarded); scalar → valid:false.

## Edge-input handling notes
- Both inputs must be positive; density rounded to three decimals so the displayed value is
  precise; band classified on the rounded density (> 0.15 strict).

## A11y / keyboard notes
- Two number inputs each labeled; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
