# v12 audit - myeloma-iss

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Greipp PR, San Miguel J, Durie BGM, et al. International staging system for multiple myeloma. J Clin Oncol. 2005;23(15):3412-3420. Two independent fetches returned identical thresholds.

`lib/onc-v134.js myelomaIss()` returns the ISS stage (I-III) from serum beta2-microglobulin and serum albumin. Class A (fixed derivation paper; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / threshold note
- Stage I = beta2-microglobulin < 3.5 mg/L AND albumin >= 3.5 g/dL (median OS ~62 months).
- Stage III = beta2-microglobulin >= 5.5 mg/L, regardless of albumin (median OS ~29 months). The beta2M >= 5.5 limb governs over albumin.
- Stage II = neither (median OS ~44 months).
- The 62/44/29-month medians are the 2005 derivation-cohort values and pre-date current therapy; reported as prognostic framing, not a treatment trigger.

## Boundary worked examples added
- The 3.5 beta2M edge and the 3.5 albumin inclusive edge for stage I; the 5.5 beta2M edge for stage III (5.49 -> II, 5.5 -> III); a low-beta2M/low-albumin case that is stage II not I.

## Edge-input handling notes
- A blank or non-positive beta2M/albumin surfaces valid:false rather than a guessed stage. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Two labeled number inputs; output aria-live="polite". 320px sweep, no hscroll; renders the spec-v50 §3 clinical-posture note.

## Defects opened
- none
