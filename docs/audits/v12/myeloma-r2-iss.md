# v12 audit - myeloma-r2-iss

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: D'Agostino M, Cairns DA, Lahuerta JJ, et al. Second revision of the International Staging System (R2-ISS) for overall survival in multiple myeloma: a European Myeloma Network (EMN) report within HARMONY. J Clin Oncol. 2022;40(29):3406-3418.

`lib/onc-v134.js myelomaR2Iss()` returns the additive R2-ISS score and the four-tier stratum (I-IV). Class A (fixed additive weights; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / weight note
- Additive weights: ISS II = 1.0, ISS III = 1.5; high LDH = 1.0; del(17p) = 1.0; t(4;14) = 1.0; gain/amp 1q21 = 0.5.
- TOTAL RANGE 0-5, NOT the spec draft's "0-3.0". The spec prose conflated the IV-stratum threshold (which opens at 3.0) with the score ceiling; the maximum additive score is ISS-III(1.5)+LDH(1.0)+del17p(1.0)+t(4;14)(1.0)+1q(0.5) = 5.0. Corrected here and pinned by a max-score test.
- Strata: 0 = I (low); 0.5-1 = II (low-intermediate); 1.5-2.5 = III (intermediate-high); 3-5 = IV (high). Median OS not-reached / ~109 / ~69 / ~38 months.

## Boundary worked examples added
- 0 -> I; the 0.5 (1q only) crossing to II; ISS II + LDH = 2.0 -> III; ISS III + LDH + 1q = 3.0 -> IV; the 5.0 maximum clamps into IV.

## Edge-input handling notes
- An unselected ISS stage or any blank flag surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- One labeled ISS-stage select + four labeled yes/no selects; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
