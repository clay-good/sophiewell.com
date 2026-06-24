# v12 audit - gout-acr-eular-2015

- Auditor: CG
- Date: 2026-06-24
- Citation re-verified against: Neogi T, Jansen TLTA, Dalbeth N, et al. 2015 Gout classification criteria. Arthritis Rheumatol. 2015;67(10):2557-2568 (point values, including both negative scores, verified verbatim against the official ACR/EULAR criteria-table PDF behind the University of Auckland web calculator and PMC4602275; corroborated by MDCalc /calc/10084).

`lib/rheum-v147.js goutAcrEular2015()` enforces the entry criterion, short-circuits
on the MSU-crystal sufficient criterion, then sums the weighted domains to a maximum
23 and applies the >=8 classification threshold. Class B (documentation-only row).

## Source-governance notes
- Entry criterion: >= 1 episode of swelling, pain, or tenderness in a peripheral
  joint or bursa. Enforced first.
- Sufficient criterion: MSU crystals in a symptomatic joint/bursa or tophus ->
  classify directly, no scoring.
- Weighted domains: pattern (other 0 / ankle-midfoot 1 / 1st MTP 2), characteristics
  (0-3), time-course (none 0 / one 1 / recurrent 2), tophus (0/4), serum urate
  (<4 = -4, 4-<6 = 0, 6-<8 = 2, 8-<10 = 3, >=10 = 4), synovial fluid (not done 0,
  MSU-negative -2), imaging urate deposition (0/4), imaging erosion (0/4). Max 23.
- TWO NEGATIVE ITEMS, confirmed with sign: serum urate <4 mg/dL is -4, MSU-negative
  synovial is -2. "Not done" scores 0, distinct from the negative finding.
- Threshold: total >= 8 classifies as gout.

## Boundary worked examples added
- entry not met -> not applicable; MSU bypass -> classified, no score.
- weighted 7 not classified / 8 classified; tile example 9 -> gout.
- both negatives -> -6 (sign check); tophus + imaging checkboxes add 4 each.

## Edge-input handling notes
- Five required selects after the entry gate; a blank select -> complete-the-fields.
  Negative items mean the total can dip below 0, but the threshold compare is plain.
  Bounded integer total -6..23. Covered by the spec-v59 fuzz harness, zero leaks.

## A11y / keyboard notes
- Two labeled checkboxes (entry, MSU) + five selects + three checkboxes; output
  aria-live. 320px sweep, no hscroll.

## Defects opened
- none
