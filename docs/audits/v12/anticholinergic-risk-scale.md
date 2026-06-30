# v12 audit - anticholinergic-risk-scale

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Rudolph JL, Salow MJ, Angelini MC, McGlinchey RE. The Anticholinergic Risk Scale and anticholinergic adverse effects in older persons. Arch Intern Med. 2008;168(5):508-513. The 1/2/3 point structure and the continuous (no official cut) interpretation cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v179.js anticholinergicRiskScale()` computes total = 1*c1 + 2*c2 + 3*c3. Group G, Class A.

## Source-governance notes
- Per the §2 clarification the tile consumes per-point COUNTS read from the published ARS list; no drug database is embedded.
- Total = sum(point x count); higher total = greater anticholinergic adverse-effect risk; no official bands. Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- total = sum(point x count); single-field and all-blank handling; non-integer/negative -> valid:false.

## Edge-input handling notes
- Counts non-negative integers, blank -> 0; all-blank or invalid -> valid:false; never NaN (spec-v59 fuzz pass).
