# v12 audit - sle-2019-eular-acr

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Aringer M, Costenbader K, Daikh D, et al. 2019 EULAR/ACR classification criteria for SLE. Arthritis Rheumatol. 2019;71(9):1400-1412 (every weight cross-verified against the Merck Manual professional table and the Aringer 2019 full text; >= 2 sources, spec-v97; zero discrepancies).

`lib/rheum-v160.js sle2019EularAcr()` applies the entry gate, within-domain
max-weight rule, and dual threshold. Group G, Class A.

## Source-governance notes
- ANA >= 1:80 ever is a HARD ENTRY GATE (no ANA -> not classified regardless of
  total). 7 clinical + 3 immunologic domains; only the highest-weighted item per
  domain counts. Classify if entry met AND weighted total >= 10 AND >= 1 clinical.
- Full weight table re-fetched verbatim: fever 2; leukopenia 3, thrombocytopenia
  4, hemolysis 4; delirium 2, psychosis 3, seizure 5; alopecia 2, oral ulcers 2,
  subacute/discoid 4, acute cutaneous 6; effusion 5, pericarditis 6; joints 6;
  proteinuria 4, biopsy II/V 8, biopsy III/IV 10; antiphospholipid 2; low C3 or
  C4 3, low C3 and C4 4; anti-dsDNA or anti-Sm 6.

## Boundary worked examples added
- the tile example (entry + joint 6 + dsDNA 6 = 12 classifies); the hard ANA
  entry gate; the within-domain max-weight rule (two hematologic items count once
  at the max); the >= 1-clinical requirement when immunologic points reach 10;
  entry met but total < 10.

## Edge-input handling notes
- An unmet entry gate renders the "entry criterion not met" state rather than a
  misleading score. The spec-v59 fuzz harness confirms no non-finite leak.

## A11y / keyboard notes
- The entry checkbox + 21 weighted-item checkboxes, each labelled with its weight;
  output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
