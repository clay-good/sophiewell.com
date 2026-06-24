# v12 audit - palliative-prognostic-index

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Morita T, Tsunoda J, Inoue S, Chihara S. The Palliative Prognostic Index. Support Care Cancer. 1999;7(3):128-133 (cross-verified against the PubMed primary abstract, PMID 10335930, the Brazilian PPI validation table PMC8183653, and MDApp).

`lib/rheum-v148.js palliativePrognosticIndex()` sums the PPS band, oral intake,
edema, dyspnea at rest, and delirium 0-15 and reports the survival band. Class A.

## Source-governance notes
- PPS >= 60 -> 0, 30-50 -> 2.5, 10-20 -> 4; oral intake normal 0 / moderate 1 /
  mouthfuls-or-less 2.5; edema 1; dyspnea at rest 3.5; delirium 4 (delirium caused
  by a single medication is EXCLUDED). Maximum 15.
- PPI > 6 predicts survival < 3 weeks (sens 80%, spec 85%); > 4 predicts < 6
  weeks; <= 4 suggests > 6 weeks. The > 6 / > 4 boundaries are strict.

## Boundary worked examples added
- PPS10-20 + mouthfuls + delirium = 10.5 -> < 3 weeks; the > 6 boundary (6.0 vs
  7.0); the > 4 boundary (4.0 vs 4.5); all-zero 0/15; maximum 15.

## Edge-input handling notes
- Two required selects + three checkboxes; a blank select surfaces a
  complete-the-fields fallback. r1()/num() bound the 0-15 total. Covered by the
  spec-v59 fuzz harness, zero leaks.

## A11y / keyboard notes
- Two labeled selects + three checkboxes; output aria-live. 320px sweep, no
  hscroll.

## Defects opened
- none

## Status
- PASS
