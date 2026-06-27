# v12 audit - robson

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Robson MS. Classification of caesarean sections. Fetal Matern Med Rev. 2001;12(1):23-39 (WHO-endorsed, 2015 statement on caesarean section rates; cross-verified against the Robson classification reference and the PMC7487109 subgroup study; ≥ 2 sources, spec-v97).

`lib/rheum-ob-v156.js robson()` maps an obstetric case to one of the ten Robson
groups — the WHO-endorsed cesarean-audit standard. A deterministic input → group
mapping (spec-v100 §2 classification clarification). Group G, Class A.

## Source-governance notes
- Decision precedence (so the mapping is single-valued): multiple pregnancy → 8;
  else single + transverse/oblique lie → 9; else single breech → 6 (nullipara) /
  7 (multipara); else single cephalic preterm → 10; else single cephalic term with
  a previous cesarean → 5; else single cephalic term, no previous cesarean →
  nullipara {spontaneous 1, induced 2a, pre-labor CS 2b} / multipara {spontaneous
  3, induced 4a, pre-labor CS 4b}.
- Groups 5–10 include cases with a previous cesarean **by design** (group 5 is the
  term single-cephalic previous-cesarean group; 7/8/9/10 each subsume previous
  cesareans of their respective presentation/plurality/gestation).
- Onset of labor is only consulted for the groups 1–4 split; it is irrelevant to
  5–10, so the compute does not require it there (and the renderer labels it
  "only used for groups 1–4").
- **Citation class:** the WHO endorsement is recorded in the interpretation text,
  not the machine-read `citation` field, so the WHO acronym (which IS in
  ISSUER_PATTERN) does not force a staleness row; the primary citation is Robson
  2001. Class A.

## Boundary worked examples added
- the tile example (nullipara-induced-cephalic-term → Group 2a); the full 1–4
  split; the 5–10 precedence cases (5, 6, 7, 8, 9, 10); a **full 144-combination
  enumeration asserting TOTALITY and MUTUAL EXCLUSIVITY** (every valid combination
  maps to exactly one of the ten groups); an incomplete combination → a surfaced
  complete-the-fields fallback (including the onset-missing path for groups 1–4).

## Edge-input handling notes
- A missing parity / presentation / plurality / gestation surfaces a
  complete-the-fields fallback; the groups-1–4 path additionally requires onset.
  Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Six labelled selects; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
